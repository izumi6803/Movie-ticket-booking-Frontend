"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Movie, Theater, Showtime, Seat, Concession, BookingFlowState, BookingSeat, OrderItem } from "@/types";
import { theatersApi, showtimesApi, seatsApi, concessionsApi, bookingsApi, paymentApi, seatLockApi } from "@/services/api";
import { useAsyncState } from "@/hooks/useAsyncState";
import { LoadingState } from "@/components/ui/states";
import { Clock, MapPin, Armchair, ShoppingCart, QrCode, Check, Calendar } from "lucide-react";
import { formatVND } from "@/lib/currency";

interface BookingFlowProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingFlow({ movie, isOpen, onClose }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [flowState, setFlowState] = useState<BookingFlowState>({
    step: 1,
    selectedSeats: [],
    concessions: [],
  });
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "success" | "failed">("waiting");
  const [seatLockId, setSeatLockId] = useState<string>("");
  const [lockExpiryTime, setLockExpiryTime] = useState<Date | null>(null);
  const [lockCountdown, setLockCountdown] = useState<number>(0);

  const theatersState = useAsyncState<Theater[]>();
  const showtimesState = useAsyncState<Showtime[]>();
  const seatsState = useAsyncState<Seat[]>();
  const concessionsState = useAsyncState<Concession[]>();

  // Countdown timer for seat lock
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (lockExpiryTime && seatLockId) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = lockExpiryTime.getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setLockCountdown(remaining);
        
        if (remaining === 0) {
          // Lock expired, release seats
          setSeatLockId("");
          setLockExpiryTime(null);
          setFlowState((prev) => ({
            ...prev,
            selectedSeats: [],
          }));
          alert("Your seat reservation has expired. Please select seats again.");
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockExpiryTime, seatLockId]);

  // Cleanup lock when dialog closes
  useEffect(() => {
    return () => {
      if (seatLockId) {
        seatLockApi.unlockSeats(seatLockId).catch(console.error);
      }
    };
  }, [seatLockId]);

  // Load theaters when dialog opens
  useEffect(() => {
    if (isOpen && step === 1) {
      loadTheaters();
      loadConcessions();
    }
  }, [isOpen]);

  const loadTheaters = async () => {
    theatersState.execute(async () => {
      const response = await theatersApi.getAll();
      if (response.success) {
        return response.data;
      }
      throw new Error("Failed to load theaters");
    });
  };

  const loadConcessions = async () => {
    concessionsState.execute(async () => {
      const response = await concessionsApi.getAll();
      if (response.success) {
        return response.data;
      }
      throw new Error("Failed to load concessions");
    });
  };

  const { data: theaters, isLoading: loadingTheaters } = theatersState;
  const { data: showtimes, isLoading: loadingShowtimes } = showtimesState;
  const { data: seats, isLoading: loadingSeats } = seatsState;
  const { data: concessions, isLoading: loadingConcessions } = concessionsState;

  const handleSelectTheater = async (theater: Theater) => {
    setFlowState((prev) => ({ ...prev, theater, step: 2 }));
    setStep(2);
    
    // Load showtimes for selected theater (all screens)
    const screensResponse = await theatersApi.getScreens(theater.id);
    if (screensResponse.success && screensResponse.data.length > 0) {
      // Get showtimes for all screens in this theater
      const allShowtimes: Showtime[] = [];
      
      for (const screen of screensResponse.data) {
        const response = await showtimesApi.getByMovieAndTheater(movie.id, screen.id);
        if (response.success && response.data) {
          // Transform showtimes to include screen and theater names
          const transformed = response.data.map((st: any) => ({
            ...st,
            screenName: screen.name || "Unknown Screen",
            theaterName: theater.name,
          }));
          allShowtimes.push(...transformed);
        }
      }
      
      // Extract unique dates from showtimes (using local timezone)
      const dates = [...new Set(allShowtimes.map((st) => {
        const localDate = new Date(st.startTime);
        return localDate.getFullYear() + '-' + 
          String(localDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(localDate.getDate()).padStart(2, '0');
      }))].sort();
      
      setAvailableDates(dates);
      
      // Set default date to today if available, otherwise first available date
      const now = new Date();
      const today = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0');
      if (dates.includes(today)) {
        setSelectedDate(today);
      } else if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
      
      showtimesState.setData(allShowtimes);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectShowtime = async (showtime: Showtime) => {
    setFlowState((prev) => ({ ...prev, showtime, step: 3 }));
    setStep(3);
    
    try {
      const response = await seatsApi.getByScreen(showtime.screenId, showtime.id);
      console.log("Seats API response:", response);
      if (response.success) {
        seatsState.setData(response.data);
        console.log("Seats loaded:", response.data?.length, "seats");
        // Check first seat status
        if (response.data && response.data.length > 0) {
          console.log("First seat status:", response.data[0].status);
        }
      } else {
        console.error("Failed to load seats:", response.message);
      }
    } catch (error) {
      console.error("Error loading seats:", error);
    }
  };

  const handleToggleSeat = async (seat: Seat) => {
    // Check if seat is already booked or locked by another user
    if (seat.status === "occupied") {
      alert("This seat is already booked. Please choose another seat.");
      return;
    }
    if (seat.status === "locked") {
      alert("This seat is reserved by another user. Please choose another seat.");
      return;
    }

    const isSelected = flowState.selectedSeats.find((s) => s.seatId === seat.id);
    
    if (isSelected) {
      // Remove seat from selection
      const newSelectedSeats = flowState.selectedSeats.filter((s) => s.seatId !== seat.id);
      setFlowState((prev) => ({
        ...prev,
        selectedSeats: newSelectedSeats,
      }));
      
      // Update lock with new seats
      if (seatLockId && flowState.showtime) {
        try {
          if (newSelectedSeats.length > 0) {
            const lockResponse = await seatLockApi.lockSeats({
              showtimeId: flowState.showtime.id,
              seatIds: newSelectedSeats.map((s) => s.seatId),
              seatLabels: newSelectedSeats.map((s) => s.seatLabel),
            });
            if (lockResponse.success) {
              setSeatLockId(lockResponse.data.lockId);
              setLockExpiryTime(new Date(lockResponse.data.expiresAt));
              setLockCountdown(lockResponse.data.duration);
            }
          } else {
            // Unlock all seats if no seats selected
            await seatLockApi.unlockSeats(seatLockId);
            setSeatLockId("");
            setLockExpiryTime(null);
            setLockCountdown(0);
          }
        } catch (error) {
          console.error("Failed to update seat lock:", error);
        }
      }
    } else {
      // Add seat to selection
      const price = (flowState.showtime?.baseTicketPrice || 0) * seat.priceMultiplier;
      const newSelectedSeats = [
        ...flowState.selectedSeats,
        { seatId: seat.id, seatLabel: `${seat.rowLabel}${seat.seatNumber}`, price },
      ];
      
      setFlowState((prev) => ({
        ...prev,
        selectedSeats: newSelectedSeats,
      }));
      
      // Lock seats - only lock the new seat, not all selected seats
      if (flowState.showtime) {
        try {
          const lockResponse = await seatLockApi.lockSeats({
            showtimeId: flowState.showtime.id,
            seatIds: [seat.id], // Only lock the newly selected seat
            seatLabels: [`${seat.rowLabel}${seat.seatNumber}`],
          });
          
          if (lockResponse.success) {
            setSeatLockId(lockResponse.data.lockId);
            setLockExpiryTime(new Date(lockResponse.data.expiresAt));
            setLockCountdown(lockResponse.data.duration);
          }
        } catch (error) {
          console.error("Failed to lock seats:", error);
          // Don't revert - let user try again
          alert("Failed to lock seat. Please try again.");
        }
      }
    }
  };

  const handleAddConcession = (concession: Concession) => {
    setFlowState((prev) => {
      const existing = prev.concessions.find((c) => c.concessionId === concession.id);
      
      if (existing) {
        return {
          ...prev,
          concessions: prev.concessions.map((c) =>
            c.concessionId === concession.id
              ? { ...c, quantity: c.quantity + 1, totalPrice: (c.quantity + 1) * c.unitPrice }
              : c
          ),
        };
      }
      
      return {
        ...prev,
        concessions: [
          ...prev.concessions,
          {
            concessionId: concession.id,
            concession,
            quantity: 1,
            unitPrice: concession.price,
            totalPrice: concession.price,
          },
        ],
      };
    });
  };

  const handleRemoveConcession = (concessionId: string) => {
    setFlowState((prev) => ({
      ...prev,
      concessions: prev.concessions.filter((c) => c.concessionId !== concessionId),
    }));
  };

  const calculateTotal = () => {
    const ticketTotal = flowState.selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const concessionTotal = flowState.concessions.reduce((sum, c) => sum + c.totalPrice, 0);
    return { ticketTotal, concessionTotal, total: ticketTotal + concessionTotal };
  };

  const [createdBookingId, setCreatedBookingId] = useState<string>("");

  const handleCompleteBooking = async () => {
    const { ticketTotal, concessionTotal, total } = calculateTotal();
    
    const bookingData = {
      showtimeId: flowState.showtime!.id,
      seats: flowState.selectedSeats,
      concessions: flowState.concessions,
      totalTicketPrice: ticketTotal,
      totalConcessionPrice: concessionTotal,
      totalAmount: total,
    };

    const response = await bookingsApi.create(bookingData);
    if (response.success) {
      setCreatedBookingId(response.data.id);
      setStep(5); // Go to payment step
    }
  };

  const handleVNPayPayment = async () => {
    if (!createdBookingId) {
      console.error("No booking ID found");
      return;
    }

    try {
      const { total } = calculateTotal();
      const orderInfo = `Payment for booking ${flowState.showtime?.movie?.title || movie.title || "Movie"}`;

      console.log("Creating VNPay payment for booking:", createdBookingId, "amount:", total);
      
      const response = await paymentApi.createVNPayPayment({
        bookingId: createdBookingId,
        amount: total,
        orderInfo: orderInfo,
      });

      console.log("VNPay response:", response);

      if (response.success && response.data?.paymentUrl) {
        // Save booking ID to session storage for callback
        sessionStorage.setItem("pendingBookingId", createdBookingId);
        sessionStorage.setItem("pendingPaymentAmount", total.toString());
        
        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl;
      } else {
        console.error("Failed to create VNPay payment:", response);
        alert("Failed to create payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating VNPay payment:", error);
      alert("Error creating payment. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Theater</h3>
            {loadingTheaters ? (
              <LoadingState />
            ) : (
              <div className="grid gap-3">
                {theaters?.map((theater) => (
                  <Button
                    key={theater.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleSelectTheater(theater)}
                  >
                    <div className="text-left">
                      <p className="font-semibold">{theater.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {theater.location}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Date & Showtime</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {flowState.theater?.name}
            </p>
            
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectDate(date)}
                    className="flex-shrink-0"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Button>
                ))}
              </div>
            </div>

            {/* Showtimes for selected date - only show after user selects a date */}
            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Showtimes for {new Date(selectedDate).toLocaleDateString()}
                </label>
                {loadingShowtimes ? (
                  <LoadingState />
                ) : showtimes?.filter((st) => {
                    // Convert UTC showtime to local date string for comparison
                    const showtimeLocal = new Date(st.startTime);
                    const showtimeDate = showtimeLocal.getFullYear() + '-' + 
                      String(showtimeLocal.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(showtimeLocal.getDate()).padStart(2, '0');
                    const now = new Date();
                    return showtimeDate === selectedDate && showtimeLocal > now;
                  }).length === 0 ? (
                  <div className="w-full text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="w-full text-muted-foreground">No showtimes available for this date</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {showtimes
                      ?.filter((st) => {
                        // Convert UTC showtime to local date string for comparison
                        const showtimeLocal = new Date(st.startTime);
                        const showtimeDate = showtimeLocal.getFullYear() + '-' + 
                          String(showtimeLocal.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(showtimeLocal.getDate()).padStart(2, '0');
                        const now = new Date();
                        return showtimeDate === selectedDate && showtimeLocal > now;
                      })
                      .map((showtime) => (
                        <Button
                          key={showtime.id}
                          variant="outline"
                          className="w-full justify-between h-auto p-4"
                          onClick={() => handleSelectShowtime(showtime)}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4" />
                            <div className="text-left">
                              <p className="font-semibold">
                                {new Date(showtime.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {showtime.screenName} - ${showtime.baseTicketPrice}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Seats</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                Back
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {flowState.selectedSeats.length} seats
            </p>
            {loadingSeats ? (
              <LoadingState />
            ) : (
              <div className="space-y-2">
                {/* Screen indicator */}
                <div className="w-full h-8 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xs text-muted-foreground">SCREEN</span>
                </div>
                
                {/* Lock Countdown */}
                {seatLockId && lockCountdown > 0 && (
                  <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <p className="w-full text-sm text-yellow-800">
                      ⏱️ Seats reserved for: <span className="font-bold">{Math.floor(lockCountdown / 60)}:{String(lockCountdown % 60).padStart(2, '0')}</span>
                    </p>
                    <p className="w-full text-xs text-yellow-600 mt-1">
                      Complete your booking before time runs out!
                    </p>
                  </div>
                )}

                {/* Legend */}
                <div className="flex gap-4 justify-center text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-secondary rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>

                {/* Seat grid */}
                <div className="grid gap-2">
                  {Array.from(new Set(seats?.map((s) => s.rowLabel))).map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-medium">{row}</span>
                      <div className="flex gap-1">
                        {seats
                          ?.filter((s) => s.rowLabel === row)
                          .map((seat) => {
                            const isSelected = flowState.selectedSeats.find(
                              (s) => s.seatId === seat.id
                            );
                            const isOccupied = seat.status === "occupied";
                            const isLocked = seat.status === "locked";
                            const isDisabled = isOccupied || isLocked;
                            return (
                              <button
                                key={seat.id}
                                onClick={() => !isDisabled && handleToggleSeat(seat)}
                                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : isOccupied
                                    ? "bg-red-500 text-white cursor-not-allowed opacity-70"
                                    : isLocked
                                    ? "bg-yellow-500 text-white cursor-not-allowed opacity-70"
                                    : "bg-secondary hover:bg-secondary/80"
                                }`}
                                disabled={isDisabled}
                                title={
                                  isOccupied 
                                    ? "This seat is already booked" 
                                    : isLocked 
                                    ? "This seat is reserved by another user"
                                    : `Seat ${seat.rowLabel}${seat.seatNumber}`
                                }
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
                
                {flowState.selectedSeats.length > 0 && (
                  <Button className="w-full mt-4" onClick={() => setStep(4)}>
                    Continue ({flowState.selectedSeats.length} seats - {formatVND(flowState.selectedSeats.reduce((sum, s) => sum + s.price, 0))})
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Concessions</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                Back
              </Button>
            </div>
            
            {/* Selected seats summary */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Seats: {flowState.selectedSeats.map((s) => s.seatLabel).join(", ")}</p>
              <p className="text-sm text-muted-foreground">
                Ticket Total: {formatVND(flowState.selectedSeats.reduce((sum, s) => sum + s.price, 0))}
              </p>
            </div>

            {/* Concessions list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {concessions?.map((concession) => {
                const inCart = flowState.concessions.find(
                  (c) => c.concessionId === concession.id
                );
                return (
                  <div
                    key={concession.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{concession.name}</p>
                      <p className="text-sm text-muted-foreground">{concession.description}</p>
                      <p className="text-sm font-medium">{formatVND(concession.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inCart && (
                        <>
                          <span className="text-sm">x{inCart.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveConcession(concession.id)}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddConcession(concession)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total and checkout */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tickets:</span>
                <span>{formatVND(calculateTotal().ticketTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Concessions:</span>
                <span>{formatVND(calculateTotal().concessionTotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatVND(calculateTotal().total)}</span>
              </div>
              <Button className="w-full" onClick={handleCompleteBooking}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Complete Booking
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                Back
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <p className="font-medium">Booking Summary</p>
              <div className="flex justify-between text-sm">
                <span>Movie:</span>
                <span>{flowState.showtime?.movie?.title || movie.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Showtime:</span>
                <span>
                  {flowState.showtime?.startTime
                    ? new Date(flowState.showtime.startTime).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Seats:</span>
                <span>{flowState.selectedSeats.map((s) => s.seatLabel).join(", ")}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>{formatVND(calculateTotal().total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Select Payment Method</p>
              
              <Button
                className="w-full h-auto p-4 justify-start"
                onClick={handleVNPayPayment}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    VNP
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Pay with VNPay</p>
                    <p className="text-sm text-muted-foreground">
                      Online banking payment
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-4 justify-start"
                onClick={() => {
                  setStep(6);
                  setTimeout(() => {
                    onClose();
                    router.push("/customer/tickets");
                  }, 3000);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Pay Later</p>
                    <p className="text-sm text-muted-foreground">
                      Complete payment at the cinema
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="w-full text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
            <p className="w-full text-muted-foreground">
              Your tickets have been booked successfully.
            </p>
            <div className="bg-muted p-4 rounded-lg inline-block">
              <QrCode className="h-32 w-32 mx-auto" />
              <p className="w-full text-sm text-muted-foreground mt-2">Show this QR code at the entrance</p>
            </div>
            <p className="w-full text-sm text-muted-foreground">Redirecting to My Tickets...</p>
          </div>
        );

      case 7:
        return (
          <div className="w-full text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Waiting for Payment</h3>
            <p className="w-full text-muted-foreground">
              Please complete the payment in the VNPay window.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Do not close this window until payment is complete.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  // Check payment status
                  if (createdBookingId) {
                    paymentApi.checkPaymentStatus(createdBookingId).then((response) => {
                      if (response.success && response.data?.status === "paid") {
                        setStep(8); // Go to payment success page
                      } else {
                        alert("Payment not completed yet. Please complete payment in VNPay window.");
                      }
                    });
                  }
                }}
              >
                Check Payment Status
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                  router.push("/customer/tickets");
                }}
              >
                View My Tickets
              </Button>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="w-full text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Payment Successful!</h3>
            <p className="w-full text-muted-foreground">
              Your payment has been completed successfully.
            </p>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Status:</strong> Paid
              </p>
              <p className="text-sm text-green-800">
                <strong>Booking ID:</strong> {createdBookingId}
              </p>
            </div>
            <p className="w-full text-sm text-muted-foreground">Redirecting to My Tickets...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Tickets - {movie.title}</DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { num: 1, label: "Theater" },
            { num: 2, label: "Date & Time" },
            { num: 3, label: "Seats" },
            { num: 4, label: "Extras" },
            { num: 5, label: "Payment" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.num}
              </div>
              <span className="text-xs hidden sm:inline">{s.label}</span>
              {s.num < 5 && <div className="w-4 h-px bg-border" />}
            </div>
          ))}
        </div>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

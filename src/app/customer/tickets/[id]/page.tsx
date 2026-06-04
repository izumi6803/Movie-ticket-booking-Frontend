"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { bookingsApi } from "@/services/api";
import { Booking } from "@/types";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Ticket,
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Film,
  Monitor,
  Armchair
} from "lucide-react";
import { formatVND } from "@/lib/currency";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadTicketDetail(params.id as string);
    }
  }, [params.id]);

  const loadTicketDetail = async (bookingId: string) => {
    try {
      setIsLoading(true);
      const response = await bookingsApi.getById(bookingId);
      if (response.success) {
        setBooking(response.data);
      } else {
        setError("Ticket not found");
      }
    } catch {
      setError("Failed to load ticket details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          color: "bg-green-500/10 text-green-600 border-green-200",
          label: "Confirmed"
        };
      case "pending":
        return {
          icon: Clock4,
          color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
          label: "Pending Payment"
        };
      case "cancelled":
        return {
          icon: AlertCircle,
          color: "bg-red-500/10 text-red-600 border-red-200",
          label: "Cancelled"
        };
      case "expired":
        return {
          icon: AlertCircle,
          color: "bg-gray-500/10 text-gray-600 border-gray-200",
          label: "Expired"
        };
      case "completed":
        return {
          icon: CheckCircle2,
          color: "bg-blue-500/10 text-blue-600 border-blue-200",
          label: "Completed"
        };
      default:
        return {
          icon: AlertCircle,
          color: "bg-gray-500/10 text-gray-600 border-gray-200",
          label: status
        };
    }
  };

  const generateQRData = (booking: Booking) => {
    return JSON.stringify({
      bookingCode: booking.bookingCode,
      bookingId: booking.id,
      movie: booking.showtime?.movie?.title,
      seats: (booking.bookingSeats || booking.seats || [])?.map((s) => s.seatLabel).join(", "),
      amount: booking.totalAmount,
      status: booking.status,
    });
  };

  if (isLoading) return <LoadingState message="Loading ticket details..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadTicketDetail(params.id as string)} />;
  if (!booking) return <ErrorState message="Ticket not found" onRetry={() => router.push("/customer/tickets")} />;

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const qrData = generateQRData(booking);

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/customer/tickets")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tickets
        </Button>

        {/* Ticket Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5 text-primary" />
              <Badge className={`${statusConfig.color} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {booking.showtime?.movie?.title || "Unknown Movie"}
            </h1>
            <p className="text-muted-foreground">
              Booking #{booking.bookingCode}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Film className="h-5 w-5 text-primary" />
                  Movie Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {booking.showtime?.startTime
                            ? new Date(booking.showtime.startTime).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">
                          {booking.showtime?.startTime
                            ? new Date(booking.showtime.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Theater</p>
                        <p className="font-medium">{booking.showtime?.screen?.theater?.name || "Unknown Theater"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Monitor className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Screen</p>
                        <p className="font-medium">{booking.showtime?.screen?.name || "Unknown Screen"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Armchair className="h-5 w-5 text-primary" />
                  Seat Information
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  {(booking.bookingSeats || booking.seats || [])?.map((s) => (
                    <Badge 
                      key={s.seatId} 
                      variant="secondary"
                      className="bg-primary/10 text-primary text-lg px-4 py-2"
                    >
                      {s.seatLabel}
                    </Badge>
                  )) || <span className="text-muted-foreground">No seats selected</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - QR & Actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Ticket QR Code
                </h2>
                
                <div className="bg-white p-6 rounded-xl border-2 border-dashed border-border/50 shadow-inner mb-4">
                  <svg 
                    viewBox="0 0 200 200" 
                    className="w-full h-auto max-w-[200px] mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="200" height="200" fill="white"/>
                    
                    {Array.from({ length: 25 }).map((_, row) =>
                      Array.from({ length: 25 }).map((_, col) => {
                        const charIndex = (row * 25 + col) % qrData.length;
                        const charCode = qrData.charCodeAt(charIndex);
                        const isFilled = (charCode + row + col) % 2 === 0;
                        
                        const isTopLeft = row < 7 && col < 7;
                        const isTopRight = row < 7 && col >= 18;
                        const isBottomLeft = row >= 18 && col < 7;
                        
                        if (isTopLeft || isTopRight || isBottomLeft) {
                          return null;
                        }
                        
                        return isFilled ? (
                          <rect
                            key={`${row}-${col}`}
                            x={col * 8}
                            y={row * 8}
                            width="8"
                            height="8"
                            fill="black"
                          />
                        ) : null;
                      })
                    )}
                    
                    <g>
                      <rect x="0" y="0" width="56" height="56" fill="black"/>
                      <rect x="8" y="8" width="40" height="40" fill="white"/>
                      <rect x="16" y="16" width="24" height="24" fill="black"/>
                    </g>
                    
                    <g>
                      <rect x="144" y="0" width="56" height="56" fill="black"/>
                      <rect x="152" y="8" width="40" height="40" fill="white"/>
                      <rect x="160" y="16" width="24" height="24" fill="black"/>
                    </g>
                    
                    <g>
                      <rect x="0" y="144" width="56" height="56" fill="black"/>
                      <rect x="8" y="152" width="40" height="40" fill="white"/>
                      <rect x="16" y="160" width="24" height="24" fill="black"/>
                    </g>
                  </svg>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full rounded-full gap-2" 
                    onClick={() => navigator.clipboard.writeText(qrData)}
                  >
                    <Download className="h-4 w-4" />
                    Copy QR Data
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full rounded-full gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4" />
                    Print Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Price</span>
                    <span>{formatVND(booking.totalTicketPrice || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concessions</span>
                    <span>{formatVND(booking.totalConcessionPrice || 0)}</span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatVND(booking.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { bookingsApi } from "@/services/api";
import { Booking } from "@/types";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  Ticket, 
  Trash2, 
  Download,
  Sparkles,
  TrendingUp,
  Film,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock4
} from "lucide-react";
import { formatVND } from "@/lib/currency";
import { useRouter } from "next/navigation";

export default function CustomerTicketsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const response = await bookingsApi.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch {
      setError("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all your bookings? This cannot be undone.")) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await bookingsApi.clearMyBookings();
      if (response.success) {
        setBookings([]);
      }
    } catch {
      setError("Failed to clear bookings");
    } finally {
      setIsLoading(false);
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

  const handleShowQR = (booking: Booking) => {
    const qrData = generateQRData(booking);
    setSelectedQR(qrData);
    setIsQRDialogOpen(true);
  };

  const handleCopyQR = () => {
    if (selectedQR) {
      navigator.clipboard.writeText(selectedQR);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
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

  if (isLoading) return <LoadingState message="Loading tickets..." />;
  if (error) return <ErrorState message={error} onRetry={loadTickets} />;

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {bookings.length} Tickets
                </Badge>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                My Tickets
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                View and manage your booking history
              </p>
            </div>
            
            {bookings.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearAll}
                className="rounded-full gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <div className="relative inline-block mb-6">
              <Ticket className="h-16 w-16 text-muted-foreground/50" />
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No tickets found</p>
            <p className="text-sm text-muted-foreground mb-6">Book your first movie ticket now!</p>
            <Button 
              onClick={() => router.push("/customer/movies")}
              className="rounded-full gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              Browse Movies
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card 
                  key={booking.id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Movie Poster */}
                      <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gradient-to-br from-muted to-muted/50">
                        {booking.showtime?.movie?.posterUrl ? (
                          <img
                            src={booking.showtime.movie.posterUrl}
                            alt={booking.showtime.movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        
                        <div className="absolute top-3 left-3">
                          <Badge className={`${statusConfig.color} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Ticket Info */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-3">
                            <h3 className="text-xl font-bold">
                              {booking.showtime?.movie?.title || "Unknown Movie"}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground">
                              Booking #{booking.bookingCode}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                {booking.showtime?.startTime
                                  ? new Date(booking.showtime.startTime).toLocaleDateString('vi-VN', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : "N/A"}
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                  <Clock className="h-4 w-4 text-primary" />
                                </div>
                                {booking.showtime?.startTime
                                  ? new Date(booking.showtime.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                  <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                {booking.showtime?.screen?.theater?.name || "Unknown Theater"}
                              </div>
                            </div>
                            
                            <div className="pt-2">
                              <p className="text-sm font-medium mb-1">Seats:</p>
                              <div className="flex flex-wrap gap-2">
                                {(booking.bookingSeats || booking.seats || [])?.map((s) => (
                                  <Badge 
                                    key={s.seatId} 
                                    variant="secondary"
                                    className="bg-primary/10 text-primary"
                                  >
                                    {s.seatLabel}
                                  </Badge>
                                )) || <span className="text-sm text-muted-foreground">N/A</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3">
                            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                              {formatVND(booking.totalAmount)}
                            </p>
                            
                            {booking.status === "confirmed" ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShowQR(booking)}
                                className="rounded-full gap-2 bg-green-50 border-green-200 hover:bg-green-100"
                              >
                                <QrCode className="h-4 w-4 text-green-600" />
                                <span className="text-green-700">Show QR</span>
                              </Button>
                            ) : booking.status === "pending" ? (
                              <Button 
                                size="sm"
                                onClick={() => window.location.href = `/payment/vnpay?bookingId=${booking.id}`}
                                className="rounded-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                              >
                                <Sparkles className="h-4 w-4" />
                                Pay Now
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Ticket QR Code
            </DialogTitle>
          </DialogHeader>
          
          {selectedQR && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border-2 border-dashed border-border/50 shadow-inner">
                <svg 
                  viewBox="0 0 200 200" 
                  className="w-full h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="white"/>
                  
                  {Array.from({ length: 25 }).map((_, row) =>
                    Array.from({ length: 25 }).map((_, col) => {
                      const charIndex = (row * 25 + col) % selectedQR.length;
                      const charCode = selectedQR.charCodeAt(charIndex);
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
              
              <Button 
                className="w-full rounded-full gap-2" 
                onClick={handleCopyQR}
              >
                <Download className="h-4 w-4" />
                Copy QR Data
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>QR code copied!</span>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

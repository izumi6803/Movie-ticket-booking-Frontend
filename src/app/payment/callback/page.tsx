"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentApi, bookingsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Ticket, QrCode } from "lucide-react";
import { formatVND } from "@/lib/currency";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [bookingId, setBookingId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const paymentStatus = searchParams.get("status");
    const bookingIdParam = searchParams.get("bookingId");
    const messageParam = searchParams.get("message");

    if (bookingIdParam) {
      setBookingId(bookingIdParam);
    }

    if (messageParam) {
      setMessage(messageParam);
    }

    if (paymentStatus === "success") {
      setStatus("success");
      // Verify payment status with backend and get booking details
      if (bookingIdParam) {
        verifyPaymentAndLoadDetails(bookingIdParam);
      }
    } else if (paymentStatus === "failed") {
      setStatus("failed");
    } else {
      setStatus("failed");
      setMessage("Invalid payment status");
    }
  }, [searchParams]);

  // Auto-redirect countdown for success
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === "success" && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/customer/tickets");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, countdown, router]);

  const verifyPaymentAndLoadDetails = async (id: string) => {
    try {
      // Check payment status
      const paymentResponse = await paymentApi.checkPaymentStatus(id);
      if (paymentResponse.success) {
        console.log("Payment verified:", paymentResponse.data);
        
        // Load booking details
        const bookingResponse = await bookingsApi.getById(id);
        if (bookingResponse.success) {
          setBookingDetails(bookingResponse.data);
        }
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  const handleViewTickets = () => {
    router.push("/customer/tickets");
  };

  const handleViewBookingDetails = () => {
    if (bookingId) {
      router.push(`/customer/bookings/${bookingId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === "loading" && "Processing Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-gray-600 text-center">Your payment has been processed successfully!</p>
              </div>

              {/* Booking Details */}
              {bookingDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <Ticket className="h-5 w-5" />
                    <span className="font-semibold">Booking Confirmed</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Code:</span>
                      <span className="font-mono font-semibold">{bookingDetails.bookingCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Movie:</span>
                      <span className="font-semibold">{bookingDetails.showtime?.movie?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">{formatVND(bookingDetails.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-semibold">{bookingDetails.status}</span>
                    </div>
                  </div>

                  {bookingDetails.qrCode && (
                    <div className="flex items-center gap-2 pt-2 border-t border-green-200">
                      <QrCode className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700">QR Code generated for ticket verification</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-sm text-gray-500">
                Redirecting to My Tickets in {countdown} seconds...
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleViewTickets}
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  View My Tickets
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push("/customer/home")}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  {message || "Your payment could not be processed."}
                </p>
                {bookingId && (
                  <p className="text-sm text-gray-500">Booking ID: {bookingId}</p>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push("/customer/bookings")}
                >
                  View Bookings
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push("/customer/home")}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
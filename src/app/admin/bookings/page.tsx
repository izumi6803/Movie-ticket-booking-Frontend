"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { formatVND } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { bookingsApi } from "@/services/api";
import { Booking } from "@/types";
import { Eye, CheckCircle, XCircle, RotateCcw, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BookingStatus = "all" | "pending" | "confirmed" | "cancelled" | "expired" | "completed";
type PaymentStatus = "all" | "pending" | "paid" | "failed" | "refunded";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus>("all");

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bookingsApi.getAll();
      if (response.success) {
        const bookingsData = Array.isArray(response.data) ? response.data : [];
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } else {
        setBookings([]);
        setFilteredBookings([]);
        setError(response.message || "Failed to load bookings");
      }
    } catch (err) {
      setBookings([]);
      setFilteredBookings([]);
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Apply filters
  useEffect(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(query) ||
          b.showtime?.movie?.title?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((b) => b.paymentStatus === paymentFilter);
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, paymentFilter, bookings]);

  const handleConfirm = async (id: string) => {
    if (!confirm("Are you sure you want to confirm this booking?")) return;
    try {
      await bookingsApi.confirm(id);
      loadBookings();
    } catch {
      alert("Failed to confirm booking");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingsApi.cancel(id);
      loadBookings();
    } catch {
      alert("Failed to cancel booking");
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm("Are you sure you want to refund this booking?")) return;
    try {
      await bookingsApi.cancel(id);
      loadBookings();
    } catch {
      alert("Failed to refund booking");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
      expired: "bg-muted text-muted-foreground hover:bg-muted/80",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    };
    return (
      <Badge className={styles[status] || "bg-secondary"}>
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      paid: "bg-green-100 text-green-800 hover:bg-green-100",
      failed: "bg-red-100 text-red-800 hover:bg-red-100",
      refunded: "bg-muted text-muted-foreground hover:bg-muted/80",
    };
    return (
      <Badge variant="outline" className={styles[status] || ""}>
        {status}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) return <DashboardLayout><LoadingState message="Loading bookings..." /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={loadBookings} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Bookings</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all ticket bookings
            </p>
          </div>
          <Button variant="outline" onClick={loadBookings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: "All", value: statusCounts.all || 0, status: "all" as BookingStatus },
            { label: "Pending", value: statusCounts.pending || 0, status: "pending" as BookingStatus },
            { label: "Confirmed", value: statusCounts.confirmed || 0, status: "confirmed" as BookingStatus },
            { label: "Cancelled", value: statusCounts.cancelled || 0, status: "cancelled" as BookingStatus },
            { label: "Expired", value: statusCounts.expired || 0, status: "expired" as BookingStatus },
            { label: "Completed", value: statusCounts.completed || 0, status: "completed" as BookingStatus },
          ].map((stat) => (
            <Button
              key={stat.status}
              variant={statusFilter === stat.status ? "default" : "outline"}
              className="h-auto py-3 flex flex-col items-center"
              onClick={() => setStatusFilter(stat.status)}
            >
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs">{stat.label}</span>
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booking code, movie, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Showtime</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Booking Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      #{booking.bookingCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.user?.name || "Customer"}</div>
                        <div className="text-sm text-muted-foreground">{booking.user?.email || booking.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.showtime?.movie?.title || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {booking.showtime?.startTime
                          ? new Date(booking.showtime.startTime).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.showtime?.screen?.theater?.name} - {booking.showtime?.screen?.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatVND(booking.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDialogOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {booking.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConfirm(booking.id)}
                              title="Confirm Booking"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancel(booking.id)}
                              title="Cancel Booking"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        
                        {booking.status === "confirmed" && booking.paymentStatus === "paid" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRefund(booking.id)}
                            title="Refund Booking"
                          >
                            <RotateCcw className="h-4 w-4 text-orange-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="font-medium text-lg">#{selectedBooking.bookingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedBooking.status)}
                    {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Movie</p>
                  <p className="font-medium">{selectedBooking.showtime?.movie?.title || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Theater & Screen</p>
                  <p className="font-medium">
                    {selectedBooking.showtime?.screen?.theater?.name || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.showtime?.screen?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Showtime</p>
                  <p className="font-medium">
                    {selectedBooking.showtime?.startTime
                      ? new Date(selectedBooking.showtime.startTime).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedBooking.bookingSeats || selectedBooking.seats || []).map(
                    (seat) => (
                      <Badge key={seat.seatId} variant="outline" className="text-sm">
                        {seat.seatLabel} - {formatVND(seat.price)}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {selectedBooking.qrCode && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">QR Code</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-xs break-all">{selectedBooking.qrCode}</code>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Ticket Price</span>
                  <span>{formatVND(selectedBooking.totalTicketPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Concessions</span>
                  <span>{formatVND(selectedBooking.totalConcessionPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total Amount</span>
                  <span>{formatVND(selectedBooking.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
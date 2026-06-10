"use client";

import { useState, useCallback, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Seat } from "@/types";
import { Loader2, Lock, Check } from "lucide-react";

interface SeatGridProps {
  seats: Seat[];
  showtimeId: string;
  selectedSeats: string[];
  onSeatToggle: (seat: Seat) => void;
  disabled?: boolean;
}

export function SeatGrid({
  seats,
  showtimeId,
  selectedSeats,
  onSeatToggle,
  disabled = false,
}: SeatGridProps) {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, string>>({});

  // Initialize seat statuses from props
  useEffect(() => {
    const statuses: Record<string, string> = {};
    seats.forEach((seat) => {
      if (seat.status) {
        statuses[seat.id] = seat.status;
      }
    });
    setSeatStatuses(statuses);
  }, [seats]);

  // WebSocket handlers
  const handleSeatsLocked = useCallback(
    (seatIds: string[]) => {
      setSeatStatuses((prev) => {
        const updated = { ...prev };
        seatIds.forEach((id) => {
          updated[id] = "locked";
        });
        return updated;
      });
    },
    []
  );

  const handleSeatsUnlocked = useCallback(
    (seatIds: string[]) => {
      setSeatStatuses((prev) => {
        const updated = { ...prev };
        seatIds.forEach((id) => {
          updated[id] = "available";
        });
        return updated;
      });
    },
    []
  );

  const handleBookingCreated = useCallback(
    (_bookingId: string, seatIds: string[]) => {
      setSeatStatuses((prev) => {
        const updated = { ...prev };
        seatIds.forEach((id) => {
          updated[id] = "occupied";
        });
        return updated;
      });
    },
    []
  );

  const { isConnected, isConnecting } = useWebSocket({
    showtimeId,
    onSeatsLocked: handleSeatsLocked,
    onSeatsUnlocked: handleSeatsUnlocked,
    onBookingCreated: handleBookingCreated,
    onConnect: () => console.log("WebSocket connected for seat grid"),
    onDisconnect: () => console.log("WebSocket disconnected"),
  });

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) {
      acc[seat.rowLabel] = [];
    }
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const sortedRows = Object.keys(seatsByRow).sort();

  const getSeatStatus = (seat: Seat): string => {
    if (selectedSeats.includes(seat.id)) return "selected";
    return seatStatuses[seat.id] || seat.status || "available";
  };

  const getSeatStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-primary text-primary-foreground border-primary";
      case "occupied":
        return "bg-red-500 text-white border-red-500 cursor-not-allowed opacity-70";
      case "locked":
        return "bg-yellow-500 text-white border-yellow-500 cursor-not-allowed opacity-70";
      case "premium":
        return "bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30";
      case "vip":
        return "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30";
      case "wheelchair":
        return "bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30";
      default:
        return "bg-muted/50 border-border text-muted-foreground hover:bg-muted";
    }
  };

  const getSeatIcon = (status: string) => {
    switch (status) {
      case "selected":
        return <Check className="h-3 w-3" />;
      case "occupied":
        return <Lock className="h-3 w-3" />;
      case "locked":
        return <Lock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? "bg-green-500"
                : isConnecting
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected
              ? "Realtime updates active"
              : isConnecting
              ? "Connecting..."
              : "Offline mode"}
          </span>
        </div>
        {isConnecting && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Screen */}
      <div className="flex justify-center">
        <div className="w-3/4 h-8 bg-gradient-to-b from-muted to-muted/50 rounded-t-lg flex items-center justify-center shadow-inner">
          <span className="text-xs font-medium text-muted-foreground">SCREEN</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-2">
        {sortedRows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-8 text-center font-bold text-muted-foreground text-sm">{row}</span>
            <div className="flex gap-1.5 flex-1 justify-center">
              {seatsByRow[row]
                ?.sort((a, b) => a.seatNumber - b.seatNumber)
                .map((seat) => {
                  const status = getSeatStatus(seat);
                  const isDisabled =
                    disabled || status === "occupied" || status === "locked";

                  return (
                    <button
                      key={seat.id}
                      onClick={() => !isDisabled && onSeatToggle(seat)}
                      disabled={isDisabled}
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${getSeatStyle(
                        status
                      )}`}
                      title={`${seat.rowLabel}${seat.seatNumber} - ${status}`}
                    >
                      <div className="flex flex-col items-center">
                        {getSeatIcon(status)}
                        <span>{seat.seatNumber}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
            <span className="w-8 text-center font-bold text-muted-foreground text-sm">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs pt-4">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-muted/50 border-2 border-border"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-primary border-2 border-primary"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-500 border-2 border-yellow-500"></div>
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500 border-2 border-red-500"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-purple-500/20 border-2 border-purple-500/40"></div>
          <span>VIP</span>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { screensApi, seatsApi } from "@/services/api";
import { Screen, Seat } from "@/types";
import { ArrowLeft, Monitor, Crown } from "lucide-react";

export default function AdminSeatLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const screenId = params.id as string;
  
  const [screen, setScreen] = useState<Screen | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [screenId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [screenRes, seatsRes] = await Promise.all([
        screensApi.getById(screenId),
        seatsApi.getByScreen(screenId),
      ]);

      if (screenRes.success) {
        setScreen(screenRes.data);
      }
      if (seatsRes.success) {
        setSeats(seatsRes.data);
      }
    } catch {
      setError("Failed to load seat layout");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeatIcon = (seatType: string) => {
    switch (seatType) {
      case "vip":
        return <Crown className="h-3 w-3" />;
      case "wheelchair":
        return <span className="text-xs">♿</span>;
      default:
        return null;
    }
  };

  const getSeatColor = (seatType: string) => {
    switch (seatType) {
      case "vip":
        return "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200";
      case "premium":
        return "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200";
      case "wheelchair":
        return "bg-green-100 border-green-300 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200";
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) {
      acc[seat.rowLabel] = [];
    }
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows
  const sortedRows = Object.keys(seatsByRow).sort();

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading seat layout..." />
      </DashboardLayout>
    );
  }

  if (error || !screen) {
    return (
      <DashboardLayout>
        <ErrorState message={error || "Screen not found"} onRetry={loadData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/screens")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Seat Layout</h1>
            <p className="text-muted-foreground">
              {screen.name} - {screen.totalRows} rows x {screen.seatsPerRow} seats
            </p>
          </div>
        </div>

        {/* Screen Indicator */}
        <div className="flex justify-center">
          <div className="w-3/4 h-12 bg-gradient-to-b from-gray-300 to-gray-100 rounded-t-lg flex items-center justify-center shadow-inner">
            <span className="text-sm font-medium text-gray-600">SCREEN</span>
          </div>
        </div>

        {/* Seat Layout */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {sortedRows.map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="w-8 text-center font-bold text-gray-500">{row}</span>
                  <div className="flex gap-2 flex-1 justify-center">
                    {seatsByRow[row]
                      ?.sort((a, b) => a.seatNumber - b.seatNumber)
                      .map((seat) => (
                        <button
                          key={seat.id}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${getSeatColor(seat.seatType)}`}
                          title={`${seat.rowLabel}${seat.seatNumber} - ${seat.seatType} (${seat.priceMultiplier}x)`}
                        >
                          <div className="flex flex-col items-center">
                            {getSeatIcon(seat.seatType)}
                            <span>{seat.seatNumber}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                  <span className="w-8 text-center font-bold text-gray-500">{row}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seat Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border-2 bg-gray-100 border-gray-300"></div>
                <span className="text-sm">Standard (1.0x)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border-2 bg-blue-100 border-blue-300"></div>
                <span className="text-sm">Premium (1.2x)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border-2 bg-purple-100 border-purple-300 flex items-center justify-center">
                  <Crown className="h-3 w-3 text-purple-800" />
                </div>
                <span className="text-sm">VIP (1.5x)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border-2 bg-green-100 border-green-300 flex items-center justify-center">
                  <span className="text-xs text-green-800">♿</span>
                </div>
                <span className="text-sm">Wheelchair (1.0x)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{seats.length}</div>
              <div className="text-sm text-muted-foreground">Total Seats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{seats.filter((s) => s.seatType === "vip").length}</div>
              <div className="text-sm text-muted-foreground">VIP Seats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{seats.filter((s) => s.seatType === "standard").length}</div>
              <div className="text-sm text-muted-foreground">Standard Seats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{screen.totalRows}</div>
              <div className="text-sm text-muted-foreground">Rows</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


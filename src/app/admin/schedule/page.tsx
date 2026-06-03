"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { showtimesApi, moviesApi, theatersApi, screensApi } from "@/services/api";
import { Showtime, Movie, Theater, Screen } from "@/types";
import { Plus, Pencil, Trash2, Clock, Calendar } from "lucide-react";

export default function AdminSchedulePage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [showtimesRes, moviesRes, theatersRes, screensRes] = await Promise.all([
        showtimesApi.getAll(),
        moviesApi.getAll(),
        theatersApi.getAll(),
        screensApi.getAll(),
      ]);

      if (showtimesRes.success) setShowtimes(showtimesRes.data);
      if (moviesRes.success) setMovies(moviesRes.data);
      if (theatersRes.success) setTheaters(theatersRes.data);
      if (screensRes.success) setScreens(screensRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this showtime?")) return;
    try {
      await showtimesApi.delete(id);
      loadData();
    } catch {
      alert("Failed to delete showtime");
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingShowtime(null);
    loadData();
  };

  const groupByDate = (showtimes: Showtime[]) => {
    const grouped: Record<string, Showtime[]> = {};
    showtimes.forEach((showtime) => {
      const date = new Date(showtime.startTime).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(showtime);
    });
    return grouped;
  };

  const groupedShowtimes = groupByDate(showtimes);
  const sortedDates = Object.keys(groupedShowtimes).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Movie Schedule</h1>
            <p className="text-muted-foreground mt-1">
              Manage movie showtimes across theaters.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  setEditingShowtime(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Showtime
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingShowtime ? "Edit Showtime" : "Add New Showtime"}
                </DialogTitle>
              </DialogHeader>
              <ShowtimeForm
                showtime={editingShowtime}
                movies={movies}
                theaters={theaters}
                screens={screens}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading showtimes...</div>
        ) : showtimes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming showtimes scheduled.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="bg-card rounded-xl shadow-sm border">
                <div className="p-4 border-b bg-muted/50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">{date}</h2>
                    <span className="text-sm text-muted-foreground">
                      ({groupedShowtimes[date].length} showtimes)
                    </span>
                  </div>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Movie</th>
                      <th className="text-left p-4">Theater</th>
                      <th className="text-left p-4">Screen</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedShowtimes[date]
                      .sort(
                        (a, b) =>
                          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                      )
                      .map((showtime) => (
                        <tr key={showtime.id} className="border-b">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Date(showtime.startTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {showtime.movie?.title || "N/A"}
                          </td>
                          <td className="p-4">
                            {showtime.screen?.theater?.name || "N/A"}
                          </td>
                          <td className="p-4">
                            {showtime.screen?.name || "N/A"}
                          </td>
                          <td className="p-4">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(showtime.baseTicketPrice || 0)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingShowtime(showtime);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(showtime.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ShowtimeForm({ showtime, movies, theaters, screens, onSuccess }: { 
  showtime?: Showtime | null; 
  movies: Movie[]; 
  theaters: Theater[]; 
  screens: Screen[]; 
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTheaterId, setSelectedTheaterId] = useState(
    showtime?.screen?.theaterId || ""
  );

  const filteredScreens = selectedTheaterId
    ? screens.filter((s) => s.theaterId === selectedTheaterId)
    : screens;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const showtimeData = {
        movieId: formData.get("movieId") as string,
        screenId: formData.get("screenId") as string,
        startTime: new Date(formData.get("startTime") as string).toISOString(),
        endTime: new Date(formData.get("endTime") as string).toISOString(),
        baseTicketPrice: Number(formData.get("price")),
        status: "active" as const,
      };

      if (showtime) {
        await showtimesApi.update(showtime.id, showtimeData);
      } else {
        await showtimesApi.create(showtimeData);
      }
      onSuccess();
    } catch (error: any) {
      alert(
        showtime
          ? "Failed to update showtime"
          : "Failed to create showtime: " + (error?.message || "Unknown error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Movie</label>
        <select
          name="movieId"
          defaultValue={showtime?.movieId || ""}
          required
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Movie</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title} ({movie.duration} min)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Theater</label>
        <select
          value={selectedTheaterId}
          onChange={(e) => setSelectedTheaterId(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Theater</option>
          {theaters.map((theater) => (
            <option key={theater.id} value={theater.id}>
              {theater.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Screen</label>
        <select
          name="screenId"
          defaultValue={showtime?.screenId || ""}
          required
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Screen</option>
          {filteredScreens.map((screen) => (
            <option key={screen.id} value={screen.id}>
              {screen.name} ({screen.screenType})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Time</label>
          <input
            name="startTime"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(showtime?.startTime || "")}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Time</label>
          <input
            name="endTime"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(showtime?.endTime || "")}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ticket Price (VND)</label>
        <input
          name="price"
          type="number"
          step="1000"
          min="0"
          defaultValue={showtime?.baseTicketPrice || "100000"}
          required
          className="w-full p-2 border rounded-md"
        />
        <p className="text-xs text-muted-foreground">
          Enter amount in VND (e.g., 100000 for 100,000 VND)
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? showtime
            ? "Updating..."
            : "Creating..."
          : showtime
          ? "Update Showtime"
          : "Create Showtime"}
      </Button>
    </form>
  );
}
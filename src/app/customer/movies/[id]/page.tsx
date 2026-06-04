"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { moviesApi, showtimesApi } from "@/services/api";
import { Movie, Showtime } from "@/types";
import {
  Calendar,
  Clock,
  Star,
  Film,
  ArrowLeft,
  Ticket,
  MapPin,
  Monitor,
  Play
} from "lucide-react";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadMovieDetail(params.id as string);
    }
  }, [params.id]);

  const loadMovieDetail = async (movieId: string) => {
    try {
      setIsLoading(true);
      const [movieRes, showtimesRes] = await Promise.all([
        moviesApi.getById(movieId),
        showtimesApi.getByMovie(movieId)
      ]);
      
      if (movieRes.success) {
        setMovie(movieRes.data);
      }
      if (showtimesRes.success) {
        setShowtimes(showtimesRes.data);
      }
    } catch {
      setError("Failed to load movie details");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "now_showing":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "coming_soon":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  if (isLoading) return <LoadingState message="Loading movie details..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadMovieDetail(params.id as string)} />;
  if (!movie) return <ErrorState message="Movie not found" onRetry={() => router.push("/customer/movies")} />;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/customer/movies")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Button>

        {/* Movie Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border">
          <div className="flex flex-col md:flex-row">
            {/* Poster */}
            <div className="w-full md:w-80 h-96 md:h-auto flex-shrink-0 relative">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Film className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getStatusColor(movie.status)}>
                  {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                </Badge>
                
                {movie.rating && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {movie.rating}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {movie.duration} minutes
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                    : "N/A"}
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6">{movie.description}</p>
              
              {movie.genre && movie.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genre.map((g) => (
                    <Badge key={g} variant="secondary">{g}</Badge>
                  ))}
                </div>
              )}
              
              {movie.status === "now_showing" && (
                <Button
                  size="lg"
                  className="rounded-full gap-2 bg-gradient-to-r from-primary to-purple-600"
                  onClick={() => router.push(`/customer/movies/${movie.id}/book`)}
                >
                  <Ticket className="h-5 w-5" />
                  Book Tickets
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Showtimes */}
        {showtimes.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Showtimes
              </h2>
              
              <div className="grid gap-4">
                {showtimes.map((showtime) => (
                  <Card key={showtime.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {showtime.screen?.theater?.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <span>{showtime.screen?.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {showtime.startTime
                                ? new Date(showtime.startTime).toLocaleString('vi-VN')
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-primary">
                            {showtime.baseTicketPrice?.toLocaleString('vi-VN')} VND
                          </span>
                          
                          <Button
                            onClick={() => router.push(`/customer/movies/${movie.id}/book?showtime=${showtime.id}`)}
                            className="rounded-full gap-2"
                          >
                            <Ticket className="h-4 w-4" />
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
}

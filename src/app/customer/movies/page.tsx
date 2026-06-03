"use client";

import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/layout/customer-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingFlow } from "@/components/booking/booking-flow";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { moviesApi } from "@/services/api";
import { Movie } from "@/types";
import { 
  Film, 
  Clock, 
  Star, 
  Calendar, 
  Ticket, 
  Sparkles,
  TrendingUp,
  Play,
  Heart,
  Search
} from "lucide-react";

export default function CustomerMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(movie.genre) && movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies(movies);
    }
  }, [searchQuery, movies]);

  const loadMovies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await moviesApi.getNowShowing();
      if (response.success) {
        setMovies(response.data);
        setFilteredMovies(response.data);
      }
    } catch (err) {
      setError("Failed to load movies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookTickets = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsBookingOpen(true);
  };

  const getGenres = (movie: Movie) => {
    const genre = movie.genre;
    if (Array.isArray(genre)) {
      return genre;
    }
    if (typeof genre === 'string') {
      const cleaned = genre.replace(/[{}]/g, '');
      return cleaned.split(',').map(g => g.trim()).filter(Boolean);
    }
    return [];
  };

  if (isLoading) return <LoadingState message="Loading movies..." />;
  if (error) return <ErrorState message={error} onRetry={loadMovies} />;

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {movies.length} Movies Available
                </Badge>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Now Showing
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Book tickets for your favorite movies
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies by title or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-card shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie, index) => (
            <Card 
              key={movie.id} 
              className="overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
            >
              <div className="relative h-80 overflow-hidden">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Film className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                
                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
                  hoveredMovie === movie.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <Button 
                    onClick={() => handleBookTickets(movie)}
                    className="rounded-full bg-white text-black hover:bg-white/90 gap-2 px-6"
                  >
                    <Play className="h-4 w-4" />
                    Book Now
                  </Button>
                </div>
                
                <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                  {movie.rating}
                </Badge>
                
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="h-3 w-3" />
                    {movie.duration} min
                  </div>
                </div>
              </div>
              
              <CardContent className="p-5">
                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {movie.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {movie.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {getGenres(movie).slice(0, 3).map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{movie.director}</span>
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleBookTickets(movie)}
                    className="rounded-full gap-2"
                  >
                    <Ticket className="h-3 w-3" />
                    Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <Card className="p-16 text-center border-dashed">
            <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No movies found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
          </Card>
        )}
      </div>

      {selectedMovie && (
        <BookingFlow
          movie={selectedMovie}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedMovie(null);
          }}
        />
      )}
    </CustomerLayout>
  );
}

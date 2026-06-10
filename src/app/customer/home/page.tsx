"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { moviesApi, authApi } from "@/services/api";
import { Movie, User as UserType } from "@/types";
import { LoadingState } from "@/components/ui/states";
import {
  Film,
  Clock,
  Ticket,
  LogOut,
  Star,
  ChevronRight,
  Play,
  Sparkles,
  TrendingUp,
  Heart,
  User,
} from "lucide-react";

export default function CustomerHomePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [nowResponse, soonResponse] = await Promise.all([
        moviesApi.getNowShowing(),
        moviesApi.getComingSoon(),
      ]);

      if (nowResponse.success) setNowShowing(nowResponse.data);
      if (soonResponse.success) setComingSoon(soonResponse.data);

      const userResponse = await authApi.me();
      if (userResponse.success) setUser(userResponse.data);
    } catch {
      // Guest users can still browse movies
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header with Glass Effect */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/customer/home" className="flex items-center gap-2 group">
            <div className="relative">
              <Film className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CinemaBook
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/customer/home", label: "Home", icon: Sparkles },
              { href: "/customer/movies", label: "Movies", icon: Film },
              { href: "/customer/tickets", label: "My Tickets", icon: Ticket },
              { href: "/customer/profile", label: "Profile", icon: User },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Hi, <span className="text-primary">{user?.name?.split(" ")[0] || "Guest"}</span>
              </span>
            </div>
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full text-center">
            <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Welcome to CinemaBook
            </div>

            <h1 className="w-full text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Book Your
              </span>
              <br />
              Movie Tickets
            </h1>

            <p className="w-full max-w-[640px] mx-auto text-lg text-muted-foreground">
              Experience the magic of cinema. Watch the latest blockbusters in the best theaters with easy booking and amazing deals!
            </p>

            <div className="w-full flex items-center justify-center gap-4 mt-8">
              <Button
                size="lg"
                onClick={() => router.push("/customer/movies")}
                className="rounded-full px-8 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
              >
                <Ticket className="h-5 w-5 mr-2" />
                Browse Movies
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/customer/tickets")}
                className="rounded-full px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                My Tickets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-3xl font-bold">Now Showing</h2>
              </div>
              <p className="text-muted-foreground">Watch these movies in theaters now</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => router.push("/customer/movies")}
              className="rounded-full gap-2"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {nowShowing.length === 0 ? (
            <Card className="p-16 text-center border-dashed">
              <Film className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No movies currently showing</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for new releases</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nowShowing.map((movie, index) => (
                <Card 
                  key={movie.id} 
                  className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
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
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                    
                    {/* Hover Content */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
                      hoveredMovie === movie.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <Button 
                        onClick={() => router.push("/customer/movies")}
                        className="rounded-full bg-white text-black hover:bg-white/90 gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Book Now
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="rounded-full border-white/30 text-white hover:bg-white/20"
                      >
                        <Heart className="h-4 w-4" />
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
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {Array.isArray(movie.genre) ? movie.genre[0] : movie.genre}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {movie.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-3xl font-bold">Coming Soon</h2>
              </div>
              <p className="text-muted-foreground">Get ready for these upcoming movies</p>
            </div>
          </div>

          {comingSoon.length === 0 ? (
            <Card className="p-16 text-center border-dashed">
              <Sparkles className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No upcoming movies</p>
              <p className="text-sm text-muted-foreground mt-1">New releases will appear here</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoon.map((movie) => (
                <Card 
                  key={movie.id} 
                  className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Film className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 right-3 bg-purple-500/90 text-white backdrop-blur-sm"
                    >
                      Coming Soon
                    </Badge>
                  </div>
                  
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "Release date TBA"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">CinemaBook</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CinemaBook. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4">
              <Link href="/customer/movies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Movies</Link>
              <Link href="/customer/tickets" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tickets</Link>
              <Link href="/customer/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">Profile</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableFilters } from "@/components/ui/data-table-filters";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { moviesApi } from "@/services/api";
import { Movie } from "@/types";
import { Plus, Pencil, Trash2, Film, Clock, ArrowRight, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
  const [nowShowingMovies, setNowShowingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const showSuccessToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage(null);
    }, 3000);
  }, []);

  const loadMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await moviesApi.getAll({
        page,
        limit,
        search,
        genre,
        status,
      });

      if (response.success) {
        const moviesData = Array.isArray(response.data) ? response.data : [];
        setMovies(moviesData);
        setTotal(moviesData.length);
      } else {
        setMovies([]);
        setTotal(0);
      }
    } catch (err) {
      setError("Failed to load movies");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, genre, status]);

  const loadComingSoonAndNowShowing = useCallback(async () => {
    try {
      const [comingRes, nowRes] = await Promise.all([
        moviesApi.getComingSoon(),
        moviesApi.getNowShowing(),
      ]);

      if (comingRes.success) setComingSoonMovies(comingRes.data);
      if (nowRes.success) setNowShowingMovies(nowRes.data);
    } catch {
      console.error("Failed to load coming soon / now showing movies");
    }
  }, []);

  useEffect(() => {
    loadMovies();
    loadComingSoonAndNowShowing();
  }, [loadMovies, loadComingSoonAndNowShowing]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (movie: Movie) => {
    setMovieToDelete(movie);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!movieToDelete) return;
    
    setIsDeleting(true);
    try {
      await moviesApi.delete(movieToDelete.id);
      setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      setComingSoonMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      setNowShowingMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
    } catch {
      alert("Failed to delete movie");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsEnded = async (movieId: string) => {
    if (!confirm("Mark this movie as ended? It will no longer be shown in theaters.")) return;
    
    try {
      await moviesApi.update(movieId, { status: "ended" });
      
      // Update local state
      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, status: "ended" as const } : m))
      );
      
      // Remove from now showing
      setNowShowingMovies((prev) => prev.filter((m) => m.id !== movieId));
      
      loadMovies();
    } catch {
      alert("Failed to update movie status");
    }
  };

  const handleMoveToNowShowing = async (movieId: string) => {
    try {
      await moviesApi.update(movieId, { status: "now_showing" });
      
      // Update local state
      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, status: "now_showing" as const } : m))
      );
      
      // Move from coming soon to now showing if applicable
      const comingSoonMovie = comingSoonMovies.find((m) => m.id === movieId);
      if (comingSoonMovie) {
        setComingSoonMovies((prev) => prev.filter((m) => m.id !== movieId));
        setNowShowingMovies((prev) => [...prev, { ...comingSoonMovie, status: "now_showing" as const }]);
      }
      
      loadMovies();
    } catch {
      alert("Failed to update movie status");
    }
  };

  const genreOptions = [
    { value: "action", label: "Action" },
    { value: "comedy", label: "Comedy" },
    { value: "drama", label: "Drama" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "horror", label: "Horror" },
  ];

  const statusOptions = [
    { value: "now_showing", label: "Now Showing" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "ended", label: "Ended" },
  ];

  const renderMovieList = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border bg-card">
              <div className="skeleton aspect-[2/3] w-full" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadMovies} />
      ) : !movies || movies.length === 0 ? (
        <EmptyState
          message="No movies found"
          action={{ label: "Add Movie", onClick: () => {} }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group relative bg-card rounded-xl overflow-hidden border shadow-sm card-hover animate-fade-in"
              >
                {/* Poster Image */}
                <div className="relative aspect-[2/3] overflow-hidden img-zoom">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Film className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant={movie.status === "now_showing" ? "default" : movie.status === "coming_soon" ? "secondary" : "outline"}
                      className={`backdrop-blur-md ${
                        movie.status === "now_showing" 
                          ? "bg-green-500/90 text-white hover:bg-green-500/90" 
                          : movie.status === "coming_soon"
                          ? "bg-blue-500/90 text-white hover:bg-blue-500/90"
                          : "bg-gray-500/90 text-white hover:bg-gray-500/90"
                      }`}
                    >
                      {movie.status === "now_showing" ? "Now Showing" : movie.status === "coming_soon" ? "Coming Soon" : "Ended"}
                    </Badge>
                  </div>
                  
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/30 backdrop-blur-md">
                      {movie.rating}
                    </Badge>
                  </div>
                  
                  {/* Hover actions */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <Dialog>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 bg-white/90 hover:bg-white text-black backdrop-blur-md"
                        onClick={() => { setMovieToEdit(movie); setEditDialogOpen(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </Dialog>
                    
                    <Dialog open={editDialogOpen && movieToEdit?.id === movie.id} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setMovieToEdit(null); } }}>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Movie</DialogTitle>
                        </DialogHeader>
                        {movieToEdit && (
                          <MovieForm 
                            movie={movieToEdit} 
                            onSuccess={(msg) => { showSuccessToast(msg); loadMovies(); setEditDialogOpen(false); setMovieToEdit(null); }}
                            onClose={() => { setEditDialogOpen(false); setMovieToEdit(null); }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(movie)}
                      className="bg-red-500/90 hover:bg-red-500 backdrop-blur-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {movie.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {movie.releaseDate 
                        ? new Date(movie.releaseDate).getFullYear() 
                        : "TBA"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).slice(0, 3).map((g, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {g}
                      </Badge>
                    ))}
                    {(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).length > 3 && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        +{(Array.isArray(movie.genre) ? movie.genre : [movie.genre]).length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {movie.director && (
                    <p className="text-xs text-muted-foreground">
                      Dir: {movie.director}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DataTablePagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );

  const renderComingSoonSection = () => (
    <div className="space-y-6">
      {comingSoonMovies.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No coming soon movies</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add movies with future release dates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {comingSoonMovies.map((movie) => (
            <div
              key={movie.id}
              className="group bg-card rounded-xl overflow-hidden border shadow-sm card-hover animate-fade-in"
            >
              <div className="relative aspect-[16/9] overflow-hidden img-zoom">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Film className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <Badge className="bg-purple-500/90 text-white hover:bg-purple-500/90 backdrop-blur-md">
                    Coming Soon
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {movie.duration} min
                  </span>
                  <Badge variant="outline" className="text-xs">{movie.rating}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-3.5 w-3.5" />
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                    : "TBA"}
                </div>
                <Button
                  onClick={() => handleMoveToNowShowing(movie.id)}
                  className="w-full gap-2"
                >
                  Move to Now Showing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNowShowingSection = () => (
    <div className="space-y-6">
      {nowShowingMovies.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No movies currently showing</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add a movie or move from Coming Soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {nowShowingMovies.map((movie) => (
            <div
              key={movie.id}
              className="group bg-card rounded-xl overflow-hidden border shadow-sm card-hover animate-fade-in"
            >
              <div className="relative aspect-[16/9] overflow-hidden img-zoom">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <Film className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <Badge className="bg-green-500/90 text-white hover:bg-green-500/90 backdrop-blur-md">
                    Now Showing
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {movie.duration} min
                  </span>
                  <Badge variant="outline" className="text-xs">{movie.rating}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsEnded(movie.id)}
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  Mark as Ended
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEndedSection = () => {
    const endedMovies = movies.filter((m) => m.status === "ended");
    return (
      <div className="space-y-6">
        {endedMovies.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No ended movies</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Movies marked as ended will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {endedMovies.map((movie) => (
              <div
                key={movie.id}
                className="group bg-card rounded-xl overflow-hidden border shadow-sm card-hover animate-fade-in opacity-75 hover:opacity-100"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-500/20 to-gray-700/20 flex items-center justify-center">
                      <Film className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge variant="secondary" className="bg-gray-500/90 text-white hover:bg-gray-500/90 backdrop-blur-md">
                      Ended
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {movie.duration} min
                    </span>
                    <Badge variant="outline" className="text-xs">{movie.rating}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveToNowShowing(movie.id)}
                      className="flex-1"
                    >
                      Reactivate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(movie)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Movies</h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage your movie catalog and track showtimes.</p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 btn-shine shadow-lg shadow-primary/25" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-5 w-5" />
                  Add Movie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Movie</DialogTitle>
                </DialogHeader>
                <MovieForm 
                  onSuccess={(msg) => { showSuccessToast(msg); loadMovies(); setCreateDialogOpen(false); }} 
                  onClose={() => setCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-4 hover-lift">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Film className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Movies</p>
                <p className="text-2xl font-bold">{movies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 hover-lift">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Now Showing</p>
                <p className="text-2xl font-bold">{nowShowingMovies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 hover-lift">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
                <p className="text-2xl font-bold">{comingSoonMovies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-4 hover-lift">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ended</p>
                <p className="text-2xl font-bold">{movies.filter(m => m.status === "ended").length}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All Movies
            </TabsTrigger>
            <TabsTrigger 
              value="now_showing"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Now Showing
            </TabsTrigger>
            <TabsTrigger 
              value="coming_soon"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Coming Soon
            </TabsTrigger>
            <TabsTrigger 
              value="ended"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Ended
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <DataTableFilters
              searchPlaceholder="Search movies..."
              filters={[
                { key: "genre", label: "Genre", options: genreOptions },
                { key: "status", label: "Status", options: statusOptions },
              ]}
              onSearch={setSearch}
              onFilterChange={(key, value) => {
                if (key === "genre") setGenre(value);
                if (key === "status") setStatus(value);
                setPage(1);
              }}
            />
            {renderMovieList()}
          </TabsContent>

          <TabsContent value="now_showing">
            {renderNowShowingSection()}
          </TabsContent>

          <TabsContent value="coming_soon">
            {renderComingSoonSection()}
          </TabsContent>

          <TabsContent value="ended">
            {renderEndedSection()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{movieToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Movie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      {showToast && toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MovieForm({ onSuccess, movie, onClose }: { onSuccess: (message: string) => void; movie?: Movie; onClose?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | undefined>(movie?.posterUrl || undefined);
  const [trailerUrl, setTrailerUrl] = useState<string | undefined>(movie?.trailerUrl || undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const genreStr = formData.get("genre") as string;
      const castStr = formData.get("cast") as string;
      const releaseDate = formData.get("releaseDate") as string;
      const status = formData.get("status") as string;
      
      // Validate release date for coming soon movies
      if (status === "coming_soon" && releaseDate) {
        const selectedDate = new Date(releaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          alert("Coming soon movies cannot have a release date in the past. Please select today or a future date.");
          setIsSubmitting(false);
          return;
        }
      }
      
      const movieData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string || "",
        duration: Number(formData.get("duration")),
        genre: genreStr || "",
        rating: (formData.get("rating") as string || "G") as any,
        director: formData.get("director") as string || "",
        status: (status || "coming_soon") as any,
        posterUrl: posterUrl || undefined,
        trailerUrl: trailerUrl || undefined,
        releaseDate: releaseDate || "",
        cast: castStr || "",
      };

      if (movie) {
        await moviesApi.update(movie.id, movieData);
        onSuccess(`Movie "${movieData.title}" updated successfully!`);
      } else {
        await moviesApi.create(movieData);
        onSuccess(`Movie "${movieData.title}" created successfully!`);
      }
      
      // Close modal after success
      if (onClose) {
        onClose();
      }
    } catch {
      alert(`Failed to ${movie ? 'update' : 'create'} movie`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Poster Image</label>
          <ImageUpload
            value={posterUrl}
            onChange={setPosterUrl}
            onRemove={() => setPosterUrl(undefined)}
          />
        </div>
        <div className="space-y-2">
          <label>Trailer Image (Optional)</label>
          <ImageUpload
            value={trailerUrl}
            onChange={setTrailerUrl}
            onRemove={() => setTrailerUrl(undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Title</label>
          <input name="title" required defaultValue={movie?.title} className="w-full p-2 border rounded" />
        </div>
        <div className="space-y-2">
          <label>Duration (min)</label>
          <input
            name="duration"
            type="number"
            required
            defaultValue={movie?.duration}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label>Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={movie?.description}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Genre</label>
          <input
            name="genre"
            placeholder="action,comedy"
            defaultValue={Array.isArray(movie?.genre) ? movie?.genre.join(", ") : movie?.genre}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label>Rating</label>
          <select name="rating" defaultValue={movie?.rating} className="w-full p-2 border rounded">
            <option value="G">G</option>
            <option value="PG">PG</option>
            <option value="PG-13">PG-13</option>
            <option value="R">R</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Director</label>
          <input name="director" defaultValue={movie?.director} className="w-full p-2 border rounded" />
        </div>
        <div className="space-y-2">
          <label>Status</label>
          <select name="status" defaultValue={movie?.status} className="w-full p-2 border rounded">
            <option value="now_showing">Now Showing</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Release Date</label>
          <input 
            name="releaseDate" 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            defaultValue={movie?.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : ''}
            className="w-full p-2 border rounded" 
          />
        </div>
        <div className="space-y-2">
          <label>Cast (comma separated)</label>
          <input 
            name="cast" 
            placeholder="Actor 1, Actor 2, Actor 3" 
            defaultValue={Array.isArray(movie?.cast) ? movie?.cast.join(", ") : movie?.cast}
            className="w-full p-2 border rounded" 
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (movie ? "Updating..." : "Creating...") : (movie ? "Update Movie" : "Create Movie")}
      </Button>
    </form>
  );
}

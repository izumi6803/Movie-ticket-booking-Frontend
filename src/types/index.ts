export type UserRole = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export type MovieGenre =
  | "action"
  | "adventure"
  | "animation"
  | "comedy"
  | "crime"
  | "documentary"
  | "drama"
  | "family"
  | "fantasy"
  | "horror"
  | "musical"
  | "mystery"
  | "romance"
  | "sci-fi"
  | "thriller"
  | "war"
  | "western";

export type MovieRating = "G" | "PG" | "PG-13" | "R" | "NC-17";

export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  genre: MovieGenre[] | string;
  rating: MovieRating;
  posterUrl?: string;
  trailerUrl?: string;
  releaseDate?: string;
  director: string;
  cast: string[] | string;
  status: "now_showing" | "coming_soon" | "ended";
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  totalScreens: number;
}

export interface Screen {
  id: string;
  theaterId: string;
  theaterName?: string;
  theater?: Theater;
  name: string;
  screenType: "standard" | "imax" | "3d" | "4dx" | "vip";
  totalRows: number;
  seatsPerRow: number;
  totalSeats: number;
  soundSystem: string;
}

export interface Seat {
  id: string;
  screenId: string;
  rowLabel: string;
  seatNumber: number;
  seatType: "standard" | "premium" | "vip" | "wheelchair";
  priceMultiplier: number;
  status?: "available" | "occupied" | "reserved" | "locked";
}

export interface Showtime {
  id: string;
  movieId: string;
  movieTitle?: string;
  movie?: Movie;
  screenId: string;
  screenName?: string;
  screen?: Screen;
  theaterName?: string;
  startTime: string;
  endTime: string;
  baseTicketPrice: number;
  availableSeats?: number;
  status: "active" | "cancelled" | "completed";
}

export interface Concession {
  id: string;
  name: string;
  description: string;
  category: "food" | "drink" | "merchandise" | "combo";
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface OrderItem {
  concessionId: string;
  concession?: Concession;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingSeat {
  seatId: string;
  seatLabel: string;
  price: number;
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  showtimeId: string;
  showtime?: Showtime;
  bookingCode: string;
  seats: BookingSeat[];
  bookingSeats?: BookingSeat[];
  concessions: OrderItem[];
  totalTicketPrice: number;
  totalConcessionPrice: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "expired" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  qrCode?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMovies: number;
  nowShowing: number;
  totalTheaters: number;
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCustomers: number;
}

export interface CustomerDashboardStats {
  totalBookings: number;
  upcomingShows: number;
  totalSpent: number;
  loyaltyPoints: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export interface BookingFlowState {
  step: number;
  movie?: Movie;
  theater?: Theater;
  showtime?: Showtime;
  selectedSeats: BookingSeat[];
  concessions: OrderItem[];
}

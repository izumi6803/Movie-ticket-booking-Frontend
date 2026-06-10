import {
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Movie,
  Theater,
  Screen,
  Seat,
  Showtime,
  Concession,
  Booking,
  DashboardStats,
  CustomerDashboardStats,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  status?: string;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isAuthEndpoint = endpoint.startsWith("/auth/login") || endpoint.startsWith("/auth/register") || endpoint.startsWith("/auth/me");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  let responseData: Record<string, unknown> = {};
  try {
    responseData = await response.json();
  } catch {
    // ignore parse errors
  }

  // Handle 401 Unauthorized - token expired or invalid (skip for auth endpoints)
  if (response.status === 401 && !isAuthEndpoint) {
    localStorage.removeItem("token");
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new Error((responseData?.message as string) || "Session expired. Please login again.");
  }

  if (!response.ok) {
    return {
      success: false,
      data: null as T,
      message: (responseData?.message as string) || `Request failed (${response.status})`,
    } as ApiResponse<T>;
  }

  return responseData as unknown as ApiResponse<T>;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    fetchApi<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (credentials: RegisterCredentials) =>
    fetchApi<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    fetchApi<void>("/auth/logout", {
      method: "POST",
    }),

  me: () => fetchApi<User>("/auth/me"),

  updateProfile: (data: { name: string; phone: string }) =>
    fetchApi<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchApi<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const moviesApi = {
  getAll: (params?: PaginationParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.genre) query.append("genre", params.genre);
    if (params?.status) query.append("status", params.status);

    const queryString = query.toString();
    return fetchApi<Movie[]>(
      `/movies${queryString ? `?${queryString}` : ""}`
    );
  },

  getNowShowing: () => fetchApi<Movie[]>("/movies/now-showing"),

  getComingSoon: () => fetchApi<Movie[]>("/movies/coming-soon"),

  getById: (id: string) => fetchApi<Movie>(`/movies/${id}`),

  create: (data: Omit<Movie, "id">) =>
    fetchApi<Movie>("/movies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Movie>) =>
    fetchApi<Movie>(`/movies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/movies/${id}`, {
      method: "DELETE",
    }),
};

export const theatersApi = {
  getAll: () => fetchApi<Theater[]>("/theaters"),

  getById: (id: string) => fetchApi<Theater>(`/theaters/${id}`),

  create: (data: Omit<Theater, "id">) =>
    fetchApi<Theater>("/theaters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Theater>) =>
    fetchApi<Theater>(`/theaters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/theaters/${id}`, {
      method: "DELETE",
    }),

  getScreens: (theaterId: string) =>
    fetchApi<Screen[]>(`/screens/theater/${theaterId}`),
};

export const screensApi = {
  getAll: () => fetchApi<Screen[]>("/screens"),
  getById: (id: string) => fetchApi<Screen>(`/screens/${id}`),
  getByTheater: (theaterId: string) =>
    fetchApi<Screen[]>(`/screens/theater/${theaterId}`),
  create: (data: Omit<Screen, "id" | "totalSeats">) =>
    fetchApi<Screen>("/screens", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Screen>) =>
    fetchApi<Screen>(`/screens/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/screens/${id}`, {
      method: "DELETE",
    }),
};

export const showtimesApi = {
  getAll: () => fetchApi<Showtime[]>("/showtimes"),

  getByMovie: (movieId: string) =>
    fetchApi<Showtime[]>(`/showtimes/movie/${movieId}`),

  getByMovieAndTheater: (movieId: string, theaterId: string) =>
    fetchApi<Showtime[]>(`/showtimes/movie/${movieId}/theater/${theaterId}`),

  getById: (id: string) => fetchApi<Showtime>(`/showtimes/${id}`),

  create: (data: Omit<Showtime, "id">) =>
    fetchApi<Showtime>("/showtimes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Showtime>) =>
    fetchApi<Showtime>(`/showtimes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/showtimes/${id}`, {
      method: "DELETE",
    }),
};

export const seatsApi = {
  getByScreen: (screenId: string, showtimeId?: string) => {
    const query = new URLSearchParams();
    if (showtimeId) query.append("showtimeId", showtimeId);
    const queryString = query.toString();
    return fetchApi<Seat[]>(`/seats/screen/${screenId}${queryString ? `?${queryString}` : ""}`);
  },

  getByShowtime: (showtimeId: string) =>
    fetchApi<Seat[]>(`/showtimes/${showtimeId}/seats`),
};

export const concessionsApi = {
  getAll: () => fetchApi<Concession[]>("/concessions"),

  getByCategory: (category: string) =>
    fetchApi<Concession[]>(`/concessions/category/${category}`),
};

export const bookingsApi = {
  getAll: (params?: PaginationParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const queryString = query.toString();
    return fetchApi<Booking[]>(
      `/bookings${queryString ? `?${queryString}` : ""}`
    );
  },

  getMyBookings: () => fetchApi<Booking[]>("/my-bookings"),

  getById: (id: string) => fetchApi<Booking>(`/bookings/${id}`),

  create: (data: {
    showtimeId: string;
    seats: { seatId: string; seatLabel: string; price: number }[];
    concessions: { concessionId: string; quantity: number; unitPrice: number; totalPrice: number }[];
    totalTicketPrice: number;
    totalConcessionPrice: number;
    totalAmount: number;
  }) =>
    fetchApi<Booking>("/bookings/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  confirm: (id: string) =>
    fetchApi<Booking>(`/bookings/${id}/confirm`, {
      method: "POST",
    }),

  cancel: (id: string) =>
    fetchApi<Booking>(`/bookings/${id}/cancel`, {
      method: "POST",
    }),

  clearMyBookings: () =>
    fetchApi<void>("/my-bookings/clear", {
      method: "DELETE",
    }),
};

export const paymentApi = {
  createVNPayPayment: (data: {
    bookingId: string;
    amount: number;
    orderInfo: string;
  }) =>
    fetchApi<{
      paymentUrl: string;
      orderId: string;
    }>("/payments/vnpay/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  checkPaymentStatus: (bookingId: string) =>
    fetchApi<{
      bookingId: string;
      status: string;
      paymentStatus: string;
      amount: number;
    }>(`/payments/status/${bookingId}`),
};

export const seatLockApi = {
  lockSeats: (data: {
    showtimeId: string;
    seatIds: string[];
    seatLabels: string[];
  }) =>
    fetchApi<{
      lockId: string;
      expiresAt: string;
      duration: number;
    }>("/seat-locks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  unlockSeats: (lockId: string) =>
    fetchApi<void>(`/seat-locks/${lockId}`, {
      method: "DELETE",
    }),

  extendLock: (lockId: string) =>
    fetchApi<{
      lockId: string;
      expiresAt: string;
    }>(`/seat-locks/${lockId}/extend`, {
      method: "PUT",
    }),

  getLockStatus: (lockId: string) =>
    fetchApi<{
      lockId: string;
      status: string;
      expiresAt: string;
      isValid: boolean;
    }>(`/seat-locks/${lockId}`),

  getActiveLocks: (showtimeId: string) =>
    fetchApi<Array<{
      id: string;
      userId: string;
      showtimeId: string;
      seatIds: string[];
      seatLabels: string[];
      status: string;
      expiresAt: string;
    }>>(`/seat-locks?showtimeId=${showtimeId}`),
};

export const usersApi = {
  getAll: () => fetchApi<User[]>("/users"),

  getCustomers: () => fetchApi<User[]>("/users/customers"),

  getById: (id: string) => fetchApi<User>(`/users/${id}`),

  getUserTickets: (id: string) => fetchApi<any[]>(`/users/${id}/tickets`),

  getUserBookings: (id: string) => fetchApi<Booking[]>(`/users/${id}/bookings`),

  create: (data: Omit<User, "id" | "createdAt">) =>
    fetchApi<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<User>) =>
    fetchApi<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/users/${id}`, {
      method: "DELETE",
    }),
};

export const settingsApi = {
  getAll: () => fetchApi<Record<string, string>>("/settings"),

  update: (key: string, value: string) =>
    fetchApi<{ key: string; value: string }>("/settings", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    }),
};

export const dashboardApi = {
  getAdminStats: () => fetchApi<DashboardStats>("/dashboard/admin-stats"),

  getCustomerStats: () =>
    fetchApi<CustomerDashboardStats>("/dashboard/customer-stats"),

  getRecentBookings: () => fetchApi<Booking[]>("/dashboard/recent-bookings"),

  getTopMovies: () =>
    fetchApi<{ movieTitle: string; bookings: number }[]>("/dashboard/top-movies"),

  getRevenueByDay: () =>
    fetchApi<{ date: string; revenue: number }[]>("/dashboard/revenue-by-day"),

  getRevenueByMovie: () =>
    fetchApi<{ title: string; revenue: number }[]>("/dashboard/revenue-by-movie"),

  getRevenueByTheater: () =>
    fetchApi<{ theater: string; revenue: number }[]>("/dashboard/revenue-by-theater"),

  getRevenueByGenre: () =>
    fetchApi<{ genre: string; revenue: number }[]>("/dashboard/revenue-by-genre"),

  getBookingsByGenre: () =>
    fetchApi<{ genre: string; bookings: number }[]>("/dashboard/bookings-by-genre"),
};

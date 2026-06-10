"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
} from "@/components/ui/charts";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { dashboardApi } from "@/services/api";
import { DollarSign, TrendingUp, Users, Film } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueByDay, setRevenueByDay] = useState<any[]>([]);
  const [revenueByMovie, setRevenueByMovie] = useState<any[]>([]);
  const [revenueByTheater, setRevenueByTheater] = useState<any[]>([]);
  const [revenueByGenre, setRevenueByGenre] = useState<any[]>([]);
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [bookingsByGenre, setBookingsByGenre] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsRes, dayRes, movieRes, theaterRes, genreRes, topMoviesRes, bookingsGenreRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        dashboardApi.getRevenueByDay(),
        dashboardApi.getRevenueByMovie(),
        dashboardApi.getRevenueByTheater(),
        dashboardApi.getRevenueByGenre(),
        dashboardApi.getTopMovies(),
        dashboardApi.getBookingsByGenre(),
      ]);

      if (statsRes.success) setStats(statsRes.data || {});
      if (dayRes.success) setRevenueByDay(Array.isArray(dayRes.data) ? dayRes.data : []);
      if (movieRes.success) setRevenueByMovie(Array.isArray(movieRes.data) ? movieRes.data : []);
      if (theaterRes.success) setRevenueByTheater(Array.isArray(theaterRes.data) ? theaterRes.data : []);
      if (genreRes.success) setRevenueByGenre(Array.isArray(genreRes.data) ? genreRes.data : []);
      if (topMoviesRes.success) setTopMovies(Array.isArray(topMoviesRes.data) ? topMoviesRes.data : []);
      if (bookingsGenreRes.success) setBookingsByGenre(Array.isArray(bookingsGenreRes.data) ? bookingsGenreRes.data : []);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />;

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Today's Revenue",
      value: `$${stats?.todayRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-pink-600",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Total Movies",
      value: stats?.totalMovies || 0,
      icon: Film,
      color: "text-blue-600",
    },
  ];

  const formatCurrency = (val: number) =>
    val != null ? `$${Number(val).toLocaleString()}` : "$0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your cinema revenue and performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Breakdown Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">By Day</TabsTrigger>
                <TabsTrigger value="movie">By Movie</TabsTrigger>
                <TabsTrigger value="theater">By Theater</TabsTrigger>
                <TabsTrigger value="genre">By Genre</TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <BarChartComponent
                  data={revenueByDay}
                  xKey="date"
                  yKey="revenue"
                  title="Daily Revenue"
                />
              </TabsContent>

              <TabsContent value="movie">
                {revenueByMovie.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revenueByMovie.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-primary font-semibold">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="theater">
                {revenueByTheater.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revenueByTheater.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{item.theater}</span>
                        <span className="text-primary font-semibold">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="genre">
                {revenueByGenre.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <PieChartComponent
                    data={revenueByGenre}
                    nameKey="genre"
                    valueKey="revenue"
                    title="Revenue by Genre"
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Top Movies & Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartComponent
            data={topMovies}
            xKey="movieTitle"
            yKey="bookings"
            title="Top Movies by Bookings"
          />

          <PieChartComponent
            data={bookingsByGenre}
            nameKey="genre"
            valueKey="bookings"
            title="Bookings by Genre"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
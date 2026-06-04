"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [revenue, setRevenue] = useState<any[]>([]);
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

      const [statsRes, revenueRes, moviesRes, genreRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        dashboardApi.getRevenueByDay(),
        dashboardApi.getTopMovies(),
        dashboardApi.getBookingsByGenre(),
      ]);

      if (statsRes.success) setStats(statsRes.data || {});
      if (revenueRes.success) setRevenue(Array.isArray(revenueRes.data) ? revenueRes.data : []);
      if (moviesRes.success) setTopMovies(Array.isArray(moviesRes.data) ? moviesRes.data : []);
      if (genreRes.success) setBookingsByGenre(Array.isArray(genreRes.data) ? genreRes.data : []);
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChartComponent
            data={revenue}
            xKey="date"
            yKey="revenue"
            title="Revenue Trend"
          />

          <BarChartComponent
            data={topMovies}
            xKey="movieTitle"
            yKey="bookings"
            title="Top Movies by Bookings"
          />
        </div>

        <PieChartComponent
          data={bookingsByGenre}
          nameKey="genre"
          valueKey="bookings"
          title="Bookings by Genre"
        />
      </div>
    </DashboardLayout>
  );
}
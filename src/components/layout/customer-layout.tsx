"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Film, Home, Ticket, User, LogOut, Menu, X, ArrowLeftFromLine } from "lucide-react";
import { useState, useEffect } from "react";

const customerNav = [
  { name: "Home", href: "/customer/home", icon: Home },
  { name: "Movies", href: "/customer/movies", icon: Film },
  { name: "My Tickets", href: "/customer/tickets", icon: Ticket },
  { name: "Profile", href: "/customer/profile", icon: User },
];

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsAdminPreview(localStorage.getItem("admin_customer_view") === "true");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isAdminPreview && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <span className="text-yellow-400 text-sm font-medium flex items-center gap-2">
              <span className="hidden sm:inline">⚡ Admin Preview Mode —</span> Viewing as customer
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-yellow-400 hover:text-yellow-300 gap-2 shrink-0"
              onClick={() => {
                localStorage.removeItem("admin_customer_view");
                router.push("/admin/dashboard");
              }}
            >
              <ArrowLeftFromLine className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Preview</span>
            </Button>
          </div>
        </div>
      )}
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/customer/home" className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">CinemaBook</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {customerNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.name}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="hidden md:flex"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4">
              <div className="flex flex-col gap-2">
                {customerNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}

                {user && (
                  <Button
                    variant="ghost"
                    className="justify-start gap-2 px-4"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CinemaBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
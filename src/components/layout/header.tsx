import * as React from "react"
import Link from "next/link"
import { Clapperboard, Search, User, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  isLoggedIn?: boolean
  userName?: string
}

export function Header({ isLoggedIn, userName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Clapperboard className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-2xl font-bold text-foreground hidden sm:inline">
              CinemaBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/customer/movies"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Movies
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/customer/home"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Showtimes
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/customer/bookings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              My Bookings
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:flex items-center bg-accent rounded-lg px-3 py-2 w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies..."
                className="ml-2 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
              />
            </div>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/customer/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">{userName || "Profile"}</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/login">Book Now</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/customer/movies"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/customer/home"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Showtimes
            </Link>
            <Link
              href="/customer/bookings"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              My Bookings
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

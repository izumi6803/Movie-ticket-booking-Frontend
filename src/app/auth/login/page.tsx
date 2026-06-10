"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clapperboard, Mail, Lock, Loader2, User, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "register";

// Sample carousel images for the login page
const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1489599849228-bed2db80ce2d?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1532618942605-8e3f6921ae47?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=700&fit=crop",
];

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const { login, register } = useAuth();
  const router = useRouter();

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const validateForm = () => {
    if (mode === "register" && !name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    // Chỉ kiểm tra độ dài password khi đăng ký
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (mode === "login") {
        result = await login({ email, password });
      } else {
        result = await register({ name, email, password, phone });
      }

      if (!result.success) {
          setError(result.message || (mode === "login" ? "Login failed" : "Registration failed"));
      }
    } catch {
      if (mode === "login") {
        setError("Cannot connect to server. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Form */}
          <div className="flex flex-col">
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <Clapperboard className="h-10 w-10 text-[#ff1744]" />
                <span className="text-3xl font-bold text-white">CinemaBook</span>
              </Link>
            </div>

            <div className="bg-card rounded-lg shadow-2xl overflow-hidden">
              {/* Header Tabs */}
              <div className="bg-[#ff1744] px-6 py-4 flex items-center gap-8">
                <h2 className="text-xl font-bold text-white">
                  {mode === "login" ? "Sign In" : "Sign Up"}
                </h2>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </button>
                )}
                {mode === "register" && (
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                    {error}
                  </div>
                )}

                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#ff1744] focus:border-transparent outline-none transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email or Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#ff1744] focus:border-transparent outline-none transition-all"
                      placeholder="Email or Phone Number"
                      required
                    />
                  </div>
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#ff1744] focus:border-transparent outline-none transition-all"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-[#ff1744] focus:border-transparent outline-none transition-all"
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ff1744] hover:bg-[#e8102d] text-white font-bold py-3 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {mode === "login" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : mode === "login" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                {mode === "login" && (
                  <div className="text-center pt-4">
                    {/* <Link
                      href="/auth/forgot-password"
                      className="text-sm text-[#ff1744] hover:underline font-medium"
                    >
                      Forgot your password?
                    </Link> */}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Carousel (Hidden on mobile) */}
          <div className="hidden md:flex relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
            {/* Carousel Images */}
            <div className="absolute inset-0">
              {CAROUSEL_IMAGES.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    index === slideIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {CAROUSEL_IMAGES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    index === slideIndex ? "bg-[#ff1744]" : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          /* Form fills full screen on mobile */
        }
      `}</style>
    </div>
  );
}

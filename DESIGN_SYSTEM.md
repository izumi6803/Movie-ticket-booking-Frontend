# 🎬 Modern Cinema UI Design System

## Overview
Your cinema booking platform has been redesigned with a modern dark theme inspired by leading cinema websites like CGV. This document outlines the new design system, components, and implementation guidelines.

---

## 🎨 Color Palette

### Primary Colors (Dark Modern Theme)
```
Background:    #0a0e27 (Deep Navy)
Card:          #1a1f3a (Dark Blue-Purple)
Foreground:    #ffffff (White)

Primary:       #ff1744 (Vibrant Red) - Call-to-action buttons, highlights
Secondary:     #ffd700 (Gold) - Premium accents, ratings
Accent:        #2a2f4a (Muted Purple) - Hover states, separators
```

### Status Colors
```
Success:       #00d084 (Green) - Booking confirmed, payment success
Warning:       #ffb800 (Orange) - Pending payments, alerts
Destructive:   #ff4444 (Red) - Errors, cancellations
Info:          #00bfff (Cyan) - Information, notifications
```

---

## 📦 New Components

### 1. **Header Component** (`src/components/layout/header.tsx`)
Modern sticky navigation with:
- **Logo & Branding** - CinemaBook with hover animation
- **Navigation Links** - Movies, Showtimes, My Bookings with animated underlines
- **Search Bar** - Desktop search with icon
- **User Menu** - Sign in/Book Now buttons or user profile
- **Mobile Menu** - Responsive hamburger menu
- **Features:**
  - Sticky positioning with backdrop blur
  - Smooth hover animations
  - Responsive design (hidden elements on mobile)
  - Dark theme optimized

### 2. **Hero Section Component** (`src/components/layout/hero-section.tsx`)
Featured movie display with:
- **Background Image** - Movie poster with gradient overlays
- **Content** - Title, description, rating
- **Call-to-Action** - Book Now and Learn More buttons
- **Features:**
  - Dual gradient overlay (left to right, top to bottom)
  - Star rating badge with gold accent
  - Responsive text sizing
  - Smooth button animations

### 3. **Movie Card Component** (`src/components/layout/movie-card.tsx`)
Individual movie display card with:
- **Poster Image** - Aspect ratio 2:3 with hover zoom
- **Status Badge** - "Now Showing" or "Coming Soon"
- **Rating** - Star rating in bottom-left corner
- **Metadata** - Genre, Duration, Viewers count
- **Features:**
  - Hover scale animation on poster
  - Line-clamped title (2 lines max)
  - Genre tags (max 2 displayed)
  - Duration and viewer count
  - Book Tickets button (only for now showing)

---

## 🎯 Design Patterns

### Animations
```css
- Hover Scale: translateX/Y for cards and buttons
- Underline Animation: width transition on navigation
- Color Transitions: Smooth hover color changes
- Duration: 300ms for smooth, responsive feel
```

### Spacing
```
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
```

### Typography
```
Headlines: Bold, 28px-48px (responsive)
Body: Regular, 14px-16px
Captions: 12px-14px, muted color
```

### Border Radius
- Buttons: 0.75rem (12px)
- Cards: 0.75rem (12px)
- Images: 0.75rem (12px)

---

## 🔧 Implementation Guide

### Using the Header Component
```tsx
import { Header } from "@/components/layout/header"

export default function Layout() {
  return (
    <>
      <Header 
        isLoggedIn={true}
        userName="John Doe"
      />
      {/* Page content */}
    </>
  )
}
```

### Using the Hero Section
```tsx
import { HeroSection } from "@/components/layout/hero-section"

<HeroSection
  title="Oppenheimer"
  description="Experience the epic story that changed history"
  posterUrl="/movies/oppenheimer.jpg"
  rating={8.7}
  onBookNow={() => router.push('/booking')}
/>
```

### Using Movie Cards
```tsx
import { MovieCard } from "@/components/layout/movie-card"

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {movies.map((movie) => (
    <MovieCard
      key={movie.id}
      id={movie.id}
      title={movie.title}
      posterUrl={movie.posterUrl}
      rating={movie.rating}
      duration={movie.duration}
      genre={movie.genre}
      status={movie.status}
      viewers={movie.viewers}
    />
  ))}
</div>
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px (full width, stack layout)
Tablet:     640px - 1024px (2-3 columns)
Desktop:    1024px+ (4+ columns)
```

---

## 🚀 Next Steps

- [ ] Update customer home page to use Header + HeroSection + MovieCards
- [ ] Create admin header and dashboard redesign
- [ ] Update booking flow UI with modern design
- [ ] Add animations and micro-interactions
- [ ] Test on all devices and browsers
- [ ] Optimize images and performance

---

## 📚 Best Practices

1. **Always use responsive classes** - `hidden sm:flex md:hidden lg:flex`
2. **Maintain color consistency** - Use CSS variables from s.css
3. **Add hover states** - Every interactive element should have feedback
4. **Keep animations subtle** - 300ms duration, easing functions
5. **Test on mobile first** - Design mobile experience, enhance for desktop
6. **Use semantic HTML** - Proper heading hierarchy, alt text for images

---

## 🎬 Cinema Industry Standards Implemented

- ✅ Dark theme (reduces eye strain in theaters)
- ✅ Large, readable typography
- ✅ Clear call-to-action buttons (primary red)
- ✅ Movie ratings and metadata visible
- ✅ Quick booking flow
- ✅ Mobile-first responsive design
- ✅ Accessible color contrasts
- ✅ Fast, smooth interactions


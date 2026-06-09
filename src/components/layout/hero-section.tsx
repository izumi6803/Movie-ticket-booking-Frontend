"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Play, Star } from "lucide-react"

interface HeroSectionProps {
  title?: string
  description?: string
  posterUrl?: string
  rating?: number
  onBookNow?: () => void
}

export function HeroSection({
  title = "Coming Soon",
  description = "Experience cinema like never before",
  posterUrl,
  rating = 8.5,
  onBookNow,
}: HeroSectionProps) {
  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: posterUrl ? `url(${posterUrl})` : "linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 sm:p-12">
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground max-w-2xl leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="w-full text-muted-foreground text-lg max-w-xl">
            {description}
          </p>

          {/* Rating and Actions */}
          <div className="flex items-center gap-6 pt-4">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-lg">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="ml-1 font-semibold text-yellow-500">{rating}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 text-white"
                onClick={onBookNow}
              >
                <Play className="h-4 w-4" />
                Book Now
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MovieCardProps {
  id: string
  title: string
  posterUrl?: string
  rating?: number
  duration?: number
  genre?: string[]
  status?: "now-showing" | "coming-soon"
  viewers?: number
}

export function MovieCard({
  id,
  title,
  posterUrl,
  rating = 0,
  duration = 0,
  genre = [],
  status = "now-showing",
  viewers = 0,
}: MovieCardProps) {
  return (
    <Link href={`/customer/movies/${id}`}>
      <div className="group cursor-pointer">
        {/* Poster Image */}
        <div className="relative overflow-hidden rounded-xl mb-4 aspect-[2/3] bg-accent">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant={status === "coming-soon" ? "secondary" : "default"}
              className={status === "coming-soon" ? "bg-secondary-600" : "bg-primary"}
            >
              {status === "coming-soon" ? "Coming Soon" : "Now Showing"}
            </Badge>
          </div>

          {/* Rating Overlay */}
          {rating > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 px-3 py-1.5 rounded-lg">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-500">{rating}</span>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Genre Tags */}
          {genre.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="outline" className="text-xs bg-transparent border-border">
                  {g}
                </Badge>
              ))}
            </div>
          )}

          {/* Duration & Viewers */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            {duration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{duration}m</span>
              </div>
            )}
            {viewers > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{viewers}k watching</span>
              </div>
            )}
          </div>

          {/* Book Button */}
          {status === "now-showing" && (
            <Button
              size="sm"
              className="w-full mt-3 bg-primary hover:bg-primary/90"
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              Book Tickets
            </Button>
          )}
        </div>
      </div>
    </Link>
  )
}

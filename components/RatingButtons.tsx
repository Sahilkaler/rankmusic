"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Meh, ThumbsUp, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RATING_COLORS } from "@/lib/ratings"

interface RatingButtonsProps {
  albumId: string
  currentRating: "SKIP" | "TIMEPASS" | "GOOD" | "PERFECTION" | null
  onRatingChange?: () => void
}

export default function RatingButtons({
  albumId,
  currentRating,
  onRatingChange,
}: RatingButtonsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRating = async (rating: "SKIP" | "TIMEPASS" | "GOOD" | "PERFECTION") => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          rating,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to rate album")
      }

      if (onRatingChange) {
        onRatingChange()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error rating album:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveRating = async () => {
    if (!session) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/ratings?albumId=${albumId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove rating")
      }

      if (onRatingChange) {
        onRatingChange()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error removing rating:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" disabled>
          <Trash2 className="h-4 w-4 mr-2" />
          Skip
        </Button>
        <Button variant="outline" disabled>
          <Meh className="h-4 w-4 mr-2" />
          Timepass
        </Button>
        <Button variant="outline" disabled>
          <ThumbsUp className="h-4 w-4 mr-2" />
          Good
        </Button>
        <Button variant="outline" disabled>
          <Star className="h-4 w-4 mr-2" />
          Perfection
        </Button>
        <p className="text-sm text-muted-foreground w-full">
          Sign in to rate albums
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <Button
        className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
          currentRating === "SKIP"
            ? "text-white"
            : "bg-transparent border-2 text-white hover:bg-white/10"
        }`}
        style={{
          backgroundColor: currentRating === "SKIP" ? RATING_COLORS.SKIP : "transparent",
          borderColor: currentRating === "SKIP" ? RATING_COLORS.SKIP : RATING_COLORS.SKIP,
        }}
        onClick={() => handleRating("SKIP")}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Skip
      </Button>
      <Button
        className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
          currentRating === "TIMEPASS"
            ? "text-white"
            : "bg-transparent border-2 text-white hover:bg-white/10"
        }`}
        style={{
          backgroundColor: currentRating === "TIMEPASS" ? RATING_COLORS.TIMEPASS : "transparent",
          borderColor: currentRating === "TIMEPASS" ? RATING_COLORS.TIMEPASS : RATING_COLORS.TIMEPASS,
        }}
        onClick={() => handleRating("TIMEPASS")}
        disabled={isLoading}
      >
        <Meh className="h-4 w-4 mr-2" />
        Timepass
      </Button>
      <Button
        className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
          currentRating === "GOOD"
            ? "text-white"
            : "bg-transparent border-2 text-white hover:bg-white/10"
        }`}
        style={{
          backgroundColor: currentRating === "GOOD" ? RATING_COLORS.GOOD : "transparent",
          borderColor: currentRating === "GOOD" ? RATING_COLORS.GOOD : RATING_COLORS.GOOD,
        }}
        onClick={() => handleRating("GOOD")}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4 mr-2" />
        Good
      </Button>
      <Button
        className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
          currentRating === "PERFECTION"
            ? "text-white"
            : "bg-transparent border-2 text-white hover:bg-white/10"
        }`}
        style={{
          backgroundColor: currentRating === "PERFECTION" ? RATING_COLORS.PERFECTION : "transparent",
          borderColor: currentRating === "PERFECTION" ? RATING_COLORS.PERFECTION : RATING_COLORS.PERFECTION,
        }}
        onClick={() => handleRating("PERFECTION")}
        disabled={isLoading}
      >
        <Star className="h-4 w-4 mr-2" />
        Perfection
      </Button>
      {currentRating && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={handleRemoveRating}
          disabled={isLoading}
        >
          Remove rating
        </Button>
      )}
    </div>
  )
}



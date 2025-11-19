"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Meh, ThumbsUp, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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
    <div className="flex gap-2 flex-wrap">
      <Button
        variant={currentRating === "SKIP" ? "default" : "outline"}
        onClick={() => handleRating("SKIP")}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Skip
      </Button>
      <Button
        variant={currentRating === "TIMEPASS" ? "default" : "outline"}
        onClick={() => handleRating("TIMEPASS")}
        disabled={isLoading}
      >
        <Meh className="h-4 w-4 mr-2" />
        Timepass
      </Button>
      <Button
        variant={currentRating === "GOOD" ? "default" : "outline"}
        onClick={() => handleRating("GOOD")}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4 mr-2" />
        Good
      </Button>
      <Button
        variant={currentRating === "PERFECTION" ? "default" : "outline"}
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
          onClick={handleRemoveRating}
          disabled={isLoading}
        >
          Remove rating
        </Button>
      )}
    </div>
  )
}



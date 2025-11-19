"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { UserPlus, UserMinus } from "lucide-react"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  userId: string
  username: string
}

export default function FollowButton({ userId, username }: FollowButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!session?.user?.id || session.user.id === userId) {
      setIsLoading(false)
      return
    }

    // Check if already following
    fetch(`/api/user/${userId}/followers`)
      .then((res) => res.json())
      .then((followers) => {
        const isUserFollowing = followers.some(
          (f: { id: string }) => f.id === session.user.id
        )
        setIsFollowing(isUserFollowing)
      })
      .catch((error) => {
        console.error("Error checking follow status:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [session, userId])

  const handleFollow = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setIsUpdating(true)
    try {
      if (isFollowing) {
        await fetch(`/api/user/follow?followingId=${userId}`, {
          method: "DELETE",
        })
        setIsFollowing(false)
      } else {
        await fetch("/api/user/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: userId }),
        })
        setIsFollowing(true)
      }
    } catch (error) {
      console.error("Error updating follow:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!session || session.user.id === userId) {
    return null
  }

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isUpdating}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}



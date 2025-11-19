"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, User } from "lucide-react"
import FollowButton from "@/components/FollowButton"
import { useSession } from "next-auth/react"

export default function UsersPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) {
      setUsers([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Search Users</h1>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by username or name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // Optional: debounce search as user types
                if (e.target.value.trim()) {
                  handleSearch()
                } else {
                  setUsers([])
                }
              }}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {users.length > 0 ? (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${user.username}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                        {user.name || user.username}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>{user._count.followers} followers</span>
                      <span>{user._count.following} following</span>
                      <span>{user._count.ratings} ratings</span>
                    </div>
                  </div>
                  {session && session.user.id !== user.id && (
                    <FollowButton userId={user.id} username={user.username} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query && !isLoading ? (
        <p className="text-muted-foreground text-center py-12">
          No users found. Try a different search term.
        </p>
      ) : !query ? (
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Enter a username or name to search for users
          </p>
        </div>
      ) : null}
    </div>
  )
}


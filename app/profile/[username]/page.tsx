import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import FollowButton from "@/components/FollowButton"
import AlbumCard from "@/components/AlbumCard"
import { Card, CardContent } from "@/components/ui/card"

async function getUserProfile(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        ratings: {
          include: {
            album: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    })
    return user
  } catch {
    return null
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const session = await getServerSession(authOptions)
  const user = await getUserProfile(params.username)

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0) || user.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {user.name || user.username}
                </h1>
                <p className="text-muted-foreground mb-2">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-muted-foreground mb-4">{user.bio}</p>
                )}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-semibold">{user._count.followers}</span>{" "}
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{user._count.following}</span>{" "}
                    <span className="text-muted-foreground">following</span>
                  </div>
                  <div>
                    <span className="font-semibold">{user.ratings.length}</span>{" "}
                    <span className="text-muted-foreground">ratings</span>
                  </div>
                </div>
              </div>
              {!isOwnProfile && (
                <FollowButton userId={user.id} username={user.username} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Rated Albums</h2>
        {user.ratings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {user.ratings.map((rating) => (
              <div key={rating.id} className="relative">
                <AlbumCard
                  id={rating.album.id}
                  title={rating.album.title}
                  artist={rating.album.artist}
                  coverUrl={rating.album.coverUrl}
                />
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                  {rating.rating}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No ratings yet.</p>
        )}
      </div>
    </div>
  )
}



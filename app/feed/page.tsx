import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { RATING_COLORS } from "@/lib/ratings"

async function getFeed(userId: string) {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })

    const followingIds = follows.map((f) => f.followingId)

    if (followingIds.length === 0) {
      return []
    }

    const ratings = await prisma.rating.findMany({
      where: {
        userId: { in: followingIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        album: {
          select: {
            id: true,
            title: true,
            artist: true,
            coverUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return ratings
  } catch {
    return []
  }
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const feed = await getFeed(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Feed</h1>

      {feed.length > 0 ? (
        <div className="space-y-4">
          {feed.map((rating: any) => (
            <Card key={rating.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/profile/${rating.user.username}`}>
                    <Avatar>
                      <AvatarImage src={rating.user.image || undefined} />
                      <AvatarFallback>
                        {rating.user.name?.charAt(0) || rating.user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm mb-2">
                          <Link
                            href={`/profile/${rating.user.username}`}
                            className="font-semibold hover:underline"
                          >
                            {rating.user.name || rating.user.username}
                          </Link>{" "}
                          rated{" "}
                          <Link
                            href={`/album/${rating.album.id}`}
                            className="font-semibold hover:underline"
                          >
                            {rating.album.title}
                          </Link>{" "}
                          by{" "}
                          <span className="font-semibold">{rating.album.artist}</span> as{" "}
                          <span
                            className="font-semibold"
                            style={{
                              color: RATING_COLORS[rating.rating as keyof typeof RATING_COLORS],
                            }}
                          >
                            {rating.rating}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {rating.album.coverUrl && (
                        <Link href={`/album/${rating.album.id}`}>
                          <div className="relative w-16 h-16 rounded overflow-hidden">
                            <Image
                              src={rating.album.coverUrl}
                              alt={rating.album.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Your feed is empty. Start following users to see their ratings!
          </p>
          <Link href="/search">
            <span className="text-primary hover:underline">Discover albums</span>
          </Link>
        </div>
      )}
    </div>
  )
}


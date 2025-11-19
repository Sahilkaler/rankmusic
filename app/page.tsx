import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AlbumCard from "@/components/AlbumCard"
import Link from "next/link"
import { ensureAlbumsArtwork } from "@/lib/album-service"

async function getTrendingAlbums() {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const trendingAlbums = await prisma.album.findMany({
      include: {
        ratings: {
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      orderBy: {
        ratings: {
          _count: "desc",
        },
      },
      take: 20,
    })

    const albumsWithArtwork = await ensureAlbumsArtwork(trendingAlbums)

    return albumsWithArtwork
      .map((album) => ({
        ...album,
        recentRatingCount: album.ratings.length,
      }))
      .sort((a, b) => b.recentRatingCount - a.recentRatingCount)
  } catch {
    return []
  }
}

async function getRecentRatings() {
  try {
    const ratings = await prisma.rating.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        album: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    })
    return ratings
  } catch {
    return []
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const trendingAlbums = await getTrendingAlbums()
  const recentRatings = await getRecentRatings()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Music Rank</h1>
        <p className="text-muted-foreground">
          Rate and discover your favorite music albums
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Trending Albums</h2>
        {trendingAlbums.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {trendingAlbums.map((album: any) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.title}
                artist={album.artist}
                coverUrl={album.coverUrl}
                ratingCount={album.recentRatingCount}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No trending albums yet. Start rating!</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Ratings</h2>
        {recentRatings.length > 0 ? (
          <div className="space-y-4">
            {recentRatings.map((rating: any) => (
              <div
                key={rating.id}
                className="flex items-center gap-4 p-4 border rounded-lg bg-card"
              >
                <div className="flex-shrink-0">
                  {rating.user.image ? (
                    <img
                      src={rating.user.image}
                      alt={rating.user.name || rating.user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {(rating.user.name || rating.user.username)?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link
                      href={`/profile/${rating.user.username || rating.user.id}`}
                      className="font-semibold text-primary hover:text-[hsl(var(--primary-hover))]"
                    >
                      {rating.user.name || rating.user.username}
                    </Link>{" "}
                    rated{" "}
                    <span className="font-semibold">{rating.album.title}</span> by{" "}
                    <span className="font-semibold">{rating.album.artist}</span> as{" "}
                    <span className="font-semibold text-primary">{rating.rating}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recent ratings yet.</p>
        )}
      </section>
    </div>
  )
}


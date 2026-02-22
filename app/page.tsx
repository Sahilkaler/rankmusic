import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AlbumCard from "@/components/AlbumCard"
import Link from "next/link"
import { getNewReleasesByGenre, getLatestReleasesFromDB } from "@/lib/genre-releases"

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

    return trendingAlbums
      .map((album) => ({
        ...album,
        recentRatingCount: album.ratings.length,
      }))
      .sort((a, b) => b.recentRatingCount - a.recentRatingCount)
  } catch (error) {
    console.error("Error fetching trending albums:", error)
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
  } catch (error) {
    console.error("Error fetching recent ratings:", error)
    return []
  }
}

async function getLatestReleases() {
  try {
    // First try to get fresh releases from Spotify
    const genreReleases = await getNewReleasesByGenre()
    
    if (genreReleases.length > 0 && genreReleases[0].albums.length > 0) {
      return genreReleases[0].albums
    }
    
    // Fallback to database
    const dbAlbums = await getLatestReleasesFromDB()
    return dbAlbums
  } catch (error) {
    console.error("Error fetching latest releases:", error)
    // Final fallback to database
    try {
      return await getLatestReleasesFromDB()
    } catch {
      return []
    }
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const trendingAlbums = await getTrendingAlbums()
  const recentRatings = await getRecentRatings()
  const latestReleases = await getLatestReleases()

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-12">
        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Welcome to Music Rank
        </h1>
        <p className="text-muted-foreground text-lg">
          Rate and discover your favorite music albums
        </p>
      </div>

      {/* Trending Albums Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Trending Albums</h2>
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
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground mb-4">No trending albums yet.</p>
            <Link href="/search" className="text-primary hover:underline">
              Search and rate some albums to get started!
            </Link>
          </div>
        )}
      </section>

      {/* Latest Releases Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Latest Releases</h2>
        {latestReleases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {latestReleases.map((album: any) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.title}
                artist={album.artist}
                coverUrl={album.coverUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground">
              No releases to show. Search for albums to add them to your collection!
            </p>
          </div>
        )}
      </section>

      {/* Recent Ratings Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Recent Ratings</h2>
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
                      {(rating.user.name || rating.user.username)?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <Link
                      href={`/profile/${rating.user.username || rating.user.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {rating.user.name || rating.user.username}
                    </Link>{" "}
                    rated{" "}
                    <Link
                      href={`/album/${rating.album.id}`}
                      className="font-semibold hover:text-primary"
                    >
                      {rating.album.title}
                    </Link>{" "}
                    by{" "}
                    <span className="text-muted-foreground">{rating.album.artist}</span>{" "}
                    as{" "}
                    <span className={`font-semibold ${
                      rating.rating === 'PERFECTION' ? 'text-green-500' :
                      rating.rating === 'GOOD' ? 'text-blue-500' :
                      rating.rating === 'TIMEPASS' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {rating.rating}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground">No ratings yet. Be the first to rate an album!</p>
          </div>
        )}
      </section>
    </div>
  )
}

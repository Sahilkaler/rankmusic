import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import RatingButtons from "@/components/RatingButtons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RatingChart from "@/components/RatingChart"
import { RATING_COLORS } from "@/lib/ratings"
import Link from "next/link"
import AlbumCover from "@/components/AlbumCover"

async function getAlbum(id: string, userId?: string) {
  try {
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!album) return null

    const ratingCounts = {
      SKIP: 0,
      TIMEPASS: 0,
      GOOD: 0,
      PERFECTION: 0,
    }

    album.ratings.forEach((rating) => {
      ratingCounts[rating.rating]++
    })

    const totalRatings = album.ratings.length
    const averageRating = totalRatings > 0
      ? Object.entries(ratingCounts).reduce((acc, [rating, count]) => {
          const weights = { SKIP: 0, TIMEPASS: 1, GOOD: 2, PERFECTION: 3 }
          return acc + (weights[rating as keyof typeof weights] * count)
        }, 0) / totalRatings
      : 0

    let userRating = null
    if (userId) {
      const rating = await prisma.rating.findUnique({
        where: {
          userId_albumId: {
            userId,
            albumId: album.id,
          },
        },
      })
      userRating = rating?.rating || null
    }

    return {
      ...album,
      ratingCounts,
      totalRatings,
      averageRating,
      userRating,
    }
  } catch {
    return null
  }
}

export default async function AlbumPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const album = await getAlbum(params.id, session?.user?.id)

  if (!album) {
    notFound()
  }

  const chartData = Object.entries(album.ratingCounts || {})
    .filter(([_, count]) => count > 0)
    .map(([rating, count]) => ({
      name: rating,
      value: count,
    }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <AlbumCover
            coverUrl={album.coverUrl}
            title={album.title}
            artist={album.artist}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
            <p className="text-2xl text-muted-foreground mb-4">{album.artist}</p>
            {album.releaseDate && (
              <p className="text-sm text-muted-foreground">
                Released: {album.releaseDate}
              </p>
            )}
            {album.genres && album.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {album.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-secondary rounded-md text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Rate This Album</h2>
            <RatingButtons
              albumId={album.id}
              currentRating={album.userRating}
            />
          </div>

          {album.totalRatings > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rating Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Total Ratings: {album.totalRatings}
                    </p>
                    <div className="space-y-2">
                      {Object.entries(album.ratingCounts).map(([rating, count]: [string, any]) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="w-24 text-sm">{rating}:</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(count / album.totalRatings) * 100}%`,
                                backgroundColor: RATING_COLORS[rating as keyof typeof RATING_COLORS],
                              }}
                            />
                          </div>
                          <span className="text-sm w-12 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {chartData.length > 0 && (
                    <RatingChart data={chartData} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {album.ratings && album.ratings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Recent Ratings</h2>
          <div className="space-y-4">
            {album.ratings.slice(0, 10).map((rating: any) => (
              <Card key={rating.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {rating.user.image ? (
                      <img
                        src={rating.user.image}
                        alt={rating.user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {rating.user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">
                        <Link
                          href={`/profile/${rating.user.username}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {rating.user.username}
                        </Link>{" "}
                        rated this as{" "}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

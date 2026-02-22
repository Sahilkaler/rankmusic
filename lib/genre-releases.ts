import { getNewReleases } from "./spotify"
import { prisma } from "./prisma"

interface SpotifyAlbumData {
  spotifyId: string
  title: string
  artist: string
  releaseDate: string
  coverUrl: string | null
  genres?: string[]
}

interface GenreReleases {
  genre: string
  albums: any[]
}

export async function getNewReleasesByGenre(): Promise<GenreReleases[]> {
  try {
    // Fetch new releases from Spotify
    const newReleases: SpotifyAlbumData[] = await getNewReleases(20)

    if (!newReleases || newReleases.length === 0) {
      console.log("No new releases returned from Spotify")
      return []
    }

    // Upsert albums into database
    const albums = await Promise.all(
      newReleases.map(async (albumData: SpotifyAlbumData) => {
        try {
          const album = await prisma.album.upsert({
            where: { spotifyId: albumData.spotifyId },
            update: {
              title: albumData.title,
              artist: albumData.artist,
              releaseDate: albumData.releaseDate,
              coverUrl: albumData.coverUrl,
            },
            create: {
              spotifyId: albumData.spotifyId,
              title: albumData.title,
              artist: albumData.artist,
              releaseDate: albumData.releaseDate,
              coverUrl: albumData.coverUrl,
              genres: [],
            },
          })
          return album
        } catch (error) {
          console.error(`Error upserting album ${albumData.title}:`, error)
          return null
        }
      })
    )

    // Filter out any failed upserts
    const validAlbums = albums.filter((album): album is NonNullable<typeof album> => album !== null)

    if (validAlbums.length === 0) {
      return []
    }

    // Return as a single "Latest Releases" section
    return [
      {
        genre: "Latest Releases",
        albums: validAlbums.slice(0, 20),
      },
    ]
  } catch (error) {
    console.error("Error fetching new releases:", error)
    return []
  }
}

// Get latest releases from database (cached/stored albums)
export async function getLatestReleasesFromDB(): Promise<any[]> {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return albums
  } catch (error) {
    console.error("Error fetching latest releases from DB:", error)
    return []
  }
}

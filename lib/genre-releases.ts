import { getNewReleases, getSpotifyAlbum } from "./spotify"
import { prisma } from "./prisma"
import { ensureAlbumsArtwork } from "./album-service"

interface SpotifyAlbumData {
  spotifyId: string
  title: string
  artist: string
  releaseDate: string
  coverUrl: string
  genres?: string[]
}

interface GenreReleases {
  genre: string
  albums: any[]
}

// Popular genres to prioritize
const POPULAR_GENRES = [
  "pop",
  "rock",
  "hip-hop",
  "rap",
  "r&b",
  "country",
  "electronic",
  "indie",
  "alternative",
  "jazz",
  "classical",
  "metal",
  "punk",
  "reggae",
  "blues",
]

export async function getNewReleasesByGenre(): Promise<GenreReleases[]> {
  try {
    // Fetch new releases from Spotify
    const newReleases: SpotifyAlbumData[] = await getNewReleases(50)

    // Upsert albums into database
    const albums = await Promise.all(
      newReleases.map(async (albumData: SpotifyAlbumData) => {
        // Upsert album
        const album = await prisma.album.upsert({
          where: { spotifyId: albumData.spotifyId },
          update: {
            title: albumData.title,
            artist: albumData.artist,
            releaseDate: albumData.releaseDate,
            coverUrl: albumData.coverUrl,
            genres: albumData.genres || [],
          },
          create: {
            spotifyId: albumData.spotifyId,
            title: albumData.title,
            artist: albumData.artist,
            releaseDate: albumData.releaseDate,
            coverUrl: albumData.coverUrl,
            genres: albumData.genres || [],
          },
        })

        // If album doesn't have genres, try to fetch full details
        if (!album.genres || album.genres.length === 0) {
          try {
            await new Promise((resolve) => setTimeout(resolve, 100)) // Avoid rate limits
            const fullAlbum = await getSpotifyAlbum(albumData.spotifyId)
            if (fullAlbum.genres && fullAlbum.genres.length > 0) {
              await prisma.album.update({
                where: { id: album.id },
                data: { genres: fullAlbum.genres },
              })
              album.genres = fullAlbum.genres
            }
          } catch (error) {
            console.error(`Error fetching genres for album ${album.id}:`, error)
          }
        }

        return album
      })
    )

    // Ensure all albums have artwork
    const albumsWithArtwork = await ensureAlbumsArtwork(albums)

    // Group albums by genre
    const genreMap = new Map<string, any[]>()

    albumsWithArtwork.forEach((album) => {
      if (album.genres && album.genres.length > 0) {
        album.genres.forEach((genre: string) => {
          const normalizedGenre = genre.toLowerCase().trim()
          if (!genreMap.has(normalizedGenre)) {
            genreMap.set(normalizedGenre, [])
          }
          genreMap.get(normalizedGenre)!.push(album)
        })
      } else {
        if (!genreMap.has("other")) {
          genreMap.set("other", [])
        }
        genreMap.get("other")!.push(album)
      }
    })

    // Convert to array and prioritize popular genres
    const genreReleases: GenreReleases[] = []

    POPULAR_GENRES.forEach((genre) => {
      const albums = genreMap.get(genre)
      if (albums && albums.length > 0) {
        genreReleases.push({
          genre: genre.charAt(0).toUpperCase() + genre.slice(1),
          albums: albums.slice(0, 10),
        })
        genreMap.delete(genre)
      }
    })

    genreMap.forEach((albums, genre) => {
      if (albums.length > 0) {
        genreReleases.push({
          genre: genre.charAt(0).toUpperCase() + genre.slice(1),
          albums: albums.slice(0, 10),
        })
      }
    })

    return genreReleases
      .sort((a, b) => b.albums.length - a.albums.length)
      .slice(0, 6)
  } catch (error) {
    console.error("Error fetching new releases by genre:", error)
    return []
  }
}

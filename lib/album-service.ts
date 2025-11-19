import { prisma } from "./prisma"
import { getSpotifyAlbum } from "./spotify"

type AlbumRecord = {
  id: string
  spotifyId: string | null
  coverUrl: string | null
  title?: string | null
  artist?: string | null
}

export async function ensureAlbumsArtwork<T extends AlbumRecord>(albums: T[]) {
  return Promise.all(
    albums.map(async (album) => {
      if (album.coverUrl || !album.spotifyId) {
        return album
      }

      try {
        const spotifyAlbum = await getSpotifyAlbum(album.spotifyId)
        if (spotifyAlbum?.coverUrl) {
          await prisma.album.update({
            where: { id: album.id },
            data: {
              coverUrl: spotifyAlbum.coverUrl,
              title: spotifyAlbum.title ?? album.title,
              artist: spotifyAlbum.artist ?? album.artist,
            },
          })
          return { ...album, coverUrl: spotifyAlbum.coverUrl } as T
        }
      } catch (error) {
        console.error("Failed to fetch album artwork", album.spotifyId, error)
      }

      return album
    })
  )
}


import { getNewReleases } from "@/lib/spotify"
import { prisma } from "@/lib/prisma"

async function fetchNewAlbums() {
  try {
    console.log("Fetching new releases from Spotify...")
    const newReleases = await getNewReleases(50)

    console.log(`Found ${newReleases.length} new releases`)

    let created = 0
    let updated = 0

    for (const albumData of newReleases) {
      try {
        const album = await prisma.album.upsert({
          where: { spotifyId: albumData.spotifyId },
          update: {
            title: albumData.title,
            artist: albumData.artist,
            releaseDate: albumData.releaseDate,
            coverUrl: albumData.coverUrl,
            genres: albumData.genres,
          },
          create: {
            spotifyId: albumData.spotifyId,
            title: albumData.title,
            artist: albumData.artist,
            releaseDate: albumData.releaseDate,
            coverUrl: albumData.coverUrl,
            genres: albumData.genres,
          },
        })

        if (album.createdAt.getTime() === new Date().getTime()) {
          created++
        } else {
          updated++
        }
      } catch (error) {
        console.error(`Error processing album ${albumData.spotifyId}:`, error)
      }
    }

    console.log(`✅ Completed: ${created} created, ${updated} updated`)
  } catch (error) {
    console.error("Error fetching new albums:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fetchNewAlbums()



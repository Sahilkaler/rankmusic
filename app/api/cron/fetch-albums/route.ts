export const dynamic = "force-dynamic";
export const revalidate = 0;


import { NextResponse } from "next/server"
import { getNewReleases } from "@/lib/spotify"
import { prisma } from "@/lib/prisma"

// This endpoint can be called by a cron service
// Protect it with a secret token in production
export async function GET(request: Request) {
  try {
    // Optional: Add authentication header check
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

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

        // Check if this was a new album (created within last second)
        const isNew = album.createdAt.getTime() > Date.now() - 1000
        if (isNew) {
          created++
        } else {
          updated++
        }
      } catch (error) {
        console.error(`Error processing album ${albumData.spotifyId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      total: newReleases.length,
    })
  } catch (error) {
    console.error("Error fetching new albums:", error)
    return NextResponse.json(
      { error: "Failed to fetch new albums" },
      { status: 500 }
    )
  }
}



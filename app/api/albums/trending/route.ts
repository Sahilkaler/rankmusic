import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get albums with most ratings in the last 7 days
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

    // Sort by rating count
    const sorted = trendingAlbums
      .map((album) => ({
        ...album,
        recentRatingCount: album.ratings.length,
      }))
      .sort((a, b) => b.recentRatingCount - a.recentRatingCount)

    return NextResponse.json(sorted)
  } catch (error) {
    console.error("Error fetching trending albums:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending albums" },
      { status: 500 }
    )
  }
}



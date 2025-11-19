import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(followers.map((f) => f.follower))
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    )
  }
}



import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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

    return NextResponse.json(following.map((f) => f.following))
  } catch (error) {
    console.error("Error fetching following:", error)
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    )
  }
}



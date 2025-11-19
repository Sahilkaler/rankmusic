import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
            ratings: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    )
  }
}


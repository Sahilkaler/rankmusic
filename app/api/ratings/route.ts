import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { albumId, rating } = body

    if (!albumId || !rating) {
      return NextResponse.json(
        { error: "Album ID and rating are required" },
        { status: 400 }
      )
    }

    if (!["SKIP", "TIMEPASS", "GOOD", "PERFECTION"].includes(rating)) {
      return NextResponse.json(
        { error: "Invalid rating value" },
        { status: 400 }
      )
    }

    // Verify album exists
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    })

    if (!album) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: 404 }
      )
    }

    // Upsert rating
    const userRating = await prisma.rating.upsert({
      where: {
        userId_albumId: {
          userId: session.user.id,
          albumId,
        },
      },
      update: {
        rating: rating as "SKIP" | "TIMEPASS" | "GOOD" | "PERFECTION",
      },
      create: {
        userId: session.user.id,
        albumId,
        rating: rating as "SKIP" | "TIMEPASS" | "GOOD" | "PERFECTION",
      },
    })

    return NextResponse.json(userRating)
  } catch (error) {
    console.error("Error creating/updating rating:", error)
    return NextResponse.json(
      { error: "Failed to create/update rating" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const albumId = searchParams.get("albumId")

    if (!albumId) {
      return NextResponse.json(
        { error: "Album ID is required" },
        { status: 400 }
      )
    }

    await prisma.rating.delete({
      where: {
        userId_albumId: {
          userId: session.user.id,
          albumId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting rating:", error)
    return NextResponse.json(
      { error: "Failed to delete rating" },
      { status: 500 }
    )
  }
}



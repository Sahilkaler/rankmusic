export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { searchSpotifyAlbums } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const spotifyResults = await searchSpotifyAlbums(query, 20);

    const albums = await Promise.all(
      spotifyResults.map(async (albumData) => {
        return prisma.album.upsert({
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
        });
      })
    );

    return NextResponse.json(albums);
  } catch (error) {
    console.error("Error searching albums:", error);
    return NextResponse.json(
      { error: "Failed to search albums" },
      { status: 500 }
    );
  }
}

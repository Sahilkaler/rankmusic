"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Music } from "lucide-react"

interface AlbumCardProps {
  id: string
  title: string
  artist: string
  coverUrl?: string | null
  ratingCount?: number
}

export default function AlbumCard({
  id,
  title,
  artist,
  coverUrl,
  ratingCount,
}: AlbumCardProps) {
  const [imageError, setImageError] = useState(false)
  const showFallback = !coverUrl || imageError

  return (
    <Link href={`/album/${id}`}>
      <div className="group bg-card rounded-lg p-4 transition-all duration-200 hover:bg-card/80 cursor-pointer">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
          {showFallback ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900/50 to-gray-900">
              <Music className="w-16 h-16 text-green-500/50" />
            </div>
          ) : (
            <Image
              src={coverUrl}
              alt={`${title} by ${artist}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              onError={() => setImageError(true)}
              unoptimized
            />
          )}
        </div>
        <div>
          <h3 className="font-bold truncate mb-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>
          {ratingCount !== undefined && ratingCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {ratingCount} rating{ratingCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { Music } from "lucide-react"

interface AlbumCoverProps {
  coverUrl?: string | null
  title: string
  artist: string
}

export default function AlbumCover({ coverUrl, title, artist }: AlbumCoverProps) {
  const [imageError, setImageError] = useState(false)
  const showFallback = !coverUrl || imageError

  return (
    <div className="aspect-square relative rounded-lg overflow-hidden shadow-2xl">
      {showFallback ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-900/50 to-gray-900">
          <Music className="w-24 h-24 text-green-500/50 mb-4" />
          <p className="text-lg font-semibold text-white/70 text-center px-4">{title}</p>
          <p className="text-sm text-white/50">{artist}</p>
        </div>
      ) : (
        <Image
          src={coverUrl}
          alt={`${title} by ${artist}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => setImageError(true)}
          unoptimized
          priority
        />
      )}
    </div>
  )
}

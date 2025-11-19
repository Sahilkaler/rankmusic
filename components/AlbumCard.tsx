import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

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
  return (
    <Link href={`/album/${id}`}>
      <div className="group bg-card rounded-lg p-4 transition-all duration-200 hover:bg-card/80 cursor-pointer">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${title} by ${artist}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
              <span className="text-4xl">🎵</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold truncate mb-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>
          {ratingCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-2">
              {ratingCount} rating{ratingCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}



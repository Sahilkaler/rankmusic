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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-square relative bg-muted">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${title} by ${artist}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🎵</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>
          {ratingCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {ratingCount} rating{ratingCount !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}



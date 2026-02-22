// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyImage {
  url: string
  height?: number
  width?: number
}

interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ name: string }>
  images: SpotifyImage[]
  release_date: string
  genres?: string[]
}

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[]
  }
}

// Cache token for reuse
let cachedToken: { token: string; expiresAt: number } | null = null

// ---------------------------------------------------------
// HELPER: Get best album image
// ---------------------------------------------------------

function getBestImage(images: SpotifyImage[]): string | null {
  if (!images || images.length === 0) return null
  
  // Sort by size (largest first) and return the first one
  // Spotify usually returns images in order: 640x640, 300x300, 64x64
  const sorted = [...images].sort((a, b) => {
    const aSize = (a.height || 0) * (a.width || 0)
    const bSize = (b.height || 0) * (b.width || 0)
    return bSize - aSize
  })
  
  return sorted[0]?.url || images[0]?.url || null
}

// ---------------------------------------------------------
// GET ACCESS TOKEN (Vercel-safe, NO Buffer)
// ---------------------------------------------------------

async function getSpotifyAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  // Use btoa() (safe in Vercel Edge Runtime)
  const encodedCredentials = btoa(`${clientId}:${clientSecret}`)

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Spotify token error:", errorText)
    throw new Error("Failed to get Spotify access token")
  }

  const data: SpotifyTokenResponse = await response.json()

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

// ---------------------------------------------------------
// SEARCH ALBUMS
// ---------------------------------------------------------

export async function searchSpotifyAlbums(query: string, limit: number = 20) {
  const token = await getSpotifyAccessToken()

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const text = await response.text()
    console.error("Spotify search error:", text)
    throw new Error("Failed to search Spotify")
  }

  const data: SpotifySearchResponse = await response.json()

  return data.albums.items
    .filter((album) => album && album.id) // Filter out any null/invalid items
    .map((album) => ({
      spotifyId: album.id,
      title: album.name || "Unknown Album",
      artist: album.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
      releaseDate: album.release_date || null,
      coverUrl: getBestImage(album.images),
      genres: [],
    }))
}

// ---------------------------------------------------------
// GET FULL ALBUM DATA (includes genres)
// ---------------------------------------------------------

export async function getSpotifyAlbum(spotifyId: string) {
  const token = await getSpotifyAccessToken()

  const response = await fetch(`https://api.spotify.com/v1/albums/${spotifyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const msg = await response.text()
    console.error("Spotify album fetch error:", msg)
    throw new Error("Failed to fetch album from Spotify")
  }

  const album: SpotifyAlbum = await response.json()

  return {
    spotifyId: album.id,
    title: album.name || "Unknown Album",
    artist: album.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
    releaseDate: album.release_date || null,
    coverUrl: getBestImage(album.images),
    genres: album.genres || [],
  }
}

// ---------------------------------------------------------
// GET NEW RELEASES
// ---------------------------------------------------------

export async function getNewReleases(limit: number = 50) {
  const token = await getSpotifyAccessToken()

  const response = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const msg = await response.text()
    console.error("Spotify new releases error:", msg)
    throw new Error("Failed to fetch new releases from Spotify")
  }

  const data = await response.json()

  if (!data.albums?.items) {
    console.error("Spotify new releases: No albums in response")
    return []
  }

  return data.albums.items
    .filter((album: SpotifyAlbum) => album && album.id)
    .map((album: SpotifyAlbum) => ({
      spotifyId: album.id,
      title: album.name || "Unknown Album",
      artist: album.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
      releaseDate: album.release_date || null,
      coverUrl: getBestImage(album.images),
      genres: [],
    }))
}

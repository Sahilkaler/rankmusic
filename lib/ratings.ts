export const RATING_COLORS = {
  SKIP: "#e22134", // Red
  TIMEPASS: "#fbbf24", // Yellow/Amber
  GOOD: "#3b82f6", // Blue
  PERFECTION: "#1DB954", // Spotify Green
} as const

export type RatingLabel = keyof typeof RATING_COLORS


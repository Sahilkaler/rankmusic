export const RATING_COLORS = {
  SKIP: "#ef4444",
  TIMEPASS: "#f59e0b",
  GOOD: "#3b82f6",
  PERFECTION: "#10b981",
} as const

export type RatingLabel = keyof typeof RATING_COLORS


export const SEARCH_INTERVAL: Record<number, number> = {
  1: 2,
  2: 3,
  3: 5,
  5: 8,
  8: 14,
  14: 30,
  30: 90,
  90: 365 * 5, // For 5 years
};

// Don't show post with likesValue below that its value
export const BEST_POST_THRESHOLD = 0;

export const HOT_LIKES_THRESHOLD = 0;
export const NEGATIVE_THRESHOLD_COMMENTS = 10;
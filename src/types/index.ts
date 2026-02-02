const MatchStatus = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

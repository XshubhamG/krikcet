import { z } from "zod";

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
} as const;

// Schema to validate query parameters for listing matches
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Schema to validate match ID parameter
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Helper function to validate ISO date string
const isValidIsoDateString = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Schema to validate match creation
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    startTime: z.string().refine(isValidIsoDateString, {
      message: "startTime must be a valid ISO date string",
    }),
    endTime: z.string().refine(isValidIsoDateString, {
      message: "endTime must be a valid ISO date string",
    }),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be chronologically after startTime",
        path: ["endTime"],
      });
    }
  });

// Schema to validate score update
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});

// Export types inferred from schemas
export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
export type MatchIdParam = z.infer<typeof matchIdParamSchema>;
export type CreateMatch = z.infer<typeof createMatchSchema>;
export type UpdateScore = z.infer<typeof updateScoreSchema>;

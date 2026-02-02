import { Router } from "express";
import { Request, Response } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
  MATCH_STATUS,
} from "../validation/matches";
import { db } from "../db/db";
import { matches as matchesTable } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";
import { desc } from "drizzle-orm";

const router: Router = Router();
const MAX_LIMIT = 100;

router.get("/", async (req: Request, res: Response) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const matches = await db
      .select()
      .from(matchesTable)
      .orderBy(desc(matchesTable.createdAt))
      .limit(limit);
    res.status(200).json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const [match] = await db
      .insert(matchesTable)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime) ?? MATCH_STATUS.SCHEDULED,
      })
      .returning();

    if (res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(match);
    }

    res.status(201).json({ message: "Match created successfully", match });
  } catch (error) {
    console.error("Error creating match:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;

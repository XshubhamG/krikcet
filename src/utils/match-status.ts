import { MATCH_STATUS } from "../validation/matches";
import { Match } from "../db/schema";

export function getMatchStatus(
  startTime: string,
  endTime: string,
  now = new Date()
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(
  match: Match,
  updateStatus: (status: string) => Promise<void>
) {
  const nextStatus = getMatchStatus(
    match.startTime.toISOString(),
    match.endTime?.toISOString() || ""
  );
  if (nextStatus && match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
    return match.status;
  }
  return match.status;
}

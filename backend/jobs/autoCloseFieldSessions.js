import FieldSession from "../models/FieldSession.js";
import Tracking from "../models/Tracking.js";
import { toDateKey, formatClock } from "../utils/companyTime.js";

/**
 * Close any Open field sessions whose session.date is before today's
 * company-local date (Asia/Karachi). Runs after local midnight so staff
 * can check in again in the morning.
 */
export async function autoCloseStaleFieldSessions() {
  const today = toDateKey(new Date());
  const stale = await FieldSession.find({
    status: "Open",
    date: { $lt: today },
  });

  if (!stale.length) return { closed: 0 };

  const now = new Date();
  const checkOut = formatClock(now);
  let closed = 0;

  for (const session of stale) {
    session.status = "Closed";
    session.endedAt = now;
    session.checkOut =
      session.checkOut && session.checkOut !== "--"
        ? session.checkOut
        : "12:00 AM";
    session.closedReason = "auto_midnight";
    await session.save();

    await Tracking.findOneAndUpdate(
      { company: session.company, employee: session.employee },
      {
        online: false,
        status: "Offline",
        lastUpdated: Date.now(),
      }
    );
    closed += 1;
  }

  if (closed) {
    console.log(
      `[field] auto-closed ${closed} open session(s) before ${today} (checkout=${checkOut})`
    );
  }

  return { closed };
}

/** Poll every minute; cheap when nothing is stale. */
export function startAutoCloseFieldSessionsJob(intervalMs = 60_000) {
  const tick = () => {
    autoCloseStaleFieldSessions().catch((err) =>
      console.error("[field] auto-close job failed:", err.message)
    );
  };
  tick();
  return setInterval(tick, intervalMs);
}

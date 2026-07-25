/** Shared AudioContext — browsers allow sound only after a user gesture. */
let sharedCtx = null;

export function unlockAttendanceAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    if (!sharedCtx) sharedCtx = new AudioCtx();
    if (sharedCtx.state === "suspended") {
      sharedCtx.resume();
    }
    return true;
  } catch {
    return false;
  }
}

/** Short chime when new attendance arrives. */
export function playAttendanceChime() {
  try {
    unlockAttendanceAudio();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = sharedCtx || new AudioCtx();
    sharedCtx = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    const tone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    };

    tone(784, now, 0.14);
    tone(988, now + 0.12, 0.22);
  } catch {
    // ignore
  }
}

export const attendanceFingerprint = (records = []) =>
  records
    .map(
      (r) =>
        `${r._id}|${r.checkIn}|${r.checkOut}|${r.status}|${r.hours}|${r.updatedAt || r.createdAt || ""}`
    )
    .sort()
    .join(";");

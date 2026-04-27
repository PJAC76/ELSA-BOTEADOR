import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

type Props = {
  /** Whether the overlay should be visible (timer expired AND a task is still open). */
  visible: boolean;
  /**
   * Timestamp (ms) when the meeting was triggered server-side.
   * Used to display a live "waiting for X seconds" counter.
   * If null, no counter is shown.
   */
  triggeredAtMs: number | null;
};

/**
 * Floating overlay shown to a player whose round timer reached 0 while a
 * minigame is still open. The transition to meeting is blocked locally until
 * the task finishes; meanwhile this overlay reassures the player that the
 * group has already started gathering.
 *
 * The seconds counter uses requestAnimationFrame-style polling (250ms) so the
 * value updates in real time without coupling to React render cycles.
 */
const MeetingPendingOverlay = ({ visible, triggeredAtMs }: Props) => {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible || triggeredAtMs == null) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - triggeredAtMs) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [visible, triggeredAtMs]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-none fixed inset-x-0 top-20 z-[55] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ y: -20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl bg-card/95 px-4 py-3 shadow-soft backdrop-blur-md ring-1 ring-border"
      >
        <motion.span
          className="text-3xl"
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
          aria-hidden
        >
          🚨
        </motion.span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="font-display text-sm font-black leading-tight text-foreground">
            {t("meetingPendingTitle")}
          </p>
          <p className="font-body text-xs leading-tight text-muted-foreground">
            {t("meetingPendingSubtitle")}
          </p>
          {triggeredAtMs != null && (
            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground/80">
              +{elapsed}s · {t("meetingPendingHint")}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MeetingPendingOverlay;

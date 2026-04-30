import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Globe, Loader2, Bot, Languages } from "lucide-react";
import type { Language } from "@/types/game";
import { useTranslation } from "@/lib/i18n";

type QuickPlayScreenProps = {
  onBack: () => void;
  onMatchFound: (roomCode: string) => void;
  defaultLanguage?: Language;
};

// Matchmaking tuning (client-side simulation)
const TARGET_PLAYERS = 5;
const TOTAL_WAIT_SECONDS = 30; // hard timeout: fill with bots
const SOFT_FALLBACK_SECONDS = 18; // start announcing bot fallback
const TICK_MS = 1000;

// Per-language base population — approximate the chance to find a real player each tick
const LANG_POPULATION: Record<Language, number> = {
  es: 0.7,
  en: 0.55,
};

const QuickPlayScreen = ({ onBack, onMatchFound, defaultLanguage = "es" }: QuickPlayScreenProps) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [searching, setSearching] = useState(false);
  const [realPlayers, setRealPlayers] = useState(0);
  const [bots, setBots] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<"waiting" | "filling" | "ready">("waiting");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const { t } = useTranslation();

  const total = realPlayers + bots;
  const remaining = Math.max(0, TOTAL_WAIT_SECONDS - elapsed);

  const cleanup = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cleanup();
    setPhase("ready");
    setTimeout(() => onMatchFound("QUICK1"), 700);
  }, [cleanup, onMatchFound]);

  const fillWithBots = useCallback(() => {
    setBots((b) => Math.max(b, TARGET_PLAYERS - 1)); // at least leave 1 slot for the player
    setPhase("filling");
    setTimeout(finish, 900);
  }, [finish]);

  const startSearch = useCallback(() => {
    finishedRef.current = false;
    setSearching(true);
    setRealPlayers(0);
    setBots(0);
    setElapsed(0);
    setExpanded(false);
    setPhase("waiting");

    tickRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        // Hard timeout — fill remaining with bots
        if (next >= TOTAL_WAIT_SECONDS) {
          setRealPlayers((rp) => {
            setBots((b) => Math.max(b, TARGET_PLAYERS - 1 - rp));
            return rp;
          });
          setPhase("filling");
          setTimeout(finish, 800);
          if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
          }
          return next;
        }

        // Try to add a real player based on language population
        setExpanded((isExpanded) => {
          setLanguage((lang) => {
            const base = LANG_POPULATION[lang] ?? 0.5;
            const chance = isExpanded ? Math.min(0.95, base + 0.25) : base;
            setRealPlayers((rp) => {
              if (rp >= TARGET_PLAYERS - 1) return rp; // leave room for "you"
              const roll = Math.random();
              // Pacing: chance scales with how long we've waited
              const eagerness = Math.min(1, 0.4 + next / TOTAL_WAIT_SECONDS);
              if (roll < chance * eagerness * 0.55) return rp + 1;
              return rp;
            });
            return lang;
          });
          return isExpanded;
        });

        // Soft fallback: announce we'll fill with bots soon
        if (next === SOFT_FALLBACK_SECONDS) {
          setRealPlayers((rp) => {
            if (rp < TARGET_PLAYERS - 1) setPhase("filling");
            return rp;
          });
        }

        return next;
      });

      // Check completion (all real)
      setRealPlayers((rp) => {
        if (rp >= TARGET_PLAYERS - 1) {
          setTimeout(finish, 600);
        }
        return rp;
      });
    }, TICK_MS);
  }, [finish]);

  const handleCancel = () => {
    cleanup();
    finishedRef.current = true;
    setSearching(false);
  };

  const filledSlots = Math.min(TARGET_PLAYERS, total + 1); // +1 = you

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-accent px-6 pb-8 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-foreground/20" aria-label={t("cancel")}>
            <ArrowLeft className="h-5 w-5 text-accent-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-accent-foreground">{t("quickPlayTitle")}</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        {!searching ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mb-6 text-7xl">⚡</motion.div>
            <p className="mb-8 font-body text-sm text-muted-foreground text-center max-w-xs">{t("quickPlayDesc")}</p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 w-full max-w-sm">
              <div className="mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-display text-sm font-bold text-muted-foreground">{t("matchLanguage")}</span>
              </div>
              <div className="flex gap-3">
                {(["es", "en"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    aria-pressed={language === lang}
                    className={`flex h-14 flex-1 items-center justify-center rounded-2xl font-display text-sm font-bold transition-all ${language === lang ? "gradient-accent text-accent-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}
                  >
                    {lang === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
                  </button>
                ))}
              </div>
              <p className="mt-3 font-body text-[11px] text-muted-foreground text-center">
                {t("matchmakingFallbackHint").replace("{seconds}", String(TOTAL_WAIT_SECONDS))}
              </p>
            </motion.div>

            <Button onClick={startSearch} className="h-14 w-full max-w-sm rounded-2xl gradient-accent text-accent-foreground shadow-soft font-display text-base font-bold">
              <Zap className="mr-2 h-5 w-5" />
              {t("searchMatch")}
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center w-full max-w-sm">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-accent shadow-card">
                <Loader2 className="h-10 w-10 text-accent-foreground" />
              </div>
            </motion.div>

            <h2 className="mb-1 font-display text-xl font-bold text-foreground">{t("searchingMatch")}</h2>
            <p className="mb-1 font-body text-sm text-muted-foreground">
              {expanded ? t("matchmakingExpanded") : (language === "es" ? "🇪🇸 Español" : "🇬🇧 English")}
            </p>

            {/* Countdown */}
            <div
              role="timer"
              aria-live="polite"
              className="mb-4 rounded-full bg-muted px-4 py-1.5 font-display text-xs font-bold text-muted-foreground"
            >
              {t("matchmakingTimeLeft").replace("{seconds}", String(remaining))}
            </div>

            {/* Slot grid */}
            <div className="flex gap-2" aria-label={t("playersFound")}>
              {Array.from({ length: TARGET_PLAYERS }).map((_, i) => {
                const isYou = i === 0;
                const isReal = !isYou && i <= realPlayers;
                const isBot = !isYou && !isReal && i <= realPlayers + bots;
                const filled = isYou || isReal || isBot;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: filled ? 1 : 0.5, opacity: filled ? 1 : 0.3 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${filled ? (isBot ? "bg-secondary shadow-soft" : "gradient-primary shadow-soft") : "bg-muted"}`}
                    aria-label={isYou ? "Tú" : isBot ? "Bot" : isReal ? "Jugadora" : "Vacío"}
                  >
                    {isYou ? <span className="text-lg">⭐</span> : isBot ? <Bot className="h-5 w-5 text-secondary-foreground" /> : <span className="text-lg">{isReal ? "🕵️" : "?"}</span>}
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-3 font-body text-xs text-muted-foreground">
              {filledSlots}/{TARGET_PLAYERS} {t("playersFound")}
            </p>

            {/* Status message */}
            <p className="mt-4 min-h-[2.5em] text-center font-body text-xs text-muted-foreground max-w-xs">
              {phase === "filling"
                ? t("matchmakingFillingBots")
                : elapsed >= SOFT_FALLBACK_SECONDS
                  ? t("matchmakingFewPlayers").replace("{lang}", language === "es" ? "Español" : "English")
                  : t("matchmakingWaiting")}
            </p>

            {/* Actions */}
            <div className="mt-5 flex w-full flex-col gap-2">
              {!expanded && (
                <Button
                  variant="outline"
                  onClick={() => setExpanded(true)}
                  className="h-11 w-full rounded-2xl font-display text-sm font-bold"
                >
                  <Languages className="mr-2 h-4 w-4" />
                  {t("matchmakingExpand")}
                </Button>
              )}
              <Button
                onClick={fillWithBots}
                disabled={phase === "ready"}
                className="h-11 w-full rounded-2xl gradient-primary font-display text-sm font-bold text-primary-foreground shadow-soft"
              >
                <Bot className="mr-2 h-4 w-4" />
                {t("matchmakingStartWithBots")}
              </Button>
              <Button onClick={handleCancel} variant="ghost" className="font-display font-bold text-muted-foreground">{t("cancel")}</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuickPlayScreen;

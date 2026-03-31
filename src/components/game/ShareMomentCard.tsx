import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Share2, Download, Instagram, X, Trophy, Skull, Key, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlayerRole } from "@/types/game";
import { playTap } from "@/lib/sounds";
import { useTranslation } from "@/lib/i18n";

type MomentType = "victory" | "defeat" | "word-guess" | "dramatic-vote" | "saboteur-reveal";

type ShareMomentCardProps = {
  type: MomentType;
  result?: "agents-win" | "saboteur-wins";
  myRole?: PlayerRole;
  playerName?: string;
  secretWord?: string;
  eliminatedPlayer?: string;
  gameStats?: { tasksCompleted: number; zonesVisited: number; cluesGiven: number };
  wordGuessers?: { playerName: string; playerEmoji: string }[];
  onClose: () => void;
};

const TEMPLATES: Record<MomentType, { emoji: string; gradient: string; pattern: string }> = {
  victory: { emoji: "🏆", gradient: "from-[hsl(45,85%,70%)] via-[hsl(330,70%,60%)] to-[hsl(270,50%,75%)]", pattern: "✨🎉⭐💫🌟" },
  defeat: { emoji: "💀", gradient: "from-[hsl(270,50%,45%)] via-[hsl(280,40%,35%)] to-[hsl(330,30%,30%)]", pattern: "👻🌙💜🔮🌑" },
  "word-guess": { emoji: "🧠", gradient: "from-[hsl(160,45%,65%)] via-[hsl(200,70%,65%)] to-[hsl(270,50%,75%)]", pattern: "💡🔑✨📖🎯" },
  "dramatic-vote": { emoji: "🗳️", gradient: "from-[hsl(0,70%,60%)] via-[hsl(330,70%,60%)] to-[hsl(45,85%,70%)]", pattern: "🔥👀⚡💣🎭" },
  "saboteur-reveal": { emoji: "💣", gradient: "from-[hsl(0,70%,55%)] via-[hsl(15,80%,60%)] to-[hsl(45,85%,70%)]", pattern: "🕵️💣🔍😱🎭" },
};

const ShareMomentCard = ({
  type, result, myRole, playerName, secretWord,
  eliminatedPlayer, gameStats, wordGuessers = [], onClose,
}: ShareMomentCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const { t } = useTranslation();

  const template = TEMPLATES[type];
  const iWon = (result === "agents-win" && myRole === "agent") || (result === "saboteur-wins" && myRole === "saboteur");

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        cacheBust: true,
      });
      return dataUrl;
    } catch {
      return null;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    playTap();
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `elsa-boteador-${type}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setExported(true);
  }, [generateImage, type]);

  const handleShare = useCallback(async () => {
    playTap();
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `elsa-boteador-${type}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "ELSA-BOTEADOR",
          text: t("shareMomentText" as any),
          files: [file],
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  }, [generateImage, type, t, handleDownload]);

  const getTitleText = () => {
    switch (type) {
      case "victory": return iWon ? t("shareTitleVictory") : t("shareTitleDefeat");
      case "defeat": return t("shareTitleDefeat");
      case "word-guess": return t("shareTitleWordGuess");
      case "dramatic-vote": return t("shareTitleVote");
      case "saboteur-reveal": return t("shareTitleReveal");
    }
  };

  const getSubText = () => {
    switch (type) {
      case "victory":
      case "defeat":
        return myRole === "saboteur" ? t("shareSubSaboteur") : t("shareSubAgent");
      case "word-guess":
        return secretWord ? `"${secretWord}"` : "";
      case "dramatic-vote":
        return eliminatedPlayer ? `${eliminatedPlayer} ${t("shareSubVoted")}` : "";
      case "saboteur-reveal":
        return eliminatedPlayer || "";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* The shareable card - 9:16 aspect ratio for Stories */}
          <div
            ref={cardRef}
            className={`relative w-[280px] h-[498px] rounded-3xl overflow-hidden bg-gradient-to-br ${template.gradient} shadow-2xl`}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {/* Decorative pattern background */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-2xl select-none"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 23) % 100}%`,
                    transform: `rotate(${i * 42}deg)`,
                  }}
                >
                  {template.pattern[i % template.pattern.length]}
                </span>
              ))}
            </div>

            {/* Top branding */}
            <div className="relative z-10 flex items-center justify-center pt-6 pb-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5">
                <span className="text-sm">🎮</span>
                <span className="text-white font-extrabold text-xs tracking-wider uppercase">ELSA-BOTEADOR</span>
              </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-6">
              {/* Big emoji */}
              <motion.span
                className="text-8xl mb-4 drop-shadow-lg"
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {template.emoji}
              </motion.span>

              {/* Title */}
              <h2 className="text-white font-black text-2xl text-center leading-tight drop-shadow-md mb-2">
                {getTitleText()}
              </h2>

              {/* Subtitle */}
              <p className="text-white/80 font-bold text-sm text-center mb-4">
                {getSubText()}
              </p>

              {/* Stats card */}
              {gameStats && (type === "victory" || type === "defeat") && (
                <div className="w-full rounded-2xl bg-white/15 backdrop-blur-sm p-4 mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { value: gameStats.tasksCompleted, label: "✅" },
                      { value: gameStats.zonesVisited, label: "📍" },
                      { value: gameStats.cluesGiven, label: "💬" },
                    ].map((s, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-lg">{s.label}</span>
                        <span className="text-white font-black text-2xl">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Word guessers */}
              {wordGuessers.length > 0 && type === "word-guess" && (
                <div className="w-full rounded-2xl bg-white/15 backdrop-blur-sm p-3 mb-4">
                  <div className="flex flex-wrap justify-center gap-2">
                    {wordGuessers.map((g, i) => (
                      <div key={i} className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1">
                        <span className="text-sm">{g.playerEmoji}</span>
                        <span className="text-white font-bold text-xs">{g.playerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role badge */}
              {myRole && (
                <div className={`rounded-full px-5 py-2 mb-3 ${
                  myRole === "saboteur" ? "bg-red-500/30" : "bg-white/20"
                } backdrop-blur-sm`}>
                  <span className="text-white font-extrabold text-sm">
                    {myRole === "saboteur" ? "💣 SABOTEADORA" : "🕵️ AGENTE"}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="relative z-10 flex flex-col items-center pb-6 px-6">
              <div className="w-full rounded-xl bg-white/20 backdrop-blur-sm p-3 text-center">
                <p className="text-white/90 font-bold text-xs">{t("shareJoinUs")}</p>
                <p className="text-white font-black text-sm mt-0.5">elsa-boteador.app</p>
              </div>
            </div>

            {/* Decorative corner sparkles */}
            <div className="absolute top-4 right-4 text-2xl opacity-40">✨</div>
            <div className="absolute bottom-16 left-4 text-2xl opacity-40">💫</div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full max-w-[280px]">
            <Button
              onClick={handleShare}
              disabled={isExporting}
              className="flex-1 h-12 rounded-2xl gradient-primary text-primary-foreground font-display text-sm font-bold shadow-soft gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isExporting ? t("shareExporting") : t("shareButton")}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isExporting}
              variant="outline"
              className="h-12 w-12 rounded-2xl"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {exported && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xs font-bold text-primary-foreground/80"
            >
              {t("shareExported")} ✨
            </motion.p>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-1 font-display text-xs font-bold text-white/60 hover:text-white/90 transition-colors"
          >
            {t("close")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareMomentCard;

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Globe, Loader2 } from "lucide-react";
import type { Language } from "@/types/game";
import { useTranslation } from "@/lib/i18n";

type QuickPlayScreenProps = {
  onBack: () => void;
  onMatchFound: (roomCode: string) => void;
  defaultLanguage?: Language;
};

const QuickPlayScreen = ({ onBack, onMatchFound, defaultLanguage = "es" }: QuickPlayScreenProps) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [searching, setSearching] = useState(false);
  const [playersFound, setPlayersFound] = useState(0);
  const { t } = useTranslation();

  const handleSearch = () => {
    setSearching(true);
    setPlayersFound(0);
    const interval = setInterval(() => {
      setPlayersFound((p) => {
        if (p >= 4) { clearInterval(interval); setTimeout(() => onMatchFound("QUICK1"), 800); return 5; }
        return p + 1;
      });
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-accent px-6 pb-8 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-foreground/20">
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
                  <button key={lang} onClick={() => setLanguage(lang)} className={`flex h-14 flex-1 items-center justify-center rounded-2xl font-display text-sm font-bold transition-all ${language === lang ? "gradient-accent text-accent-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
                    {lang === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
                  </button>
                ))}
              </div>
            </motion.div>

            <Button onClick={handleSearch} className="h-14 w-full max-w-sm rounded-2xl gradient-accent text-accent-foreground shadow-soft font-display text-base font-bold">
              <Zap className="mr-2 h-5 w-5" />
              {t("searchMatch")}
            </Button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-accent shadow-card">
                <Loader2 className="h-10 w-10 text-accent-foreground" />
              </div>
            </motion.div>

            <h2 className="mb-2 font-display text-xl font-bold text-foreground">{t("searchingMatch")}</h2>
            <p className="mb-6 font-body text-sm text-muted-foreground">{language === "es" ? "🇪🇸 Español" : "🇬🇧 English"}</p>

            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: i < playersFound ? 1 : 0.5, opacity: i < playersFound ? 1 : 0.3 }} className={`flex h-12 w-12 items-center justify-center rounded-xl ${i < playersFound ? "gradient-primary shadow-soft" : "bg-muted"}`}>
                  <span className="text-lg">{i < playersFound ? "🕵️" : "?"}</span>
                </motion.div>
              ))}
            </div>
            <p className="mt-3 font-body text-xs text-muted-foreground">{playersFound}/5 {t("playersFound")}</p>

            <Button onClick={onBack} variant="ghost" className="mt-8 font-display font-bold text-muted-foreground">{t("cancel")}</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuickPlayScreen;

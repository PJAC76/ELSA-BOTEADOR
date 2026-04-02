import { motion } from "framer-motion";
import { Check, Lock, Sparkles } from "lucide-react";
import { useThemeStore, THEMES, type ThemeId } from "@/stores/theme-store";
import { useProgressionStore } from "@/stores/progression-store";
import { useTranslation } from "@/lib/i18n";
import { playTap, playPurchase, playEquip } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";

const ThemeSelector = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { activeTheme, setActiveTheme, isUnlocked, unlockTheme } = useThemeStore();
  const { totalXp, addXp } = useProgressionStore();

  const handleSelect = (id: ThemeId, price: number) => {
    if (isUnlocked(id)) {
      setActiveTheme(id);
      playEquip();
      return;
    }
    if (totalXp < price) {
      toast({
        title: t("shopNotEnoughXp" as any),
        description: t("shopNeedMore" as any, { xp: String(price - totalXp) }),
        variant: "destructive",
      });
      return;
    }
    playPurchase();
    addXp(-price);
    unlockTheme(id);
    setActiveTheme(id);
    const theme = THEMES.find((th) => th.id === id)!;
    toast({
      title: `${theme.emoji} ${t("shopPurchased" as any)}`,
      description: t(theme.nameKey as any),
      variant: "achievement" as any,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((theme, idx) => {
        const unlocked = isUnlocked(theme.id);
        const active = activeTheme === theme.id;
        const canAfford = totalXp >= theme.price;

        return (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => { playTap(); handleSelect(theme.id, theme.price); }}
            className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
              active
                ? "ring-2 ring-primary shadow-glow bg-primary/10"
                : unlocked
                ? "bg-card shadow-soft hover:shadow-card"
                : canAfford
                ? "bg-card shadow-soft hover:shadow-card"
                : "bg-muted/60 opacity-60"
            }`}
          >
            {/* Gradient preview swatch */}
            <div className={`h-12 w-full rounded-xl bg-gradient-to-r ${theme.preview}`} />

            <span className="text-2xl">{theme.emoji}</span>
            <span className="font-display text-xs font-bold text-foreground">
              {t(theme.nameKey as any)}
            </span>
            <p className="font-body text-[10px] text-muted-foreground leading-tight text-center">
              {t(theme.descKey as any)}
            </p>

            {/* Status badge */}
            {active ? (
              <div className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1">
                <Check className="h-3 w-3 text-primary-foreground" />
                <span className="font-display text-[10px] font-bold text-primary-foreground">
                  {t("shopEquipped" as any)}
                </span>
              </div>
            ) : unlocked ? (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <span className="font-display text-[10px] font-bold text-muted-foreground">
                  {t("shopEquip" as any)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                {canAfford ? (
                  <Sparkles className="h-3 w-3 text-primary" />
                ) : (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="font-display text-[10px] font-bold text-muted-foreground">
                  {theme.price} XP
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bomb, Timer } from "lucide-react";
import type { Zone } from "@/types/game";
import { ZONE_INFO } from "@/types/game";
import { playSabotage } from "@/lib/sounds";
import { useTranslation, useZoneNames } from "@/lib/i18n";

const COOLDOWN = 30;
const ZONES: Zone[] = ["library", "cafeteria", "auditorium", "lab", "gym", "garden"];

type SabotagePanelProps = { onSabotage: (zone: Zone) => void; sabotagedZones: Zone[] };

const SabotagePanel = ({ onSabotage, sabotagedZones }: SabotagePanelProps) => {
  const [cooldown, setCooldown] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const zoneNames = useZoneNames();

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => { setCooldown((c) => Math.max(0, c - 1)); }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSabotage = (zone: Zone) => {
    if (cooldown > 0 || sabotagedZones.includes(zone)) return;
    onSabotage(zone); playSabotage(); setCooldown(COOLDOWN); setExpanded(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-4 left-4 right-4 z-40 safe-bottom">
      {expanded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 rounded-3xl bg-card p-4 shadow-card">
          <p className="font-display text-xs font-bold text-foreground mb-3">{t("chooseSabotageZone")}</p>
          <div className="grid grid-cols-3 gap-2">
            {ZONES.map((zone) => {
              const info = ZONE_INFO[zone];
              const isSabotaged = sabotagedZones.includes(zone);
              return (
                <button key={zone} onClick={() => handleSabotage(zone)} disabled={isSabotaged} className={`flex flex-col items-center rounded-2xl p-3 transition-all ${isSabotaged ? "bg-muted/50 opacity-40" : "bg-destructive/10 hover:bg-destructive/20 active:scale-95"}`}>
                  <span className="text-lg">{info.emoji}</span>
                  <span className="font-display text-[10px] font-bold text-foreground">{zoneNames[zone]}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
      <button onClick={() => cooldown === 0 && setExpanded(!expanded)} className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-sm font-bold shadow-card transition-all ${cooldown > 0 ? "bg-muted text-muted-foreground" : "bg-destructive text-destructive-foreground active:scale-95"}`}>
        {cooldown > 0 ? <><Timer className="h-4 w-4" />{t("cooldownLabel")}: {cooldown}s</> : <><Bomb className="h-4 w-4" />{expanded ? t("cancel") : t("sabotageZone")}</>}
      </button>
    </motion.div>
  );
};

export default SabotagePanel;

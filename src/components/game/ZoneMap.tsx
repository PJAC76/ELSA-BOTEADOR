import { motion, AnimatePresence } from "framer-motion";
import type { Zone } from "@/types/game";
import { ZONE_INFO } from "@/types/game";
import { Lock } from "lucide-react";
import { useTranslation, useZoneNames } from "@/lib/i18n";

export type ZonePlayer = {
  id: string;
  name: string;
  emoji?: string;
  zone: Zone;
  isMe?: boolean;
  isAlive?: boolean;
};

type ZoneMapProps = {
  onSelectZone: (zone: Zone) => void;
  sabotagedZones: Zone[];
  completedZones: Zone[];
  currentZone?: Zone;
  /** Authoritative players-by-zone (from match_players via Realtime). */
  players?: ZonePlayer[];
};

const ZONES: Zone[] = ["library", "cafeteria", "auditorium", "lab", "gym", "garden"];

const ZONE_COLORS: Record<Zone, string> = {
  library: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30",
  cafeteria: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30",
  auditorium: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30",
  lab: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30",
  gym: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30",
  garden: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30",
};

const ZoneMap = ({ onSelectZone, sabotagedZones, completedZones, currentZone, players = [] }: ZoneMapProps) => {
  const { t } = useTranslation();
  const zoneNames = useZoneNames();

  const playersByZone = ZONES.reduce<Record<Zone, ZonePlayer[]>>((acc, z) => {
    acc[z] = players.filter((p) => p.zone === z && p.isAlive !== false);
    return acc;
  }, { library: [], cafeteria: [], auditorium: [], lab: [], gym: [], garden: [] });

  return (
    <div className="flex-1 px-4 pb-4">
      <h2 className="font-display text-sm font-bold text-foreground mb-3 text-center">{t("mainBuilding")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {ZONES.map((zone, i) => {
          const info = ZONE_INFO[zone];
          const isSabotaged = sabotagedZones.includes(zone);
          const isCompleted = completedZones.includes(zone);
          const isCurrent = currentZone === zone;
          const here = playersByZone[zone];

          return (
            <motion.button
              key={zone}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelectZone(zone)}
              className={`relative flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br p-5 shadow-soft transition-all active:scale-95 ${ZONE_COLORS[zone]} ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""} ${isSabotaged ? "opacity-60" : ""}`}
            >
              {isSabotaged && <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20"><Lock className="h-3 w-3 text-destructive" /></div>}
              {isCompleted && <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent/30"><span className="text-xs">✅</span></div>}
              <span className="text-3xl mb-1">{info.emoji}</span>
              <span className="font-display text-xs font-bold text-foreground">{zoneNames[zone]}</span>
              {isSabotaged && <span className="font-body text-[10px] text-destructive font-semibold mt-0.5">{t("sabotaged")}</span>}

              {/* Authoritative player presence per zone */}
              {here.length > 0 && (
                <div className="mt-2 flex min-h-[20px] flex-wrap items-center justify-center gap-1">
                  <AnimatePresence mode="popLayout">
                    {here.slice(0, 5).map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        title={p.name}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] shadow-sm ${p.isMe ? "bg-primary text-primary-foreground ring-2 ring-primary-foreground/40" : "bg-card text-foreground"}`}
                      >
                        <span>{p.emoji ?? "🕵️"}</span>
                      </motion.div>
                    ))}
                    {here.length > 5 && (
                      <motion.div
                        key="more"
                        layout
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-muted px-1 font-body text-[10px] font-bold text-foreground"
                      >
                        +{here.length - 5}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ZoneMap;

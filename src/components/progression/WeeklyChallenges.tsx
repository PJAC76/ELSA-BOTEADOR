import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Check } from "lucide-react";
import { useChallengesStore, WEEKLY_CHALLENGES, getChallengeProgress } from "@/stores/challenges-store";
import { useProgressionStore } from "@/stores/progression-store";
import { playTap } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

type WeeklyChallengesProps = { compact?: boolean };

const WeeklyChallenges = ({ compact = false }: WeeklyChallengesProps) => {
  const store = useChallengesStore();
  const addXp = useProgressionStore((s) => s.addXp);
  const { toast } = useToast();
  const { t } = useTranslation();

  useChallengesStore.getState().resetIfNewWeek();

  const handleClaim = (challenge: typeof WEEKLY_CHALLENGES[number]) => {
    playTap(); store.claimReward(challenge.id); addXp(challenge.xpReward);
    const title = t(`challenge-${challenge.id}` as any) || challenge.title;
    toast({ title: `${challenge.emoji} ${t("challengeCompleted")}`, description: `+${challenge.xpReward} XP — "${title}"` });
  };

  const challenges = compact ? WEEKLY_CHALLENGES.slice(0, 2) : WEEKLY_CHALLENGES;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-campus-yellow" />
        <h3 className="font-display text-sm font-black text-foreground">{t("weeklyChallenges")}</h3>
      </div>
      {challenges.map((challenge, idx) => {
        const progress = getChallengeProgress(challenge, store);
        const isComplete = progress >= challenge.target;
        const isClaimed = store.claimedChallenges.includes(challenge.id);
        const pct = Math.min((progress / challenge.target) * 100, 100);
        const title = t(`challenge-${challenge.id}` as any) || challenge.title;
        const desc = t(`challenge-${challenge.id}-desc` as any) || challenge.description;

        return (
          <motion.div key={challenge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className={`rounded-2xl p-4 shadow-soft ${isClaimed ? "bg-accent/10 opacity-60" : isComplete ? "bg-campus-yellow/10 ring-1 ring-campus-yellow/30" : "bg-card"}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{challenge.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-foreground">{title}</p>
                <p className="font-body text-xs text-muted-foreground">{desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><motion.div className={`h-full rounded-full ${isComplete ? "bg-campus-yellow" : "bg-primary/60"}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }} /></div>
                  <span className="font-display text-[10px] font-bold text-muted-foreground shrink-0">{progress}/{challenge.target}</span>
                </div>
              </div>
              <div className="shrink-0">
                {isClaimed ? <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20"><Check className="h-4 w-4 text-accent-foreground" /></div>
                : isComplete ? <button onClick={() => handleClaim(challenge)} className="flex h-8 items-center gap-1 rounded-full gradient-warm px-3 text-primary-foreground font-display text-[10px] font-bold animate-pulse"><Gift className="h-3 w-3" />+{challenge.xpReward}</button>
                : <span className="flex h-8 items-center rounded-full bg-muted px-3 font-display text-[10px] font-bold text-muted-foreground">+{challenge.xpReward} XP</span>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WeeklyChallenges;

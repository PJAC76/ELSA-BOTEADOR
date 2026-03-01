import { motion } from "framer-motion";
import { ArrowLeft, Users, Zap, Target, MessageCircle, Vote, Trophy, Ghost, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type HowToPlayScreenProps = { onBack: () => void };

const HowToPlayScreen = ({ onBack }: HowToPlayScreenProps) => {
  const { t } = useTranslation();

  const SECTIONS = [
    { icon: Target, emoji: "🎯", title: t("htpObjectiveTitle"), content: t("htpObjectiveContent") },
    { icon: Users, emoji: "🕵️", title: t("htpRolesTitle"), content: t("htpRolesContent") },
    { icon: Zap, emoji: "⚡", title: t("htpRoundsTitle"), content: t("htpRoundsContent") },
    { icon: ShieldAlert, emoji: "💣", title: t("htpSabotageTitle"), content: t("htpSabotageContent") },
    { icon: MessageCircle, emoji: "💬", title: t("htpMeetingsTitle"), content: t("htpMeetingsContent") },
    { icon: Vote, emoji: "🗳️", title: t("htpVotingTitle"), content: t("htpVotingContent") },
    { icon: Ghost, emoji: "👻", title: t("htpGhostTitle"), content: t("htpGhostContent") },
    { icon: Trophy, emoji: "🏆", title: t("htpVictoryTitle"), content: t("htpVictoryContent") },
  ];

  const MODE_INFO = [
    { emoji: "👯", title: t("htpPlayFriendsTitle"), desc: t("htpPlayFriendsDesc") },
    { emoji: "⚡", title: t("htpQuickPlayTitle"), desc: t("htpQuickPlayDesc") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-primary px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20"><ArrowLeft className="h-5 w-5 text-primary-foreground" /></button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">{t("howToPlayTitle")}</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 safe-bottom">
        <div className="rounded-2xl bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-display text-base font-bold text-foreground">{t("gameModes")}</h2>
          <div className="space-y-3">
            {MODE_INFO.map((mode) => (
              <div key={mode.title} className="flex gap-3"><span className="text-2xl">{mode.emoji}</span><div className="flex-1"><h3 className="font-display text-sm font-bold text-foreground">{mode.title}</h3><p className="font-body text-xs text-muted-foreground leading-relaxed">{mode.desc}</p></div></div>
            ))}
          </div>
        </div>
        {SECTIONS.map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-card p-4 shadow-soft">
            <div className="mb-2 flex items-center gap-2"><span className="text-xl">{section.emoji}</span><h2 className="font-display text-sm font-bold text-foreground">{section.title}</h2></div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
        <div className="rounded-2xl bg-muted p-4"><p className="font-body text-xs text-muted-foreground text-center leading-relaxed">{t("htpTip")}</p></div>
      </div>
    </div>
  );
};

export default HowToPlayScreen;

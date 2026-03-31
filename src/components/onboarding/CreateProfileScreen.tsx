import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AvatarConfig, Language } from "@/types/game";
import { useTranslation } from "@/lib/i18n";

type CreateProfileScreenProps = {
  onComplete: (data: {
    displayName: string;
    avatarConfig: AvatarConfig;
    language: Language;
  }) => void;
};

const SKIN_TONES = ["🏻", "🏼", "🏽", "🏾", "🏿"];
const HAIR_STYLES = ["💇‍♀️", "👩‍🦱", "👩‍🦰", "👩‍🦳", "👩"];
const HAIR_COLORS = ["🖤", "🤎", "🧡", "💛", "🩷"];
const OUTFITS = ["👕", "👗", "🧥", "👚", "🎽"];
const ACCESSORIES = ["🎀", "🕶️", "🎒", "💍", "🧢"];

const CreateProfileScreen = ({ onComplete }: CreateProfileScreenProps) => {
  const [displayName, setDisplayName] = useState("");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    skinTone: 0, hairStyle: 0, hairColor: 0, outfit: 0, accessory: 0, makeup: 0, piercing: 0, nails: 0, eyeStyle: 0, shoes: 0,
  });
  const [language, setLanguage] = useState<Language>("es");
  const { t } = useTranslation();

  const AVATAR_SECTIONS = [
    { label: t("skinLabel"), key: "skinTone" as const, items: SKIN_TONES },
    { label: t("hairLabel"), key: "hairStyle" as const, items: HAIR_STYLES },
    { label: t("hairColorLabel"), key: "hairColor" as const, items: HAIR_COLORS },
    { label: t("clothesLabel"), key: "outfit" as const, items: OUTFITS },
    { label: t("accessoryLabel"), key: "accessory" as const, items: ACCESSORIES },
  ];

  const handleSubmit = () => {
    if (!displayName.trim()) return;
    onComplete({ displayName: displayName.trim(), avatarConfig, language });
  };

  const updateAvatar = (key: keyof AvatarConfig, value: number) => {
    setAvatarConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 py-8 overflow-y-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-1 font-display text-2xl font-bold text-foreground"
      >
        {t("createProfile")}
      </motion.h2>
      <p className="mb-6 font-body text-sm text-muted-foreground">
        {t("createProfileDesc")}
      </p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="mb-6 flex h-28 w-28 items-center justify-center rounded-full gradient-fun shadow-card"
      >
        <span className="text-5xl">{HAIR_STYLES[avatarConfig.hairStyle]}</span>
      </motion.div>

      <div className="mb-6 w-full max-w-sm">
        <label className="mb-2 block font-display text-sm font-bold text-foreground">
          {t("name")}
        </label>
        <Input
          placeholder={t("namePlaceholder")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={16}
          className="h-14 rounded-2xl font-body text-base text-center"
        />
        <p className="mt-1 text-center font-body text-xs text-muted-foreground">
          {displayName.length}/16 {t("characters")}
        </p>
      </div>

      <div className="mb-6 w-full max-w-sm space-y-4">
        {AVATAR_SECTIONS.map((section) => (
          <div key={section.key}>
            <label className="mb-2 block font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {section.label}
            </label>
            <div className="flex gap-2">
              {section.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => updateAvatar(section.key, idx)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-all ${
                    avatarConfig[section.key] === idx
                      ? "gradient-primary shadow-soft scale-110 ring-2 ring-primary/30"
                      : "bg-muted hover:bg-secondary"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 w-full max-w-sm">
        <label className="mb-2 block font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("language")}
        </label>
        <div className="flex gap-3">
          {(["es", "en"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`flex h-12 flex-1 items-center justify-center rounded-xl font-display text-sm font-bold transition-all ${
                language === lang
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {lang === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!displayName.trim()}
        size="lg"
        className="h-14 w-full max-w-sm rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold disabled:opacity-40 safe-bottom"
      >
        {t("letsGo")}
      </Button>
    </div>
  );
};

export default CreateProfileScreen;

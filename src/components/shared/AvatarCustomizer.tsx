import { motion } from "framer-motion";
import type { AvatarConfig } from "@/types/game";

export const SKIN_TONES = ["🏻", "🏼", "🏽", "🏾", "🏿"];
export const HAIR_STYLES = ["💇‍♀️", "👩‍🦱", "👩‍🦰", "👩‍🦳", "👩"];
export const HAIR_COLORS = ["🖤", "🤎", "🧡", "💛", "🩷"];
export const OUTFITS = ["👕", "👗", "🧥", "👚", "🎽"];
export const ACCESSORIES = ["🎀", "🕶️", "🎒", "💍", "🧢"];

const AVATAR_SECTIONS = [
  { label: "Piel", key: "skinTone" as const, items: SKIN_TONES },
  { label: "Pelo", key: "hairStyle" as const, items: HAIR_STYLES },
  { label: "Color de pelo", key: "hairColor" as const, items: HAIR_COLORS },
  { label: "Ropa", key: "outfit" as const, items: OUTFITS },
  { label: "Accesorio", key: "accessory" as const, items: ACCESSORIES },
];

type AvatarCustomizerProps = {
  avatarConfig: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  showPreview?: boolean;
};

export const getAvatarEmoji = (config: AvatarConfig) => HAIR_STYLES[config.hairStyle];

const AvatarCustomizer = ({ avatarConfig, onChange, showPreview = true }: AvatarCustomizerProps) => {
  const updateAvatar = (key: keyof AvatarConfig, value: number) => {
    onChange({ ...avatarConfig, [key]: value });
  };

  return (
    <div className="w-full space-y-4">
      {showPreview && (
        <motion.div
          layout
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full gradient-fun shadow-card"
        >
          <span className="text-5xl">{getAvatarEmoji(avatarConfig)}</span>
        </motion.div>
      )}

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
  );
};

export default AvatarCustomizer;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AvatarConfig } from "@/types/game";
import { useTranslation } from "@/lib/i18n";

// Expanded options for each category
export const SKIN_TONES = ["🏻", "🏼", "🏽", "🏾", "🏿", "🫶"];
export const HAIR_STYLES = [
  "💇‍♀️", "👩‍🦱", "👩‍🦰", "👩‍🦳", "👩", "👧", "👩‍🦲", "🧑‍🎤", "👱‍♀️", "🧝‍♀️",
];
export const HAIR_STYLE_LABELS_ES = [
  "Liso", "Rizado", "Pelirrojo", "Platino", "Clásico", "Coletas", "Rapado", "Wolf Cut", "Rubio L.", "Cortina",
];
export const HAIR_STYLE_LABELS_EN = [
  "Straight", "Curly", "Redhead", "Platinum", "Classic", "Pigtails", "Buzzcut", "Wolf Cut", "Long Blonde", "Curtain",
];
export const HAIR_COLORS = ["🖤", "🤎", "🧡", "💛", "🩷", "💜", "💙", "🩶", "❤️", "💚"];
export const HAIR_COLOR_LABELS_ES = [
  "Negro", "Castaño", "Cobrizo", "Rubio", "Rosa", "Morado", "Azul", "Platino", "Rojo", "Verde",
];
export const OUTFITS = [
  "👕", "👗", "🧥", "👚", "🎽", "🥼", "👘", "🦺", "🩱", "🧶",
];
export const OUTFIT_LABELS_ES = [
  "Camiseta", "Vestido", "Abrigo", "Blusa", "Deportiva", "Bata", "Kimono", "Chaleco", "Bañador", "Jersey",
];
export const ACCESSORIES = [
  "🎀", "🕶️", "🎒", "💍", "🧢", "👑", "🎧", "📿", "🪮", "🌸",
];
export const ACC_LABELS_ES = [
  "Lazo", "Gafas", "Mochila", "Anillo", "Gorra", "Corona", "Cascos", "Collar", "Peineta", "Flor",
];
export const MAKEUP_STYLES = ["✨", "💄", "👁️", "🌟", "💅", "🦋", "🎭", "💫"];
export const MAKEUP_LABELS_ES = [
  "Natural", "Labios", "Smoky", "Glitter", "Glam", "Mariposa", "Artístico", "Brillos",
];
export const PIERCING_STYLES = ["—", "💎", "⭐", "🌙", "❤️", "🔗"];
export const PIERCING_LABELS_ES = [
  "Ninguno", "Diamante", "Estrella", "Luna", "Corazón", "Aro",
];
export const NAIL_STYLES = ["💅🏻", "💅🏼", "💅🏽", "💅🏾", "💅🏿", "🩷", "❤️", "💜"];
export const NAIL_LABELS_ES = [
  "Natural", "Nude", "Café", "Oscuro", "Elegante", "Rosa", "Rojo", "Morado",
];
export const EYE_STYLES = ["👀", "😊", "😎", "🥺", "😏", "🤩"];
export const EYE_LABELS_ES = [
  "Normal", "Dulce", "Cool", "Tierno", "Pícaro", "Brillante",
];
export const SHOE_STYLES = ["👟", "👠", "👢", "🩴", "👞", "🥿"];
export const SHOE_LABELS_ES = [
  "Sneakers", "Tacones", "Botas", "Chanclas", "Mocasines", "Bailarinas",
];

type AvatarSection = {
  labelKey: string;
  key: keyof AvatarConfig;
  items: string[];
  labels_es: string[];
};

const AVATAR_SECTIONS: AvatarSection[] = [
  { labelKey: "skinLabel", key: "skinTone", items: SKIN_TONES, labels_es: ["Claro", "Medio", "Moreno", "Oscuro", "Profundo", "Neutro"] },
  { labelKey: "hairLabel", key: "hairStyle", items: HAIR_STYLES, labels_es: HAIR_STYLE_LABELS_ES },
  { labelKey: "hairColorLabel", key: "hairColor", items: HAIR_COLORS, labels_es: HAIR_COLOR_LABELS_ES },
  { labelKey: "makeupLabel", key: "makeup", items: MAKEUP_STYLES, labels_es: MAKEUP_LABELS_ES },
  { labelKey: "eyeLabel", key: "eyeStyle", items: EYE_STYLES, labels_es: EYE_LABELS_ES },
  { labelKey: "piercingLabel", key: "piercing", items: PIERCING_STYLES, labels_es: PIERCING_LABELS_ES },
  { labelKey: "clothesLabel", key: "outfit", items: OUTFITS, labels_es: OUTFIT_LABELS_ES },
  { labelKey: "shoesLabel", key: "shoes", items: SHOE_STYLES, labels_es: SHOE_LABELS_ES },
  { labelKey: "nailsLabel", key: "nails", items: NAIL_STYLES, labels_es: NAIL_LABELS_ES },
  { labelKey: "accessoryLabel", key: "accessory", items: ACCESSORIES, labels_es: ACC_LABELS_ES },
];

type AvatarCustomizerProps = {
  avatarConfig: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
  showPreview?: boolean;
  compact?: boolean;
};

export const getAvatarEmoji = (config: AvatarConfig) => HAIR_STYLES[config.hairStyle] || HAIR_STYLES[0];

export const getAvatarComposite = (config: AvatarConfig) => {
  const face = EYE_STYLES[config.eyeStyle] || "👀";
  const hair = HAIR_STYLES[config.hairStyle] || "💇‍♀️";
  const makeup = config.makeup > 0 ? MAKEUP_STYLES[config.makeup] : "";
  const piercing = config.piercing > 0 ? PIERCING_STYLES[config.piercing] : "";
  return { face, hair, makeup, piercing };
};

const AvatarCustomizer = ({ avatarConfig, onChange, showPreview = true, compact = false }: AvatarCustomizerProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const updateAvatar = (key: keyof AvatarConfig, value: number) => {
    onChange({ ...avatarConfig, [key]: value });
  };

  const TABS = [
    { label: "Cara", emoji: "😊", sections: [0, 1, 2, 4] },
    { label: "Look", emoji: "💄", sections: [3, 5, 8] },
    { label: "Outfit", emoji: "👗", sections: [6, 7, 9] },
  ];

  const currentSections = TABS[activeTab]?.sections.map(i => AVATAR_SECTIONS[i]) || [];

  return (
    <div className="w-full space-y-3">
      {showPreview && (
        <motion.div
          layout
          className="mx-auto relative flex h-28 w-28 items-center justify-center rounded-full gradient-fun shadow-card"
        >
          <span className="text-6xl">{getAvatarEmoji(avatarConfig)}</span>
          {avatarConfig.makeup > 0 && (
            <span className="absolute -right-1 top-0 text-lg">{MAKEUP_STYLES[avatarConfig.makeup]}</span>
          )}
          {avatarConfig.piercing > 0 && (
            <span className="absolute -left-1 bottom-2 text-sm">{PIERCING_STYLES[avatarConfig.piercing]}</span>
          )}
          {avatarConfig.accessory > 0 && (
            <span className="absolute -right-2 bottom-0 text-lg">{ACCESSORIES[avatarConfig.accessory]}</span>
          )}
        </motion.div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1.5 justify-center">
        {TABS.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 font-display text-xs font-bold transition-all ${
              activeTab === idx
                ? "gradient-primary text-primary-foreground shadow-soft"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sections for active tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {currentSections.map((section) => (
            <div key={section.key}>
              <label className="mb-1.5 block font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(section.labelKey as any) || section.labelKey}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {section.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateAvatar(section.key, idx)}
                    className={`flex flex-col items-center justify-center rounded-xl transition-all ${
                      compact ? "h-10 w-10 text-lg" : "h-14 w-14 text-xl"
                    } ${
                      avatarConfig[section.key] === idx
                        ? "gradient-primary shadow-soft scale-110 ring-2 ring-primary/30"
                        : "bg-muted hover:bg-secondary"
                    }`}
                    title={section.labels_es[idx]}
                  >
                    <span>{item}</span>
                    {!compact && (
                      <span className="text-[8px] font-display font-bold text-muted-foreground mt-0.5 leading-none truncate w-full text-center px-0.5">
                        {section.labels_es[idx]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AvatarCustomizer;

// Curated sticker pack for meeting chat.
// Stickers are emoji-based glyphs rendered in a styled bubble — no uploads,
// no external assets, no storage, and no moderation needed since the entire
// catalog is whitelisted server-side via the existing `is_preset = true` flag.
//
// Each sticker is identified by a short id and serialized into a chat message
// using the prefix `:sticker:<id>` (max length well below the 140-char limit).
// The render layer detects this prefix and shows a large emoji thumbnail
// instead of plain text.

export type StickerId =
  | "wave"
  | "love"
  | "wow"
  | "laugh"
  | "cry"
  | "shock"
  | "think"
  | "sus"
  | "shh"
  | "wink"
  | "cool"
  | "party"
  | "sparkle"
  | "heart"
  | "fire"
  | "star"
  | "crown"
  | "cupcake"
  | "rainbow"
  | "unicorn"
  | "agree"
  | "no"
  | "shrug"
  | "clap";

export type Sticker = {
  id: StickerId;
  glyph: string; // single visual glyph (emoji or short combo)
  label: string; // accessible label / tooltip
  bg: string; // tailwind classes for background tint
};

export const STICKERS: Sticker[] = [
  { id: "wave", glyph: "👋", label: "Hola", bg: "bg-pink-100 dark:bg-pink-500/20" },
  { id: "love", glyph: "🥰", label: "Te quiero", bg: "bg-rose-100 dark:bg-rose-500/20" },
  { id: "wow", glyph: "😮", label: "¡Wow!", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { id: "laugh", glyph: "😂", label: "Jajaja", bg: "bg-yellow-100 dark:bg-yellow-500/20" },
  { id: "cry", glyph: "😭", label: "Llorando", bg: "bg-sky-100 dark:bg-sky-500/20" },
  { id: "shock", glyph: "😱", label: "¡Susto!", bg: "bg-violet-100 dark:bg-violet-500/20" },
  { id: "think", glyph: "🤔", label: "Pensando", bg: "bg-stone-100 dark:bg-stone-500/20" },
  { id: "sus", glyph: "🧐", label: "Sospechoso", bg: "bg-orange-100 dark:bg-orange-500/20" },
  { id: "shh", glyph: "🤫", label: "Shhh", bg: "bg-teal-100 dark:bg-teal-500/20" },
  { id: "wink", glyph: "😉", label: "Guiño", bg: "bg-pink-100 dark:bg-pink-500/20" },
  { id: "cool", glyph: "😎", label: "Cool", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
  { id: "party", glyph: "🥳", label: "Fiesta", bg: "bg-fuchsia-100 dark:bg-fuchsia-500/20" },
  { id: "sparkle", glyph: "✨", label: "Brillos", bg: "bg-yellow-100 dark:bg-yellow-500/20" },
  { id: "heart", glyph: "💖", label: "Corazón", bg: "bg-rose-100 dark:bg-rose-500/20" },
  { id: "fire", glyph: "🔥", label: "Fuego", bg: "bg-orange-100 dark:bg-orange-500/20" },
  { id: "star", glyph: "⭐", label: "Estrella", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { id: "crown", glyph: "👑", label: "Reina", bg: "bg-yellow-100 dark:bg-yellow-500/20" },
  { id: "cupcake", glyph: "🧁", label: "Cupcake", bg: "bg-pink-100 dark:bg-pink-500/20" },
  { id: "rainbow", glyph: "🌈", label: "Arcoíris", bg: "bg-sky-100 dark:bg-sky-500/20" },
  { id: "unicorn", glyph: "🦄", label: "Unicornio", bg: "bg-violet-100 dark:bg-violet-500/20" },
  { id: "agree", glyph: "👍", label: "De acuerdo", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  { id: "no", glyph: "🙅‍♀️", label: "No", bg: "bg-red-100 dark:bg-red-500/20" },
  { id: "shrug", glyph: "🤷‍♀️", label: "No sé", bg: "bg-stone-100 dark:bg-stone-500/20" },
  { id: "clap", glyph: "👏", label: "Aplausos", bg: "bg-amber-100 dark:bg-amber-500/20" },
];

const STICKER_MAP: Record<string, Sticker> = STICKERS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, Sticker>,
);

export const STICKER_PREFIX = ":sticker:";

/** Encode a sticker id into a chat message payload. */
export function encodeSticker(id: StickerId): string {
  return `${STICKER_PREFIX}${id}`;
}

/**
 * Parse a chat message and return the matching sticker if (and only if)
 * the entire payload is a known sticker id from the curated catalog.
 * This is the security/validation gate: anything outside the whitelist
 * falls back to plain text rendering.
 */
export function parseSticker(content: string): Sticker | null {
  if (typeof content !== "string") return null;
  if (!content.startsWith(STICKER_PREFIX)) return null;
  const id = content.slice(STICKER_PREFIX.length).trim();
  // strict id format: lowercase letters only, max 16 chars
  if (!/^[a-z]{1,16}$/.test(id)) return null;
  return STICKER_MAP[id] ?? null;
}

export function isStickerMessage(content: string): boolean {
  return parseSticker(content) !== null;
}

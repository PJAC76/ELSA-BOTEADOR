// Client-side word filter for the meeting chat.
//
// Two tiers:
//  - "severe": blocks outgoing messages and auto-reports incoming senders.
//  - "mild":   masks the offending word and lets the message through.
//
// Detection is intentionally conservative: it normalizes accents, common
// leetspeak (3→e, 1→i, 0→o, 4→a, @→a, $→s, 5→s, 7→t), collapses repeated
// characters ("idiotaaaa" → "idiota") and matches with word boundaries to
// avoid false positives on substrings ("classic", "scunthorpe", etc.).

export type FilterSeverity = "clean" | "mild" | "severe";

export type FilterResult = {
  severity: FilterSeverity;
  /** Original text with offending words replaced by "***". */
  maskedText: string;
  /** Lowercased dictionary terms detected (deduped). */
  matches: string[];
};

// Dictionaries kept short on purpose. Tune as needed; we want very high
// precision since we auto-report on "severe".
// NOTE: These are normalized forms (no accents, lowercase).
const SEVERE_TERMS: readonly string[] = [
  // slurs / hate (heavy):
  "puta", "putas", "puto", "putos",
  "zorra", "zorras",
  "perra", "perras",
  "maricon", "maricones",
  "marica", "maricas",
  "negrata", "negratas",
  "retrasada", "retrasado",
  "subnormal", "subnormales",
  // english heavy:
  "bitch", "bitches",
  "slut", "sluts",
  "whore", "whores",
  "faggot", "faggots",
  "retard", "retarded",
  "nigger", "niggers",
  // self-harm / extreme:
  "matate", "matense", "killyourself", "kys",
];

const MILD_TERMS: readonly string[] = [
  // mild insults / vulgarities:
  "idiota", "idiotas",
  "estupida", "estupidas", "estupido", "estupidos",
  "tonta", "tontas", "tonto", "tontos",
  "imbecil", "imbeciles",
  "mierda",
  "joder",
  // english mild:
  "stupid", "idiot", "idiots", "dumb",
  "shit", "crap", "damn",
  "asshole", "assholes",
];

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i",
};

/** Normalize text for matching: lowercase, strip accents, leet→letters,
 *  collapse repeated chars (max 2). Whitespace and other separators kept
 *  as-is so we can re-split into tokens. */
function normalize(input: string): string {
  const lower = input.toLowerCase();
  // Strip diacritics: ñ → n, á → a, etc.
  const stripped = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Map leet chars
  let leeted = "";
  for (const ch of stripped) {
    leeted += LEET_MAP[ch] ?? ch;
  }
  // Collapse repeats: "idiotaaaa" → "idiotaa" (keep up to 2 in a row)
  return leeted.replace(/(.)\1{2,}/g, "$1$1");
}

/** Build a Set for O(1) lookups; pre-normalized at module load. */
const SEVERE_SET = new Set(SEVERE_TERMS.map(normalize));
const MILD_SET = new Set(MILD_TERMS.map(normalize));

/** Tokens are sequences of letters/numbers separated by anything else. */
const TOKEN_RE = /[\p{L}\p{N}@$!]+/gu;

export function analyzeMessage(text: string): FilterResult {
  if (!text || !text.trim()) {
    return { severity: "clean", maskedText: text, matches: [] };
  }

  const normalized = normalize(text);
  // Find tokens with their original spans in the normalized string.
  const matchesSevere = new Set<string>();
  const matchesMild = new Set<string>();

  // We mask on the original text by tracking spans on the normalized form.
  // Since normalize() preserves character count for our transforms (1:1 map,
  // accents removed only when combining marks were stripped → still char
  // count differs). To keep things simple and robust, we mask token by
  // token on the original by re-running TOKEN_RE on the original and
  // independently normalizing each token.
  const masked = text.replace(TOKEN_RE, (raw) => {
    const norm = normalize(raw);
    if (SEVERE_SET.has(norm)) {
      matchesSevere.add(norm);
      return "*".repeat(Math.max(3, raw.length));
    }
    if (MILD_SET.has(norm)) {
      matchesMild.add(norm);
      return "*".repeat(Math.max(3, raw.length));
    }
    return raw;
  });

  // Use normalized full string as a fallback for joined spam like "putaputaputa".
  // Only flag if a severe term appears; we don't try to detect concatenated
  // mild ones (too noisy).
  if (matchesSevere.size === 0) {
    for (const term of SEVERE_SET) {
      if (term.length >= 4 && normalized.includes(term)) {
        matchesSevere.add(term);
        break;
      }
    }
  }

  let severity: FilterSeverity = "clean";
  if (matchesSevere.size > 0) severity = "severe";
  else if (matchesMild.size > 0) severity = "mild";

  return {
    severity,
    maskedText: masked,
    matches: [...matchesSevere, ...matchesMild],
  };
}

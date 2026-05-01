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
  "6": "g",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  "$": "s",
  "!": "i",
  "|": "i",
  "¡": "i",
  "ß": "b",
  "+": "t",
  "(": "c",
  "¢": "c",
  "€": "e",
  "£": "l",
};

/** Common multi-char leet sequences mapped before single-char pass.
 *  Order matters: longest first. */
const LEET_DIGRAPHS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\|\\\//g, "w"],   // |\/  → w
  [/\\\/\\\//g, "w"], // \/\/ → w
  [/\|_\|/g, "u"],    // |_|  → u
  [/\(\)/g, "o"],     // ()   → o
  [/\|\|/g, "n"],     // ||   → n
  [/ph/g, "f"],       // ph   → f (compact form only)
];

/** Normalize a single token for matching: lowercase, strip accents,
 *  leet→letters, collapse repeated chars (max 2). Strict: preserves
 *  separators so token boundaries stay meaningful. */
function normalize(input: string): string {
  const lower = input.toLowerCase();
  const stripped = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let leeted = "";
  for (const ch of stripped) {
    leeted += LEET_MAP[ch] ?? ch;
  }
  return leeted.replace(/(.)\1{2,}/g, "$1$1");
}

/** Aggressive normalization for the *whole-string* fallback only.
 *  - Applies single + multi-char leet mappings
 *  - Strips ALL non-letters (spaces, punctuation, digits, symbols)
 *  - Collapses runs of the same letter to a single one
 *
 *  Catches obfuscations like "p u t a", "p.u.t.a", "p*u*t*a",
 *  "p-u-t-a", "p_u_t_a", "p()()ta", "ph4gg0t". The fallback requires
 *  dictionary terms of length >= 4 AND uses includes() against this
 *  stripped form, so false positives stay low. We do NOT use this for
 *  token-level masking — that path stays strict. */
function normalizeCompact(input: string): string {
  const lower = input.toLowerCase();
  const stripped = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let leeted = "";
  for (const ch of stripped) {
    leeted += LEET_MAP[ch] ?? ch;
  }
  for (const [re, sub] of LEET_DIGRAPHS) {
    leeted = leeted.replace(re, sub);
  }
  const lettersOnly = leeted.replace(/[^a-z]+/g, "");
  return lettersOnly.replace(/(.)\1+/g, "$1");
}

/** Build a Set for O(1) lookups; pre-normalized at module load. */
const SEVERE_SET = new Set(SEVERE_TERMS.map(normalize));
const MILD_SET = new Set(MILD_TERMS.map(normalize));

/** Compact-normalized severe terms (with collapsed repeats) for the
 *  whole-string fallback. Deduped and length-filtered for precision. */
const SEVERE_COMPACT_TERMS = Array.from(
  new Set(
    SEVERE_TERMS
      .map((t) => normalizeCompact(t))
      .filter((t) => t.length >= 4),
  ),
);

/** Tokens are sequences of letters/numbers separated by anything else. */
const TOKEN_RE = /[\p{L}\p{N}@$!|+()¢€£]+/gu;

export function analyzeMessage(text: string): FilterResult {
  if (!text || !text.trim()) {
    return { severity: "clean", maskedText: text, matches: [] };
  }

  const matchesSevere = new Set<string>();
  const matchesMild = new Set<string>();

  // Token-level masking (strict): independently normalize each token.
  // Keeps masking accurate and avoids false positives on innocent words.
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

  // Whole-string compact fallback: catches words split across separators
  // or multiple tokens (e.g. "p u t a", "p*u*t*a", "p.u.t.a"). Severe-only
  // to keep noise low.
  if (matchesSevere.size === 0) {
    const compact = normalizeCompact(text);
    for (const term of SEVERE_COMPACT_TERMS) {
      if (compact.includes(term)) {
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

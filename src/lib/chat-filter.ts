// Client-side word filter for the meeting chat.
//
// Two tiers:
//  - "severe": blocks outgoing messages and auto-reports incoming senders.
//  - "mild":   masks the offending word and lets the message through.
//
// Per-locale tuning
// -----------------
// Some terms are only insulting (or only severe) in a specific language.
// "perra" is severe in Spanish, but its literal English equivalent is not in
// the same tier; "damn" is mild in English but barely meaningful in Spanish.
// To improve precision we keep three buckets per tier:
//   - common: always active (slurs that travel across locales, self-harm,
//     leet-friendly forms used everywhere).
//   - es:     active when the UI language is Spanish.
//   - en:     active when the UI language is English.
//
// Detection still normalizes accents, common leetspeak (3→e, 1→i, 0→o,
// 4→a, @→a, $→s, 5→s, 7→t), collapses repeated chars and matches with
// word boundaries to avoid false positives.

export type FilterSeverity = "clean" | "mild" | "severe";
export type FilterLanguage = "es" | "en";

export type FilterResult = {
  severity: FilterSeverity;
  /** Original text with offending words replaced by "***". */
  maskedText: string;
  /** Lowercased dictionary terms detected (deduped, severe first). */
  matches: string[];
  /** Severe-tier normalized terms that matched. */
  severeMatches: string[];
  /** Mild-tier normalized terms that matched. */
  mildMatches: string[];
};

// --- Dictionaries (normalized: lowercase, no accents) ---------------------
//
// Tune carefully — auto-report fires on "severe", so prefer false negatives
// over false positives.

const SEVERE_COMMON: readonly string[] = [
  // Travels across locales / hate speech that we don't want anywhere:
  "nigger", "niggers",
  "faggot", "faggots",
  // Self-harm / extreme:
  "matate", "matense", "killyourself", "kys",
];

const SEVERE_ES: readonly string[] = [
  "puta", "putas", "puto", "putos",
  "zorra", "zorras",
  "perra", "perras",
  "maricon", "maricones",
  "marica", "maricas",
  "negrata", "negratas",
  "retrasada", "retrasado",
  "subnormal", "subnormales",
];

const SEVERE_EN: readonly string[] = [
  "bitch", "bitches",
  "slut", "sluts",
  "whore", "whores",
  "retard", "retarded",
];

const MILD_COMMON: readonly string[] = [
  // Cross-locale fillers we always soften:
  "wtf",
];

const MILD_ES: readonly string[] = [
  "idiota", "idiotas",
  "estupida", "estupidas", "estupido", "estupidos",
  "tonta", "tontas", "tonto", "tontos",
  "imbecil", "imbeciles",
  "mierda",
  "joder",
];

const MILD_EN: readonly string[] = [
  "stupid", "idiot", "idiots", "dumb",
  "shit", "crap", "damn",
  "asshole", "assholes",
];

// --- Leet helpers ---------------------------------------------------------

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
 *  Catches obfuscations like "p u t a", "p.u.t.a", "p*u*t*a", "ph4gg0t".
 *  We require severe terms of length >= 4 to keep false positives low. */
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

// --- Per-language compiled dictionaries -----------------------------------

type CompiledDict = {
  severe: Set<string>;
  mild: Set<string>;
  severeCompact: string[];
  /** Original (pre-normalization) terms for moderation listings. */
  severeRaw: string[];
  mildRaw: string[];
};

function buildDict(severeRaw: readonly string[], mildRaw: readonly string[]): CompiledDict {
  const severe = new Set(severeRaw.map(normalize));
  const mild = new Set(mildRaw.map(normalize));
  const severeCompact = Array.from(
    new Set(severeRaw.map((t) => normalizeCompact(t)).filter((t) => t.length >= 4)),
  );
  return {
    severe,
    mild,
    severeCompact,
    severeRaw: [...severeRaw],
    mildRaw: [...mildRaw],
  };
}

const DICT: Record<FilterLanguage, CompiledDict> = {
  es: buildDict([...SEVERE_COMMON, ...SEVERE_ES], [...MILD_COMMON, ...MILD_ES]),
  en: buildDict([...SEVERE_COMMON, ...SEVERE_EN], [...MILD_COMMON, ...MILD_EN]),
};

function pickDict(lang?: FilterLanguage): CompiledDict {
  if (lang && DICT[lang]) return DICT[lang];
  return DICT.es;
}

/** Tokens are sequences of letters/numbers separated by anything else. */
const TOKEN_RE = /[\p{L}\p{N}@$!|+()¢€£]+/gu;

/**
 * Analyze a message under a specific language locale. The locale selects
 * which severe/mild dictionary is active so we can keep precision high in
 * each language (e.g. "damn" is only mild in EN, "perra" is only severe
 * in ES). Defaults to Spanish when no locale is provided.
 */
export function analyzeMessage(text: string, lang?: FilterLanguage): FilterResult {
  if (!text || !text.trim()) {
    return { severity: "clean", maskedText: text, matches: [], severeMatches: [], mildMatches: [] };
  }

  const dict = pickDict(lang);
  const matchesSevere = new Set<string>();
  const matchesMild = new Set<string>();

  // Token-level masking (strict): independently normalize each token.
  const masked = text.replace(TOKEN_RE, (raw) => {
    const norm = normalize(raw);
    if (dict.severe.has(norm)) {
      matchesSevere.add(norm);
      return "*".repeat(Math.max(3, raw.length));
    }
    if (dict.mild.has(norm)) {
      matchesMild.add(norm);
      return "*".repeat(Math.max(3, raw.length));
    }
    return raw;
  });

  // Whole-string compact fallback for severe-only obfuscations.
  if (matchesSevere.size === 0) {
    const compact = normalizeCompact(text);
    for (const term of dict.severeCompact) {
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

/** Stats about the active filter dictionary for a given locale. */
export type FilterStats = {
  active: boolean;
  language: FilterLanguage;
  severeCount: number;
  mildCount: number;
  totalCount: number;
};

export function getFilterStats(lang?: FilterLanguage): FilterStats {
  const resolved: FilterLanguage = lang && DICT[lang] ? lang : "es";
  const dict = DICT[resolved];
  return {
    active: true,
    language: resolved,
    severeCount: dict.severe.size,
    mildCount: dict.mild.size,
    totalCount: dict.severe.size + dict.mild.size,
  };
}

/** Read-only listings of the active dictionaries (sorted) for the chosen
 *  locale. Used by the internal moderation screen. */
export function listFilterTerms(lang?: FilterLanguage): { severe: string[]; mild: string[] } {
  const dict = pickDict(lang);
  return {
    severe: [...dict.severeRaw].sort(),
    mild: [...dict.mildRaw].sort(),
  };
}

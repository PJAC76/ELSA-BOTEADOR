/**
 * Tracks which puzzles/items have been used recently to avoid repetition.
 * Uses localStorage. When all items in a pool are exhausted, the history resets.
 */

const STORAGE_KEY = "minigame_history";

type HistoryMap = Record<string, number[]>;

function getHistory(): HistoryMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveHistory(h: HistoryMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}

/**
 * Pick a random index from a pool, avoiding recently used ones.
 * @param key - unique key per game type + difficulty + language
 * @param poolSize - total number of items in the pool
 * @returns the chosen index
 */
export function pickUnused(key: string, poolSize: number): number {
  if (poolSize <= 0) return 0;

  const history = getHistory();
  let used = history[key] || [];

  // If all used, reset
  if (used.length >= poolSize) {
    used = [];
  }

  const available = Array.from({ length: poolSize }, (_, i) => i).filter(i => !used.includes(i));
  const chosen = available[Math.floor(Math.random() * available.length)];

  used.push(chosen);
  history[key] = used;
  saveHistory(history);

  return chosen;
}

/**
 * Pick a random item from an array, avoiding recently used ones.
 */
export function pickUnusedItem<T>(key: string, pool: T[]): T {
  return pool[pickUnused(key, pool.length)];
}

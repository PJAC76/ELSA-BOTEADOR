export type WordCategory = {
  category: string;
  categoryEn: string;
  words: string[];
  wordsEn: string[];
  clues: Record<string, string[]>;
  cluesEn: Record<string, string[]>;
};

import { ANIMALS } from "./word-categories/animals";
import { FOOD } from "./word-categories/food";
import { PLACES } from "./word-categories/places";
import { SPORTS } from "./word-categories/sports";
import { PROFESSIONS } from "./word-categories/professions";
import { OBJECTS } from "./word-categories/objects";
import { EMOTIONS } from "./word-categories/emotions";
import { MOVIES } from "./word-categories/movies";
import { NATURE } from "./word-categories/nature";
import { MUSIC } from "./word-categories/music";
import { TECHNOLOGY } from "./word-categories/technology";
import { FANTASY } from "./word-categories/fantasy";
import { COUNTRIES } from "./word-categories/countries";

export const SECRET_WORD_BANK: WordCategory[] = [
  ANIMALS, FOOD, PLACES, SPORTS, PROFESSIONS, OBJECTS, EMOTIONS, MOVIES,
  NATURE, MUSIC, TECHNOLOGY, FANTASY, COUNTRIES,
];

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let shuffledCategories: WordCategory[] = [];
let categoryPointer = 0;

// Track used word indices per category to avoid repeats
const usedWordsMap = new Map<string, number[]>();

function getNextCategory(): WordCategory {
  if (categoryPointer >= shuffledCategories.length) {
    shuffledCategories = shuffleArray(SECRET_WORD_BANK);
    categoryPointer = 0;
  }
  return shuffledCategories[categoryPointer++];
}

export function resetCategoryRotation() {
  shuffledCategories = shuffleArray(SECRET_WORD_BANK);
  categoryPointer = 0;
}

function pickUniqueWordIndex(cat: WordCategory): number {
  const key = cat.categoryEn;
  let used = usedWordsMap.get(key) || [];

  // If all words used, reset for this category
  if (used.length >= cat.words.length) {
    used = [];
  }

  const available = cat.words.map((_, i) => i).filter((i) => !used.includes(i));
  const picked = available[Math.floor(Math.random() * available.length)];
  used.push(picked);
  usedWordsMap.set(key, used);
  return picked;
}

export function getRandomWord(_roundIndex: number): {
  category: string; categoryEn: string; word: string; wordEn: string;
  clues: string[]; cluesEn: string[];
} {
  const cat = getNextCategory();
  const wordIndex = pickUniqueWordIndex(cat);
  const word = cat.words[wordIndex];
  const wordEn = cat.wordsEn[wordIndex];
  return {
    category: cat.category,
    categoryEn: cat.categoryEn,
    word,
    wordEn,
    clues: cat.clues[word] || [],
    cluesEn: cat.cluesEn[wordEn] || [],
  };
}

export function getWordStats(): { categoryEn: string; category: string; total: number; remaining: number }[] {
  return SECRET_WORD_BANK.map((cat) => {
    const used = usedWordsMap.get(cat.categoryEn) || [];
    const remaining = cat.words.length - (used.length >= cat.words.length ? 0 : used.length);
    return { categoryEn: cat.categoryEn, category: cat.category, total: cat.words.length, remaining };
  });
}

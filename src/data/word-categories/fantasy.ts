import type { WordCategory } from "../secret-words";

export const FANTASY: WordCategory = {
  category: "Fantasía",
  categoryEn: "Fantasy",
  words: ["Dragón", "Unicornio", "Sirena", "Hada", "Vampiro", "Fantasma", "Pirata", "Ninja"],
  wordsEn: ["Dragon", "Unicorn", "Mermaid", "Fairy", "Vampire", "Ghost", "Pirate", "Ninja"],
  clues: {
    Dragón: ["fuego", "alas", "escamas", "cueva", "tesoro"],
    Unicornio: ["cuerno", "mágico", "caballo", "brillante", "arcoíris"],
    Sirena: ["cola", "mar", "cantar", "conchas", "agua"],
    Hada: ["varita", "alas", "pequeña", "magia", "brillar"],
    Vampiro: ["colmillos", "sangre", "noche", "capa", "murciélago"],
    Fantasma: ["transparente", "susto", "cadenas", "flotar", "boo"],
    Pirata: ["barco", "tesoro", "parche", "espada", "isla"],
    Ninja: ["sigilo", "espada", "negro", "rápido", "sombra"],
  },
  cluesEn: {
    Dragon: ["fire", "wings", "scales", "cave", "treasure"],
    Unicorn: ["horn", "magical", "horse", "sparkle", "rainbow"],
    Mermaid: ["tail", "sea", "sing", "shells", "water"],
    Fairy: ["wand", "wings", "tiny", "magic", "glow"],
    Vampire: ["fangs", "blood", "night", "cape", "bat"],
    Ghost: ["transparent", "scare", "chains", "float", "boo"],
    Pirate: ["ship", "treasure", "patch", "sword", "island"],
    Ninja: ["stealth", "sword", "black", "fast", "shadow"],
  },
};

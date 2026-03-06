import type { WordCategory } from "../secret-words";

export const MUSIC: WordCategory = {
  category: "Música",
  categoryEn: "Music",
  words: ["Piano", "Batería", "Violín", "Trompeta", "Flauta", "Arpa", "Saxofón", "Acordeón"],
  wordsEn: ["Piano", "Drums", "Violin", "Trumpet", "Flute", "Harp", "Saxophone", "Accordion"],
  clues: {
    Piano: ["teclas", "blanco", "negro", "melodía", "pedal"],
    Batería: ["baquetas", "ritmo", "platillo", "parche", "golpe"],
    Violín: ["arco", "cuerdas", "orquesta", "agudo", "madera"],
    Trompeta: ["soplar", "metal", "jazz", "boquilla", "brillante"],
    Flauta: ["soplar", "agujeros", "madera", "dulce", "aire"],
    Arpa: ["cuerdas", "ángel", "celestial", "dedos", "grande"],
    Saxofón: ["jazz", "metal", "soplar", "caña", "dorado"],
    Acordeón: ["fuelle", "botones", "polca", "expandir", "folk"],
  },
  cluesEn: {
    Piano: ["keys", "white", "black", "melody", "pedal"],
    Drums: ["sticks", "rhythm", "cymbal", "skin", "beat"],
    Violin: ["bow", "strings", "orchestra", "high", "wood"],
    Trumpet: ["blow", "metal", "jazz", "mouthpiece", "bright"],
    Flute: ["blow", "holes", "wood", "sweet", "air"],
    Harp: ["strings", "angel", "celestial", "fingers", "large"],
    Saxophone: ["jazz", "metal", "blow", "reed", "golden"],
    Accordion: ["bellows", "buttons", "polka", "expand", "folk"],
  },
};

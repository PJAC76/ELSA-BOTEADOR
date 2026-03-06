import type { WordCategory } from "../secret-words";

export const SPORTS: WordCategory = {
  category: "Deportes",
  categoryEn: "Sports",
  words: ["Fútbol", "Natación", "Tenis", "Baloncesto", "Surf", "Yoga", "Boxeo", "Esquí"],
  wordsEn: ["Soccer", "Swimming", "Tennis", "Basketball", "Surfing", "Yoga", "Boxing", "Skiing"],
  clues: {
    Fútbol: ["gol", "balón", "portero", "cancha", "once"],
    Natación: ["piscina", "agua", "brazada", "gafas", "crol"],
    Tenis: ["raqueta", "red", "saque", "pelota", "set"],
    Baloncesto: ["canasta", "dribling", "aro", "triple", "rebote"],
    Surf: ["ola", "tabla", "playa", "equilibrio", "tubo"],
    Yoga: ["postura", "respirar", "esterilla", "calma", "flexión"],
    Boxeo: ["guantes", "ring", "golpe", "round", "esquiva"],
    Esquí: ["nieve", "montaña", "bastón", "pista", "bajada"],
  },
  cluesEn: {
    Soccer: ["goal", "ball", "keeper", "field", "eleven"],
    Swimming: ["pool", "water", "stroke", "goggles", "crawl"],
    Tennis: ["racket", "net", "serve", "ball", "set"],
    Basketball: ["basket", "dribble", "hoop", "three-pointer", "rebound"],
    Surfing: ["wave", "board", "beach", "balance", "tube"],
    Yoga: ["pose", "breathe", "mat", "calm", "stretch"],
    Boxing: ["gloves", "ring", "punch", "round", "dodge"],
    Skiing: ["snow", "mountain", "pole", "slope", "downhill"],
  },
};

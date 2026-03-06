import type { WordCategory } from "../secret-words";

export const EMOTIONS: WordCategory = {
  category: "Emociones",
  categoryEn: "Emotions",
  words: ["Alegría", "Sorpresa", "Nostalgia", "Valentía", "Curiosidad", "Calma", "Orgullo", "Ternura"],
  wordsEn: ["Joy", "Surprise", "Nostalgia", "Bravery", "Curiosity", "Calm", "Pride", "Tenderness"],
  clues: {
    Alegría: ["sonrisa", "risa", "fiesta", "feliz", "bailar"],
    Sorpresa: ["inesperado", "regalo", "asombro", "ojos", "wow"],
    Nostalgia: ["recuerdo", "pasado", "infancia", "melancolía", "fotos"],
    Valentía: ["coraje", "miedo", "héroe", "fuerza", "atreverse"],
    Curiosidad: ["preguntar", "explorar", "descubrir", "buscar", "nuevo"],
    Calma: ["paz", "silencio", "tranquilo", "respirar", "sereno"],
    Orgullo: ["logro", "medalla", "triunfo", "satisfacción", "meta"],
    Ternura: ["abrazo", "suave", "cariño", "bebé", "corazón"],
  },
  cluesEn: {
    Joy: ["smile", "laugh", "party", "happy", "dance"],
    Surprise: ["unexpected", "gift", "awe", "eyes", "wow"],
    Nostalgia: ["memory", "past", "childhood", "melancholy", "photos"],
    Bravery: ["courage", "fear", "hero", "strength", "dare"],
    Curiosity: ["question", "explore", "discover", "search", "new"],
    Calm: ["peace", "silence", "quiet", "breathe", "serene"],
    Pride: ["achievement", "medal", "triumph", "satisfaction", "goal"],
    Tenderness: ["hug", "soft", "affection", "baby", "heart"],
  },
};

import type { WordCategory } from "../secret-words";

export const PLACES: WordCategory = {
  category: "Lugares",
  categoryEn: "Places",
  words: ["Playa", "Montaña", "Museo", "Parque", "Cine", "Hospital", "Aeropuerto", "Biblioteca"],
  wordsEn: ["Beach", "Mountain", "Museum", "Park", "Cinema", "Hospital", "Airport", "Library"],
  clues: {
    Playa: ["arena", "olas", "sol", "mar", "toalla"],
    Montaña: ["cumbre", "nieve", "escalada", "altura", "bosque"],
    Museo: ["arte", "cuadros", "historia", "visita", "exposición"],
    Parque: ["árboles", "juegos", "paseo", "banco", "naturaleza"],
    Cine: ["película", "palomitas", "pantalla", "butaca", "oscuro"],
    Hospital: ["doctor", "salud", "urgencias", "cama", "bata"],
    Aeropuerto: ["avión", "maleta", "vuelo", "pasaporte", "terminal"],
    Biblioteca: ["libros", "silencio", "lectura", "estantes", "estudio"],
  },
  cluesEn: {
    Beach: ["sand", "waves", "sun", "sea", "towel"],
    Mountain: ["summit", "snow", "climb", "height", "forest"],
    Museum: ["art", "paintings", "history", "visit", "exhibit"],
    Park: ["trees", "playground", "walk", "bench", "nature"],
    Cinema: ["movie", "popcorn", "screen", "seat", "dark"],
    Hospital: ["doctor", "health", "emergency", "bed", "gown"],
    Airport: ["plane", "luggage", "flight", "passport", "terminal"],
    Library: ["books", "silence", "reading", "shelves", "study"],
  },
};

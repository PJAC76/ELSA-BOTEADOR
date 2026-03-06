import type { WordCategory } from "../secret-words";

export const OBJECTS: WordCategory = {
  category: "Objetos",
  categoryEn: "Objects",
  words: ["Espejo", "Reloj", "Llave", "Paraguas", "Guitarra", "Cámara", "Vela", "Mapa"],
  wordsEn: ["Mirror", "Clock", "Key", "Umbrella", "Guitar", "Camera", "Candle", "Map"],
  clues: {
    Espejo: ["reflejo", "cristal", "imagen", "baño", "brillante"],
    Reloj: ["hora", "manecillas", "tic-tac", "muñeca", "tiempo"],
    Llave: ["puerta", "cerradura", "metal", "abrir", "llavero"],
    Paraguas: ["lluvia", "mojarse", "tela", "mango", "abrirse"],
    Guitarra: ["cuerdas", "música", "rasgueo", "acorde", "madera"],
    Cámara: ["foto", "lente", "disparo", "enfoque", "recuerdo"],
    Vela: ["fuego", "cera", "mecha", "luz", "romántico"],
    Mapa: ["ruta", "tesoro", "brújula", "territorio", "viaje"],
  },
  cluesEn: {
    Mirror: ["reflection", "glass", "image", "bathroom", "shiny"],
    Clock: ["time", "hands", "tick-tock", "wrist", "hour"],
    Key: ["door", "lock", "metal", "open", "keychain"],
    Umbrella: ["rain", "wet", "fabric", "handle", "fold"],
    Guitar: ["strings", "music", "strum", "chord", "wood"],
    Camera: ["photo", "lens", "shot", "focus", "memory"],
    Candle: ["fire", "wax", "wick", "light", "romantic"],
    Map: ["route", "treasure", "compass", "territory", "travel"],
  },
};

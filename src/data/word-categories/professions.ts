import type { WordCategory } from "../secret-words";

export const PROFESSIONS: WordCategory = {
  category: "Profesiones",
  categoryEn: "Professions",
  words: ["Doctora", "Chef", "Piloto", "Artista", "Bombera", "Astronauta", "Fotógrafa", "Detective"],
  wordsEn: ["Doctor", "Chef", "Pilot", "Artist", "Firefighter", "Astronaut", "Photographer", "Detective"],
  clues: {
    Doctora: ["estetoscopio", "receta", "paciente", "salud", "bata"],
    Chef: ["cocina", "cuchillo", "receta", "sabor", "gorro"],
    Piloto: ["avión", "cabina", "vuelo", "cielo", "control"],
    Artista: ["pincel", "lienzo", "color", "estudio", "obra"],
    Bombera: ["fuego", "manguera", "sirena", "rescate", "casco"],
    Astronauta: ["espacio", "cohete", "órbita", "traje", "gravedad"],
    Fotógrafa: ["cámara", "lente", "retrato", "flash", "enfoque"],
    Detective: ["pista", "lupa", "misterio", "caso", "sospechoso"],
  },
  cluesEn: {
    Doctor: ["stethoscope", "prescription", "patient", "health", "coat"],
    Chef: ["kitchen", "knife", "recipe", "flavor", "hat"],
    Pilot: ["plane", "cockpit", "flight", "sky", "control"],
    Artist: ["brush", "canvas", "color", "studio", "work"],
    Firefighter: ["fire", "hose", "siren", "rescue", "helmet"],
    Astronaut: ["space", "rocket", "orbit", "suit", "gravity"],
    Photographer: ["camera", "lens", "portrait", "flash", "focus"],
    Detective: ["clue", "magnifier", "mystery", "case", "suspect"],
  },
};

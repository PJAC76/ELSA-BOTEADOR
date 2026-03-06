import type { WordCategory } from "../secret-words";

export const NATURE: WordCategory = {
  category: "Naturaleza",
  categoryEn: "Nature",
  words: ["Volcán", "Arcoíris", "Tornado", "Cascada", "Bosque", "Desierto", "Aurora", "Relámpago"],
  wordsEn: ["Volcano", "Rainbow", "Tornado", "Waterfall", "Forest", "Desert", "Aurora", "Lightning"],
  clues: {
    Volcán: ["lava", "erupción", "cráter", "ceniza", "magma"],
    Arcoíris: ["lluvia", "colores", "sol", "cielo", "arco"],
    Tornado: ["viento", "girar", "destrucción", "embudo", "tormenta"],
    Cascada: ["agua", "caer", "río", "roca", "niebla"],
    Bosque: ["árboles", "hojas", "sombra", "sendero", "animales"],
    Desierto: ["arena", "calor", "cactus", "seco", "oasis"],
    Aurora: ["norte", "luces", "cielo", "colores", "polar"],
    Relámpago: ["trueno", "luz", "tormenta", "rayo", "cielo"],
  },
  cluesEn: {
    Volcano: ["lava", "eruption", "crater", "ash", "magma"],
    Rainbow: ["rain", "colors", "sun", "sky", "arc"],
    Tornado: ["wind", "spin", "destruction", "funnel", "storm"],
    Waterfall: ["water", "fall", "river", "rock", "mist"],
    Forest: ["trees", "leaves", "shade", "trail", "animals"],
    Desert: ["sand", "heat", "cactus", "dry", "oasis"],
    Aurora: ["north", "lights", "sky", "colors", "polar"],
    Lightning: ["thunder", "light", "storm", "bolt", "sky"],
  },
};

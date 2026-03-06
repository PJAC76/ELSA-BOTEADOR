import type { WordCategory } from "../secret-words";

export const MOVIES: WordCategory = {
  category: "Películas",
  categoryEn: "Movies",
  words: ["Titanic", "Avatar", "Frozen", "Coco", "Matrix", "Shrek", "Moana", "Encanto"],
  wordsEn: ["Titanic", "Avatar", "Frozen", "Coco", "Matrix", "Shrek", "Moana", "Encanto"],
  clues: {
    Titanic: ["barco", "iceberg", "Rose", "hundirse", "océano"],
    Avatar: ["azul", "Pandora", "selva", "alien", "volar"],
    Frozen: ["hielo", "Elsa", "canción", "hermanas", "nieve"],
    Coco: ["calavera", "México", "guitarra", "familia", "recuerdo"],
    Matrix: ["pastilla", "Neo", "código", "simulación", "agente"],
    Shrek: ["ogro", "pantano", "burro", "princesa", "verde"],
    Moana: ["mar", "isla", "Maui", "navegación", "coral"],
    Encanto: ["magia", "Colombia", "Mirabel", "casita", "familia"],
  },
  cluesEn: {
    Titanic: ["ship", "iceberg", "Rose", "sink", "ocean"],
    Avatar: ["blue", "Pandora", "jungle", "alien", "fly"],
    Frozen: ["ice", "Elsa", "song", "sisters", "snow"],
    Coco: ["skull", "Mexico", "guitar", "family", "remember"],
    Matrix: ["pill", "Neo", "code", "simulation", "agent"],
    Shrek: ["ogre", "swamp", "donkey", "princess", "green"],
    Moana: ["sea", "island", "Maui", "navigation", "coral"],
    Encanto: ["magic", "Colombia", "Mirabel", "house", "family"],
  },
};

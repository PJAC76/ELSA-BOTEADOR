import type { WordCategory } from "../secret-words";

export const TECHNOLOGY: WordCategory = {
  category: "Tecnología",
  categoryEn: "Technology",
  words: ["Robot", "Cohete", "Drone", "Satélite", "Telescopio", "Microscopio", "Brújula", "Imán"],
  wordsEn: ["Robot", "Rocket", "Drone", "Satellite", "Telescope", "Microscope", "Compass", "Magnet"],
  clues: {
    Robot: ["metal", "máquina", "programar", "futuro", "brazo"],
    Cohete: ["espacio", "lanzamiento", "fuego", "velocidad", "órbita"],
    Drone: ["volar", "control", "cámara", "hélice", "remoto"],
    Satélite: ["órbita", "señal", "espacio", "antena", "tierra"],
    Telescopio: ["estrellas", "lente", "mirar", "galaxia", "noche"],
    Microscopio: ["pequeño", "lente", "célula", "aumentar", "ciencia"],
    Brújula: ["norte", "aguja", "dirección", "magnético", "orientar"],
    Imán: ["atraer", "metal", "polo", "fuerza", "pegarse"],
  },
  cluesEn: {
    Robot: ["metal", "machine", "program", "future", "arm"],
    Rocket: ["space", "launch", "fire", "speed", "orbit"],
    Drone: ["fly", "control", "camera", "propeller", "remote"],
    Satellite: ["orbit", "signal", "space", "antenna", "earth"],
    Telescope: ["stars", "lens", "look", "galaxy", "night"],
    Microscope: ["tiny", "lens", "cell", "magnify", "science"],
    Compass: ["north", "needle", "direction", "magnetic", "orient"],
    Magnet: ["attract", "metal", "pole", "force", "stick"],
  },
};

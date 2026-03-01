export type WordCategory = {
  category: string;
  categoryEn: string;
  words: string[];
  wordsEn: string[];
};

export const SECRET_WORD_BANK: WordCategory[] = [
  {
    category: "Animales",
    categoryEn: "Animals",
    words: ["Gato", "Perro", "Delfín", "Águila", "Mariposa", "Tortuga", "Caballo", "Pingüino"],
    wordsEn: ["Cat", "Dog", "Dolphin", "Eagle", "Butterfly", "Turtle", "Horse", "Penguin"],
  },
  {
    category: "Comida",
    categoryEn: "Food",
    words: ["Pizza", "Sushi", "Tacos", "Helado", "Hamburguesa", "Pasta", "Chocolate", "Ensalada"],
    wordsEn: ["Pizza", "Sushi", "Tacos", "Ice cream", "Burger", "Pasta", "Chocolate", "Salad"],
  },
  {
    category: "Lugares",
    categoryEn: "Places",
    words: ["Playa", "Montaña", "Museo", "Parque", "Cine", "Hospital", "Aeropuerto", "Biblioteca"],
    wordsEn: ["Beach", "Mountain", "Museum", "Park", "Cinema", "Hospital", "Airport", "Library"],
  },
  {
    category: "Deportes",
    categoryEn: "Sports",
    words: ["Fútbol", "Natación", "Tenis", "Baloncesto", "Surf", "Yoga", "Boxeo", "Esquí"],
    wordsEn: ["Soccer", "Swimming", "Tennis", "Basketball", "Surfing", "Yoga", "Boxing", "Skiing"],
  },
  {
    category: "Profesiones",
    categoryEn: "Professions",
    words: ["Doctora", "Chef", "Piloto", "Artista", "Bombera", "Astronauta", "Fotógrafa", "Detective"],
    wordsEn: ["Doctor", "Chef", "Pilot", "Artist", "Firefighter", "Astronaut", "Photographer", "Detective"],
  },
  {
    category: "Objetos",
    categoryEn: "Objects",
    words: ["Espejo", "Reloj", "Llave", "Paraguas", "Guitarra", "Cámara", "Vela", "Mapa"],
    wordsEn: ["Mirror", "Clock", "Key", "Umbrella", "Guitar", "Camera", "Candle", "Map"],
  },
  {
    category: "Emociones",
    categoryEn: "Emotions",
    words: ["Alegría", "Sorpresa", "Nostalgia", "Valentía", "Curiosidad", "Calma", "Orgullo", "Ternura"],
    wordsEn: ["Joy", "Surprise", "Nostalgia", "Bravery", "Curiosity", "Calm", "Pride", "Tenderness"],
  },
  {
    category: "Películas",
    categoryEn: "Movies",
    words: ["Titanic", "Avatar", "Frozen", "Coco", "Matrix", "Shrek", "Moana", "Encanto"],
    wordsEn: ["Titanic", "Avatar", "Frozen", "Coco", "Matrix", "Shrek", "Moana", "Encanto"],
  },
];

export function getRandomWord(roundIndex: number): { category: string; categoryEn: string; word: string; wordEn: string } {
  const catIndex = roundIndex % SECRET_WORD_BANK.length;
  const cat = SECRET_WORD_BANK[catIndex];
  const wordIndex = Math.floor(Math.random() * cat.words.length);
  return {
    category: cat.category,
    categoryEn: cat.categoryEn,
    word: cat.words[wordIndex],
    wordEn: cat.wordsEn[wordIndex],
  };
}

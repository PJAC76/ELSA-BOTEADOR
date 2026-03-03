export type WordCategory = {
  category: string;
  categoryEn: string;
  words: string[];
  wordsEn: string[];
  clues: Record<string, string[]>;
  cluesEn: Record<string, string[]>;
};

export const SECRET_WORD_BANK: WordCategory[] = [
  {
    category: "Animales",
    categoryEn: "Animals",
    words: ["Gato", "Perro", "Delfín", "Águila", "Mariposa", "Tortuga", "Caballo", "Pingüino"],
    wordsEn: ["Cat", "Dog", "Dolphin", "Eagle", "Butterfly", "Turtle", "Horse", "Penguin"],
    clues: {
      Gato: ["bigotes", "ronroneo", "felino", "siete vidas", "maullido"],
      Perro: ["ladrido", "hueso", "fiel", "cola", "paseo"],
      Delfín: ["océano", "salto", "inteligente", "aleta", "nariz"],
      Águila: ["cielo", "garras", "nido", "vuelo", "pico"],
      Mariposa: ["alas", "colores", "oruga", "jardín", "néctar"],
      Tortuga: ["caparazón", "lenta", "reptil", "longeva", "arena"],
      Caballo: ["galope", "herradura", "crin", "establo", "montar"],
      Pingüino: ["hielo", "antártico", "esmoquin", "nadar", "frío"],
    },
    cluesEn: {
      Cat: ["whiskers", "purr", "feline", "nine lives", "meow"],
      Dog: ["bark", "bone", "loyal", "tail", "walk"],
      Dolphin: ["ocean", "jump", "smart", "fin", "nose"],
      Eagle: ["sky", "claws", "nest", "flight", "beak"],
      Butterfly: ["wings", "colors", "caterpillar", "garden", "nectar"],
      Turtle: ["shell", "slow", "reptile", "long-lived", "sand"],
      Horse: ["gallop", "horseshoe", "mane", "stable", "ride"],
      Penguin: ["ice", "antarctic", "tuxedo", "swim", "cold"],
    },
  },
  {
    category: "Comida",
    categoryEn: "Food",
    words: ["Pizza", "Sushi", "Tacos", "Helado", "Hamburguesa", "Pasta", "Chocolate", "Ensalada"],
    wordsEn: ["Pizza", "Sushi", "Tacos", "Ice cream", "Burger", "Pasta", "Chocolate", "Salad"],
    clues: {
      Pizza: ["queso", "horno", "Italia", "masa", "pepperoni"],
      Sushi: ["arroz", "Japón", "alga", "pescado", "palillos"],
      Tacos: ["tortilla", "México", "salsa", "carne", "limón"],
      Helado: ["frío", "cono", "sabor", "vainilla", "verano"],
      Hamburguesa: ["pan", "carne", "ketchup", "parrilla", "queso"],
      Pasta: ["Italia", "salsa", "fideos", "tomate", "albahaca"],
      Chocolate: ["cacao", "dulce", "tableta", "bombón", "oscuro"],
      Ensalada: ["lechuga", "fresca", "tomate", "aceite", "verde"],
    },
    cluesEn: {
      Pizza: ["cheese", "oven", "Italy", "dough", "pepperoni"],
      Sushi: ["rice", "Japan", "seaweed", "fish", "chopsticks"],
      Tacos: ["tortilla", "Mexico", "salsa", "meat", "lime"],
      "Ice cream": ["cold", "cone", "flavor", "vanilla", "summer"],
      Burger: ["bun", "meat", "ketchup", "grill", "cheese"],
      Pasta: ["Italy", "sauce", "noodles", "tomato", "basil"],
      Chocolate: ["cocoa", "sweet", "bar", "truffle", "dark"],
      Salad: ["lettuce", "fresh", "tomato", "oil", "green"],
    },
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export function getRandomWord(roundIndex: number): {
  category: string; categoryEn: string; word: string; wordEn: string;
  clues: string[]; cluesEn: string[];
} {
  const catIndex = roundIndex % SECRET_WORD_BANK.length;
  const cat = SECRET_WORD_BANK[catIndex];
  const wordIndex = Math.floor(Math.random() * cat.words.length);
  const word = cat.words[wordIndex];
  const wordEn = cat.wordsEn[wordIndex];
  return {
    category: cat.category,
    categoryEn: cat.categoryEn,
    word,
    wordEn,
    clues: cat.clues[word] || [],
    cluesEn: cat.cluesEn[wordEn] || [],
  };
}

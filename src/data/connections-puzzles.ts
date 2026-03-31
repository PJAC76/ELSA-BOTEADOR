type ConnectionGroup = { category: string; words: string[] };

export type ConnectionPuzzles = Record<"easy" | "medium" | "hard", { es: ConnectionGroup[][]; en: ConnectionGroup[][] }>;

export const CONNECTIONS_PUZZLES: ConnectionPuzzles = {
  easy: {
    es: [
      [
        { category: "🍎 Frutas", words: ["MANZANA", "PERA"] },
        { category: "🐾 Animales", words: ["GATO", "PERRO"] },
        { category: "🎨 Colores", words: ["ROJO", "AZUL"] },
      ],
      [
        { category: "⚽ Deportes", words: ["FÚTBOL", "TENIS"] },
        { category: "🌤️ Clima", words: ["LLUVIA", "SOL"] },
        { category: "🎵 Música", words: ["PIANO", "GUITARRA"] },
      ],
      [
        { category: "🎤 Reggaetón", words: ["PERREO", "DEMBOW"] },
        { category: "📺 Series", words: ["ÉLITE", "MERLÍ"] },
        { category: "🎮 Juegos", words: ["FORTNITE", "MINECRAFT"] },
      ],
      [
        { category: "🍕 Comida rápida", words: ["PIZZA", "BURGER"] },
        { category: "📱 Redes sociales", words: ["TIKTOK", "INSTAGRAM"] },
        { category: "🎬 Plataformas", words: ["NETFLIX", "DISNEY+"] },
      ],
    ],
    en: [
      [
        { category: "🍎 Fruits", words: ["APPLE", "GRAPE"] },
        { category: "🐾 Animals", words: ["CAT", "DOG"] },
        { category: "🎨 Colors", words: ["RED", "BLUE"] },
      ],
      [
        { category: "⚽ Sports", words: ["SOCCER", "TENNIS"] },
        { category: "🌤️ Weather", words: ["RAIN", "SUN"] },
        { category: "🎵 Music", words: ["PIANO", "GUITAR"] },
      ],
      [
        { category: "🎤 Reggaetón", words: ["PERREO", "DEMBOW"] },
        { category: "📺 Series", words: ["ELITE", "MERLI"] },
        { category: "🎮 Games", words: ["FORTNITE", "MINECRAFT"] },
      ],
      [
        { category: "🍕 Fast food", words: ["PIZZA", "BURGER"] },
        { category: "📱 Social media", words: ["TIKTOK", "INSTAGRAM"] },
        { category: "🎬 Platforms", words: ["NETFLIX", "DISNEY+"] },
      ],
    ],
  },
  medium: {
    es: [
      [
        { category: "🏖️ Playa", words: ["ARENA", "OLA", "CONCHA"] },
        { category: "🚀 Espacio", words: ["ESTRELLA", "LUNA", "COMETA"] },
        { category: "🍳 Cocina", words: ["SARTÉN", "HORNO", "CUCHILLO"] },
      ],
      [
        { category: "📚 Escuela", words: ["LÁPIZ", "PIZARRA", "MOCHILA"] },
        { category: "🎃 Halloween", words: ["BRUJA", "VAMPIRO", "FANTASMA"] },
        { category: "🌊 Océano", words: ["TIBURÓN", "PULPO", "CORAL"] },
      ],
      // Reggaetón artists
      [
        { category: "🐰 Canciones Bad Bunny", words: ["YONAGUNI", "DAKITI", "TITÍ"] },
        { category: "🦋 Canciones Rosalía", words: ["MALAMENTE", "MOTOMAMI", "DESPECHÁ"] },
        { category: "👑 Canciones Karol G", words: ["BICHOTA", "PROVENZA", "TUSA"] },
      ],
      // Series Netflix
      [
        { category: "💰 La Casa de Papel", words: ["TOKIO", "BERLÍN", "PROFESOR"] },
        { category: "🏫 Élite", words: ["GUZMÁN", "MARINA", "SAMUEL"] },
        { category: "👽 Stranger Things", words: ["ELEVEN", "DEMOGORGON", "VECNA"] },
      ],
      // Streamers & TikTokers
      [
        { category: "🎙️ Streamers España", words: ["IBAI", "AURONPLAY", "RUBIUS"] },
        { category: "💃 TikTokers", words: ["LOLA LOLITA", "NAIM DARRECHI", "MARINA RIVERS"] },
        { category: "🎶 Artistas urbanos", words: ["QUEVEDO", "SAIKO", "DUKI"] },
      ],
    ],
    en: [
      [
        { category: "🏖️ Beach", words: ["SAND", "WAVE", "SHELL"] },
        { category: "🚀 Space", words: ["STAR", "MOON", "COMET"] },
        { category: "🍳 Kitchen", words: ["PAN", "OVEN", "KNIFE"] },
      ],
      [
        { category: "📚 School", words: ["PENCIL", "BOARD", "BACKPACK"] },
        { category: "🎃 Halloween", words: ["WITCH", "VAMPIRE", "GHOST"] },
        { category: "🌊 Ocean", words: ["SHARK", "OCTOPUS", "CORAL"] },
      ],
      [
        { category: "🐰 Bad Bunny songs", words: ["YONAGUNI", "DAKITI", "TITÍ"] },
        { category: "🦋 Rosalía songs", words: ["MALAMENTE", "MOTOMAMI", "DESPECHÁ"] },
        { category: "👑 Karol G songs", words: ["BICHOTA", "PROVENZA", "TUSA"] },
      ],
      [
        { category: "💰 Money Heist", words: ["TOKYO", "BERLIN", "PROFESSOR"] },
        { category: "🏫 Elite", words: ["GUZMÁN", "MARINA", "SAMUEL"] },
        { category: "👽 Stranger Things", words: ["ELEVEN", "DEMOGORGON", "VECNA"] },
      ],
      [
        { category: "🎙️ Spanish streamers", words: ["IBAI", "AURONPLAY", "RUBIUS"] },
        { category: "💃 TikTokers", words: ["LOLA LOLITA", "NAIM DARRECHI", "MARINA RIVERS"] },
        { category: "🎶 Urban artists", words: ["QUEVEDO", "SAIKO", "DUKI"] },
      ],
    ],
  },
  hard: {
    es: [
      [
        { category: "🎬 Tienen secuelas", words: ["MATRIX", "AVATAR", "FROZEN"] },
        { category: "💎 Son transparentes", words: ["CRISTAL", "AGUA", "AIRE"] },
        { category: "⚡ Dan energía", words: ["CAFÉ", "SOL", "BATERÍA"] },
        { category: "🔄 Giran", words: ["RUEDA", "PLANETA", "VENTILADOR"] },
      ],
      [
        { category: "🎭 Doble significado", words: ["BANCO", "GATO", "PLANTA"] },
        { category: "🌙 Nocturnos", words: ["BÚHO", "MURCIÉLAGO", "ESTRELLA"] },
        { category: "📱 Apps famosas", words: ["TIKTOK", "SPOTIFY", "DISCORD"] },
        { category: "🧊 Fríos", words: ["HIELO", "NIEVE", "POLO"] },
      ],
      // Reggaetón deep cuts
      [
        { category: "🎤 Colaboran con Bad Bunny", words: ["ROSALÍA", "JHAY CORTEZ", "CHENCHO"] },
        { category: "🇨🇴 Artistas colombianos", words: ["SHAKIRA", "J BALVIN", "MALUMA"] },
        { category: "🏆 Nº1 en España 2023", words: ["QUEVEDO", "BIZARRAP", "SAIKO"] },
        { category: "🎧 Sellos discográficos", words: ["RIMAS", "UNIVERSAL", "SONY"] },
      ],
      // Series & cultura pop cruzada
      [
        { category: "🔴 Personajes con máscara", words: ["DALÍ", "GHOSTFACE", "V"] },
        { category: "👑 Reinas ficticias", words: ["CERSEI", "DAENERYS", "ELSA"] },
        { category: "🎮 Mundos de videojuego", words: ["HYRULE", "FORNITE ISLAND", "LOS SANTOS"] },
        { category: "📸 Trends de TikTok", words: ["LIPSYNC", "DUET", "STITCH"] },
      ],
      // Cultura pop española avanzada
      [
        { category: "🇪🇸 Programas TV España", words: ["OT", "PASAPALABRA", "LA ISLA"] },
        { category: "⚽ Jugadores españoles", words: ["PEDRI", "GAVI", "YAMAL"] },
        { category: "🎬 Directores españoles", words: ["ALMODÓVAR", "BAYONA", "AMENÁBAR"] },
        { category: "🍷 Cosas típicas España", words: ["SIESTA", "TAPAS", "FLAMENCO"] },
      ],
    ],
    en: [
      [
        { category: "🎬 Have sequels", words: ["MATRIX", "AVATAR", "FROZEN"] },
        { category: "💎 Transparent", words: ["CRYSTAL", "WATER", "AIR"] },
        { category: "⚡ Give energy", words: ["COFFEE", "SUN", "BATTERY"] },
        { category: "🔄 They spin", words: ["WHEEL", "PLANET", "FAN"] },
      ],
      [
        { category: "🎭 Double meaning", words: ["BANK", "BAT", "PLANT"] },
        { category: "🌙 Nocturnal", words: ["OWL", "MOTH", "STAR"] },
        { category: "📱 Famous apps", words: ["TIKTOK", "SPOTIFY", "DISCORD"] },
        { category: "🧊 Cold things", words: ["ICE", "SNOW", "FROST"] },
      ],
      [
        { category: "🎤 Bad Bunny collabs", words: ["ROSALÍA", "JHAY CORTEZ", "CHENCHO"] },
        { category: "🇨🇴 Colombian artists", words: ["SHAKIRA", "J BALVIN", "MALUMA"] },
        { category: "🏆 #1 hits Spain 2023", words: ["QUEVEDO", "BIZARRAP", "SAIKO"] },
        { category: "🎧 Record labels", words: ["RIMAS", "UNIVERSAL", "SONY"] },
      ],
      [
        { category: "🔴 Masked characters", words: ["DALÍ", "GHOSTFACE", "V"] },
        { category: "👑 Fictional queens", words: ["CERSEI", "DAENERYS", "ELSA"] },
        { category: "🎮 Game worlds", words: ["HYRULE", "FORTNITE ISLAND", "LOS SANTOS"] },
        { category: "📸 TikTok trends", words: ["LIPSYNC", "DUET", "STITCH"] },
      ],
      [
        { category: "🇪🇸 Spanish TV shows", words: ["OT", "PASAPALABRA", "THE ISLAND"] },
        { category: "⚽ Spanish players", words: ["PEDRI", "GAVI", "YAMAL"] },
        { category: "🎬 Spanish directors", words: ["ALMODÓVAR", "BAYONA", "AMENÁBAR"] },
        { category: "🍷 Typical Spain", words: ["SIESTA", "TAPAS", "FLAMENCO"] },
      ],
    ],
  },
};

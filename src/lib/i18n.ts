import { useSettingsStore } from "@/stores/settings-store";

const translations = {
  es: {
    // Common
    back: "← Volver",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    send: "Enviar",
    close: "Cerrar",
    or: "o",
    level: "Nivel",
    you: "Tú",

    // Splash
    splashLoading: "Preparando el campus...",

    // Login
    welcome: "¡Bienvenida!",
    welcomeSubtitle: "Entra al campus y descubre quién es ELSA-BOTEADOR",
    continueWithGoogle: "Continuar con Google",
    emailAndPassword: "Email y contraseña",
    noAccount: "¿No tienes cuenta?",
    register: "Regístrate",
    login: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    campusAwaits: "¡El campus te espera!",
    joinTheFun: "Únete a la diversión",
    yourName: "Tu nombre",
    email: "Email",
    password: "Contraseña",
    enter: "Entrar",
    createAccountBtn: "Crear cuenta",
    haveAccount: "¿Ya tienes cuenta?",
    signIn: "Inicia sesión",

    // Age gate
    ageVerification: "Verificación de edad",
    ageVerificationDesc: "Necesitamos confirmar que tienes al menos 14 años para poder jugar 🎂",
    ageBlocked: "¡Ups! Aún no puedes entrar",
    ageBlockedDesc: "ELSA-BOTEADOR es para mayores de 14 años. ¡Vuelve cuando crezcas un poquito más! 💜",

    // Create profile
    createProfile: "Crea tu perfil",
    createProfileDesc: "Elige cómo te verán en el campus ✨",
    name: "Nombre",
    namePlaceholder: "Tu nombre en el campus",
    characters: "caracteres",
    skinLabel: "Piel",
    hairLabel: "Pelo",
    hairColorLabel: "Color de pelo",
    clothesLabel: "Ropa",
    accessoryLabel: "Accesorio",
    language: "Idioma",
    letsGo: "¡Listo, vamos! 🎉",

    // Home
    helloAgain: "¡Hola de nuevo!",
    playWithFriends: "Jugar con Amigas",
    createOrJoinPrivate: "Crea o únete a una sala privada",
    quickPlay: "Partida Rápida",
    findPlayersInstantly: "Encuentra jugadoras al instante",
    howToPlay: "¿Cómo se juega?",
    profile: "Perfil",
    inventory: "Inventario",
    friends: "Amigas",
    settings: "Ajustes",

    // Play friends
    createRoom: "Crear Sala",
    createRoomDesc: "Genera un código para tus amigas",
    joinRoom: "Unirse a Sala",
    joinRoomDesc: "Introduce el código de tu amiga",

    // Create room
    yourPrivateRoom: "Tu Sala Privada",
    shareCode: "Comparte este código con tus amigas",
    copied: "¡Copiado!",
    copyCode: "Copiar código",
    players: "Jugadoras",
    waitingPlayers: "Esperando jugadoras... 🎀",
    goToLobby: "Ir al Lobby →",

    // Join room
    enterFriendCode: "Introduce el código que te compartió tu amiga",
    joinRoomBtn: "Unirse a la sala",

    // Quick play
    quickPlayTitle: "Partida Rápida",
    quickPlayDesc: "Encuentra jugadoras al instante. Elige tu idioma para emparejar con personas que hablen lo mismo.",
    matchLanguage: "Idioma de partida",
    searchMatch: "Buscar partida",
    searchingMatch: "Buscando partida...",
    playersFound: "jugadoras encontradas",

    // Friends
    friendsTitle: "Amigas",
    myCode: "Mi código:",
    friendsTab: "Amigas",
    pendingTab: "Pendientes",
    addFriendByCode: "Agregar amiga por código",
    enterFriendCodePlaceholder: "Introduce el código de tu amiga",
    noPendingRequests: "No tienes solicitudes pendientes",
    addFriendsWithCode: "Agrega amigas con su código",
    pendingRequest: "Solicitud pendiente",
    online: "En línea 🟢",
    offline: "Desconectada",

    // Lobby
    lobby: "Lobby",
    roomLabel: "Sala",
    friendsMode: "Amigas",
    quickMode: "Rápida",
    ready: "listas",
    chat: "Chat 💬",
    writeMessage: "Escribe un mensaje...",
    usePresetsOrEmojis: "Usa presets o emojis para chatear 👆",
    imReady: "Estoy lista",
    readyCheck: "✅ Lista",
    start: "🚀 Empezar",
    chooseRole: "Elige tu rol (solo pruebas)",

    // Role reveal
    agent: "Agente",
    saboteur: "ELSA-BOTEADOR",
    agentMission: "Completa las tareas y descubre a ELSA-BOTEADOR",
    saboteurMission: "Sabotea las tareas sin que te descubran",
    discoveringRole: "Descubriendo tu rol...",
    youAre: "Eres",
    enteringMatch: "Entrando a la partida...",

    // Game HUD
    round: "Ronda",
    agentBadge: "🕵️ Agente",
    saboteurBadge: "💣 ELSA-BOTEADOR",

    // Zone map
    mainBuilding: "Edificio Principal",
    sabotaged: "¡Saboteada!",
    zoneLibrary: "Biblioteca",
    zoneCafeteria: "Cafetería",
    zoneAuditorium: "Auditorio",
    zoneLab: "Laboratorio",
    zoneGym: "Gimnasio",
    zoneGarden: "Jardín",

    // Sabotage panel
    chooseSabotageZone: "Elige zona para sabotear",
    cooldownLabel: "Cooldown",
    sabotageZone: "💣 Sabotear zona",

    // Task mini-game
    taskLabel: "Tarea",
    memorizeSequence: "¡Memoriza la secuencia!",
    repeatSequence: "¡Repite la secuencia!",
    step: "Paso",
    of: "de",
    solveQuickly: "¡Resuelve rápido!",
    findPairs: "¡Encuentra los pares!",
    taskCompleted: "¡Tarea completada!",
    taskFailed: "¡Fallaste!",

    // Emergency button
    emergency: "🚨 ¡Emergencia!",
    emergencyCooldown: "Emergencia",

    // Meeting
    emergencyMeeting: "Reunión de emergencia",
    discussSaboteur: "Discutan quién puede ser ELSA-BOTEADOR",
    voteNow: "¡Voten ahora!",
    voteResult: "Resultado de la votación",
    discussion: "Discusión",
    voting: "Votación",
    discussionStarted: "La discusión ha comenzado...",
    discussionTimer: "Discusión",
    whoIsSaboteur: "¿Quién es ELSA-BOTEADOR?",
    skipVote: "Saltar voto",
    ghostObserver: "👻 Eres fantasma. Solo puedes observar.",
    ghostCantVote: "👻 No puedes votar como fantasma.",
    wasEliminated: "fue eliminada",
    wasSaboteur: "💣 ¡Era ELSA-BOTEADOR!",
    wasAgent: "🕵️ Era una Agente inocente...",
    greatWork: "¡Gran trabajo, equipo!",
    eliminatedAlly: "Han eliminado a una aliada...",
    noConsensus: "Sin consenso",
    noConsensusDesc: "No hubo suficientes votos. Nadie fue eliminada.",
    continuingIn: "Continuando en unos segundos...",

    // Round summary
    gameOver: "¡Partida terminada!",
    roundCompleted: "completada",
    tasksThisRound: "Tareas completadas esta ronda",
    eliminatedPlayers: "Jugadoras eliminadas",
    seeResults: "Ver resultados",
    nextRound: "Siguiente ronda →",

    // Game result
    victory: "¡Victoria!",
    defeat: "Derrota",
    agentsCompletedTasks: "🕵️ Las Agentes completaron las tareas",
    saboteurSabotagedMission: "💣 ELSA-BOTEADOR saboteó la misión",
    freeBonus: "¡Bonus gratis!",
    watchVideoXp: "Ve un video y gana +15 XP extra",
    bonusClaimed: "+15 XP bonus reclamado",
    hideRoles: "Ocultar roles",
    whoWasWho: "¿Quién era quién?",
    saboteurRole: "💣 Saboteadora",
    agentRole: "🕵️ Agente",
    backToHome: "Volver al inicio",
    achievementUnlocked: "¡Logro desbloqueado!",
    bonusClaimedToast: "🎁 ¡Bonus reclamado!",
    bonusClaimedDesc: "+15 XP extra por ver el video",

    // Profile
    myProfile: "Mi Perfil",
    editAvatar: "Editar Avatar",
    stats: "Estadísticas",
    games: "Partidas",
    victories: "Victorias",
    winRate: "Win Rate",
    winRateLabel: "Tasa de victorias",
    losses: "Derrotas",
    currentStreak: "Racha actual",
    achievements: "Logros",

    // Settings
    settingsTitle: "Ajustes",
    languageSection: "Idioma",
    accessibility: "Accesibilidad",
    highContrast: "Alto contraste",
    highContrastDesc: "Mejora la visibilidad de los elementos",
    largeText: "Texto grande",
    largeTextDesc: "Aumenta el tamaño del texto",
    handPreference: "Preferencia de mano",
    rightHand: "🤚 Diestra",
    rightHandDesc: "Controles a la derecha",
    leftHand: "🖐️ Zurda",
    leftHandDesc: "Controles a la izquierda",
    sound: "Sonido",
    soundEffects: "Efectos de sonido",
    privacy: "Privacidad",
    privateProfile: "Perfil privado",
    privateProfileDesc: "Solo tus amigas verán tu perfil",
    friendRequests: "Solicitudes de amistad",
    friendRequestsDesc: "Permite que te envíen solicitudes",

    // Inventory
    inventoryTitle: "Inventario",
    hairCategory: "Pelo",
    clothesCategory: "Ropa",
    accsCategory: "Accs",
    stickersCategory: "Stickers",
    saveChanges: "Guardar cambios",

    // Inventory items
    "item-straight": "Liso",
    "item-curly": "Rizado",
    "item-redhead": "Pelirroja",
    "item-platinum": "Platino",
    "item-classic": "Clásico",
    "item-black": "Negro",
    "item-brown": "Castaño",
    "item-orange": "Naranja",
    "item-blonde": "Rubio",
    "item-pink": "Rosa",
    "item-tshirt": "Camiseta",
    "item-dress": "Vestido",
    "item-coat": "Abrigo",
    "item-blouse": "Blusa",
    "item-sporty": "Deportiva",
    "item-bow": "Lazo",
    "item-glasses": "Gafas",
    "item-backpack": "Mochila",
    "item-ring": "Anillo",
    "item-cap": "Gorra",
    "item-star": "Estrella",
    "item-rainbow": "Arcoíris",
    "item-butterfly": "Mariposa",
    "item-fire": "Fuego",
    "item-diamond": "Diamante",
    "item-crown": "Corona",

    // How to play
    howToPlayTitle: "¿Cómo se juega?",
    gameModes: "Modos de juego",

    // Weekly challenges
    weeklyChallenges: "Retos semanales",
    challengeCompleted: "¡Reto completado!",

    // Report
    reportPlayer: "Reportar jugadora",
    reportingPlayer: "Reportando a",
    selectReason: "Selecciona el motivo:",
    falseReportsWarning: "Los reportes falsos pueden resultar en sanciones para tu cuenta. Solo reporta comportamiento real.",
    sendReport: "Enviar reporte",
    playerSuspended: "Jugadora suspendida",
    reportReceived: "Reporte recibido",
    playerSuspendedDesc: "ha sido suspendida por 24 horas debido a múltiples reportes.",
    reportReceivedDesc: "Gracias por ayudar a mantener el campus seguro. Revisaremos tu reporte.",
    understood: "Entendido",
    reportSentToast: "🛡️ Reporte enviado",

    // Report reasons
    "reason-toxic-chat": "Chat tóxico",
    "reason-cheating": "Trampa / Exploit",
    "reason-inappropriate-name": "Nombre inapropiado",
    "reason-harassment": "Acoso",
    "reason-spam": "Spam",
    "reason-other": "Otro motivo",

    // Tutorial
    tutorialAgentStep1Title: "¡Bienvenida a la partida!",
    tutorialAgentStep1Desc: "Este tutorial te guiará por las mecánicas del juego paso a paso. Puedes cerrarlo en cualquier momento.",
    tutorialAgentStep2Title: "Panel superior (HUD)",
    tutorialAgentStep2Desc: "Arriba verás la ronda actual, tu rol, el tiempo restante y la barra de progreso de tareas.",
    tutorialAgentStep3Title: "Mapa de zonas",
    tutorialAgentStep3Desc: "El campus tiene 6 zonas. Toca una zona libre para moverte y empezar un minijuego.",
    tutorialAgentStep4Title: "Minijuegos de tareas",
    tutorialAgentStep4Desc: "Completa secuencias, operaciones matemáticas o pruebas de memoria para avanzar la barra de progreso global.",
    tutorialAgentStep5Title: "Zonas saboteadas",
    tutorialAgentStep5Desc: "Si una zona está bloqueada (borde rojo), no podrás hacer tareas ahí hasta que se desbloquee automáticamente.",
    tutorialAgentStep6Title: "Botón de emergencia",
    tutorialAgentStep6Desc: "Abajo puedes convocar una reunión de emergencia para discutir y votar a quién eliminar. ¡Tiene cooldown de 30s!",
    tutorialAgentStep7Title: "Reuniones y votación",
    tutorialAgentStep7Desc: "En las reuniones, debatid quién podría ser la ELSA-BOTEADORA y votad para eliminarla. Podéis saltar el voto.",
    tutorialAgentStep8Title: "¡A ganar!",
    tutorialAgentStep8Desc: "Completad al menos el 60% de las tareas en 3 rondas para ganar. ¡Buena suerte, agente!",

    tutorialSaboteurStep1Title: "¡Bienvenida, ELSA-BOTEADORA!",
    tutorialSaboteurStep1Desc: "Tu misión secreta es sabotear sin que te descubran. Este tutorial te enseñará cómo.",
    tutorialSaboteurStep2Title: "Panel superior (HUD)",
    tutorialSaboteurStep2Desc: "Arriba verás la ronda, el tiempo y el progreso de tareas. ¡Quieres que esa barra avance lo menos posible!",
    tutorialSaboteurStep3Title: "Panel de sabotaje",
    tutorialSaboteurStep3Desc: "Debajo del mapa tienes botones para bloquear zonas. Cada sabotaje bloquea una zona por 15 segundos.",
    tutorialSaboteurStep4Title: "Cooldown de sabotaje",
    tutorialSaboteurStep4Desc: "Después de sabotear, espera 30 segundos antes de volver a hacerlo. ¡Elige bien el momento!",
    tutorialSaboteurStep5Title: "Actúa normal",
    tutorialSaboteurStep5Desc: "En las reuniones, defiéndete y desvía sospechas. Si te eliminan, pasarás a modo fantasma.",
    tutorialSaboteurStep6Title: "Tu victoria",
    tutorialSaboteurStep6Desc: "Ganas si las agentes no completan el 60% de las tareas en 3 rondas. ¡Sabotea estratégicamente!",

    tutorialBack: "Atrás",
    tutorialNext: "Siguiente",
    tutorialGotIt: "¡Entendido!",

    // How to play sections
    htpObjectiveTitle: "Objetivo",
    htpObjectiveContent: "Cada partida tiene Agentes y una (o dos) Saboteadoras. Las Agentes deben completar todas las tareas o descubrir a la Saboteadora. La Saboteadora debe sabotear sin ser descubierta.",
    htpRolesTitle: "Roles",
    htpRolesContent: "Al inicio se te asigna un rol secreto: Agente 🕵️ o ELSA-BOTEADOR 💣. Con 5 o menos jugadoras hay 1 Saboteadora; con 6-8, hay 2.",
    htpRoundsTitle: "Rondas de acción",
    htpRoundsContent: "La partida tiene 3 rondas de 90 segundos. Muévete entre 6 zonas del campus (Biblioteca, Cafetería, Auditorio, Laboratorio, Gimnasio y Jardín). Las Agentes completan minijuegos para avanzar la barra de progreso global.",
    htpSabotageTitle: "Sabotaje",
    htpSabotageContent: "La Saboteadora puede bloquear zonas por 15 segundos (cooldown de 30s), impidiendo que las Agentes hagan tareas ahí. ¡Actúa con disimulo!",
    htpMeetingsTitle: "Reuniones",
    htpMeetingsContent: "Entre rondas o al pulsar el botón de emergencia 🚨 (cooldown 30s) se convoca una reunión. Tienes 30 segundos para discutir y 15 para votar. Puedes ver en qué zona estaba cada jugadora.",
    htpVotingTitle: "Votación",
    htpVotingContent: "Vota por quién crees que es la Saboteadora o salta el voto. Se necesita mayoría (≥2 votos) para expulsar. Al expulsar, se revela su rol.",
    htpGhostTitle: "Modo fantasma",
    htpGhostContent: "Las jugadoras eliminadas pasan a modo fantasma: pueden seguir haciendo tareas para ayudar al equipo, pero no pueden chatear ni votar.",
    htpVictoryTitle: "Victoria",
    htpVictoryContent: "Las Agentes ganan completando todas las tareas o expulsando a todas las Saboteadoras. La Saboteadora gana si queda en igualdad numérica con las Agentes vivas.",
    htpPlayFriendsTitle: "Jugar con Amigas",
    htpPlayFriendsDesc: "Crea una sala privada con un código de 6 caracteres y compártelo. Tú eres la host y decides cuándo empezar.",
    htpQuickPlayTitle: "Partida Rápida",
    htpQuickPlayDesc: "Elige tu idioma (ES/EN) y el sistema te empareja automáticamente con otras jugadoras. Cuando se llenan 5, ¡empieza la partida!",
    htpTip: "💡 Consejo: Observa quién se mueve mucho entre zonas sin completar tareas. ¡Podría ser la Saboteadora!",

    // Achievements
    "ach-first-game": "Primera misión",
    "ach-first-game-desc": "Juega tu primera partida",
    "ach-5-games": "Investigadora",
    "ach-5-games-desc": "Juega 5 partidas",
    "ach-first-win": "¡Victoria!",
    "ach-first-win-desc": "Gana tu primera partida",
    "ach-5-wins": "Defensora",
    "ach-5-wins-desc": "Gana 5 partidas",
    "ach-10-wins": "Diamante",
    "ach-10-wins-desc": "Gana 10 partidas",
    "ach-level-3": "En racha",
    "ach-level-3-desc": "Alcanza el nivel 3",
    "ach-level-5": "Veterana",
    "ach-level-5-desc": "Alcanza el nivel 5",
    "ach-20-games": "Adicta al campus",
    "ach-20-games-desc": "Juega 20 partidas",
    "ach-25-wins": "Reina agente",
    "ach-25-wins-desc": "Gana 25 partidas",
    "ach-level-8": "Leyenda",
    "ach-level-8-desc": "Alcanza el nivel 8",

    // Challenges
    "challenge-wk-play3": "Jugadora activa",
    "challenge-wk-play3-desc": "Juega 3 partidas esta semana",
    "challenge-wk-win2": "Racha ganadora",
    "challenge-wk-win2-desc": "Gana 2 partidas esta semana",
    "challenge-wk-play5": "Sin parar",
    "challenge-wk-play5-desc": "Juega 5 partidas esta semana",

    // Chat presets
    "chat-saw-player": "Vi a {player} en {zone}",
    "chat-i-was-in": "Yo estaba en {zone}",
    "chat-i-think": "Creo que es {player}",
    "chat-acted-weird": "{player} actuó raro",
    "chat-not-me": "No fui yo",
    "chat-trust-me": "Confíen en mí",
    "chat-skip-vote": "Saltemos el voto",
    "chat-where-were-you": "¿Dónde estabas?",
  },
  en: {
    // Common
    back: "← Back",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    send: "Send",
    close: "Close",
    or: "or",
    level: "Level",
    you: "You",

    // Splash
    splashLoading: "Preparing the campus...",

    // Login
    welcome: "Welcome!",
    welcomeSubtitle: "Enter the campus and find out who is ELSA-BOTEADOR",
    continueWithGoogle: "Continue with Google",
    emailAndPassword: "Email & Password",
    noAccount: "Don't have an account?",
    register: "Sign up",
    login: "Log In",
    createAccount: "Create Account",
    campusAwaits: "The campus awaits!",
    joinTheFun: "Join the fun",
    yourName: "Your name",
    email: "Email",
    password: "Password",
    enter: "Log in",
    createAccountBtn: "Create account",
    haveAccount: "Already have an account?",
    signIn: "Sign in",

    // Age gate
    ageVerification: "Age Verification",
    ageVerificationDesc: "We need to confirm you're at least 14 years old to play 🎂",
    ageBlocked: "Oops! You can't enter yet",
    ageBlockedDesc: "ELSA-BOTEADOR is for ages 14 and up. Come back when you're a little older! 💜",

    // Create profile
    createProfile: "Create your profile",
    createProfileDesc: "Choose how others will see you on campus ✨",
    name: "Name",
    namePlaceholder: "Your campus name",
    characters: "characters",
    skinLabel: "Skin",
    hairLabel: "Hair",
    hairColorLabel: "Hair color",
    clothesLabel: "Clothes",
    accessoryLabel: "Accessory",
    language: "Language",
    letsGo: "Let's go! 🎉",

    // Home
    helloAgain: "Welcome back!",
    playWithFriends: "Play with Friends",
    createOrJoinPrivate: "Create or join a private room",
    quickPlay: "Quick Play",
    findPlayersInstantly: "Find players instantly",
    howToPlay: "How to play?",
    profile: "Profile",
    inventory: "Inventory",
    friends: "Friends",
    settings: "Settings",

    // Play friends
    createRoom: "Create Room",
    createRoomDesc: "Generate a code for your friends",
    joinRoom: "Join Room",
    joinRoomDesc: "Enter your friend's code",

    // Create room
    yourPrivateRoom: "Your Private Room",
    shareCode: "Share this code with your friends",
    copied: "Copied!",
    copyCode: "Copy code",
    players: "Players",
    waitingPlayers: "Waiting for players... 🎀",
    goToLobby: "Go to Lobby →",

    // Join room
    enterFriendCode: "Enter the code your friend shared with you",
    joinRoomBtn: "Join room",

    // Quick play
    quickPlayTitle: "Quick Play",
    quickPlayDesc: "Find players instantly. Choose your language to match with people who speak the same.",
    matchLanguage: "Match language",
    searchMatch: "Find match",
    searchingMatch: "Searching for match...",
    playersFound: "players found",

    // Friends
    friendsTitle: "Friends",
    myCode: "My code:",
    friendsTab: "Friends",
    pendingTab: "Pending",
    addFriendByCode: "Add friend by code",
    enterFriendCodePlaceholder: "Enter your friend's code",
    noPendingRequests: "No pending requests",
    addFriendsWithCode: "Add friends with their code",
    pendingRequest: "Pending request",
    online: "Online 🟢",
    offline: "Offline",

    // Lobby
    lobby: "Lobby",
    roomLabel: "Room",
    friendsMode: "Friends",
    quickMode: "Quick",
    ready: "ready",
    chat: "Chat 💬",
    writeMessage: "Write a message...",
    usePresetsOrEmojis: "Use presets or emojis to chat 👆",
    imReady: "I'm ready",
    readyCheck: "✅ Ready",
    start: "🚀 Start",
    chooseRole: "Choose your role (testing only)",

    // Role reveal
    agent: "Agent",
    saboteur: "ELSA-BOTEADOR",
    agentMission: "Complete tasks and find ELSA-BOTEADOR",
    saboteurMission: "Sabotage tasks without getting caught",
    discoveringRole: "Discovering your role...",
    youAre: "You are",
    enteringMatch: "Entering the match...",

    // Game HUD
    round: "Round",
    agentBadge: "🕵️ Agent",
    saboteurBadge: "💣 ELSA-BOTEADOR",

    // Zone map
    mainBuilding: "Main Building",
    sabotaged: "Sabotaged!",
    zoneLibrary: "Library",
    zoneCafeteria: "Cafeteria",
    zoneAuditorium: "Auditorium",
    zoneLab: "Laboratory",
    zoneGym: "Gym",
    zoneGarden: "Garden",

    // Sabotage panel
    chooseSabotageZone: "Choose zone to sabotage",
    cooldownLabel: "Cooldown",
    sabotageZone: "💣 Sabotage zone",

    // Task mini-game
    taskLabel: "Task",
    memorizeSequence: "Memorize the sequence!",
    repeatSequence: "Repeat the sequence!",
    step: "Step",
    of: "of",
    solveQuickly: "Solve quickly!",
    findPairs: "Find the pairs!",
    taskCompleted: "Task completed!",
    taskFailed: "Failed!",

    // Emergency button
    emergency: "🚨 Emergency!",
    emergencyCooldown: "Emergency",

    // Meeting
    emergencyMeeting: "Emergency Meeting",
    discussSaboteur: "Discuss who could be ELSA-BOTEADOR",
    voteNow: "Vote now!",
    voteResult: "Vote result",
    discussion: "Discussion",
    voting: "Voting",
    discussionStarted: "The discussion has started...",
    discussionTimer: "Discussion",
    whoIsSaboteur: "Who is ELSA-BOTEADOR?",
    skipVote: "Skip vote",
    ghostObserver: "👻 You're a ghost. You can only observe.",
    ghostCantVote: "👻 You can't vote as a ghost.",
    wasEliminated: "was eliminated",
    wasSaboteur: "💣 Was ELSA-BOTEADOR!",
    wasAgent: "🕵️ Was an innocent Agent...",
    greatWork: "Great work, team!",
    eliminatedAlly: "You eliminated an ally...",
    noConsensus: "No consensus",
    noConsensusDesc: "Not enough votes. Nobody was eliminated.",
    continuingIn: "Continuing in a few seconds...",

    // Round summary
    gameOver: "Game over!",
    roundCompleted: "completed",
    tasksThisRound: "Tasks completed this round",
    eliminatedPlayers: "Eliminated players",
    seeResults: "See results",
    nextRound: "Next round →",

    // Game result
    victory: "Victory!",
    defeat: "Defeat",
    agentsCompletedTasks: "🕵️ Agents completed the tasks",
    saboteurSabotagedMission: "💣 ELSA-BOTEADOR sabotaged the mission",
    freeBonus: "Free bonus!",
    watchVideoXp: "Watch a video and earn +15 XP",
    bonusClaimed: "+15 XP bonus claimed",
    hideRoles: "Hide roles",
    whoWasWho: "Who was who?",
    saboteurRole: "💣 Saboteur",
    agentRole: "🕵️ Agent",
    backToHome: "Back to home",
    achievementUnlocked: "Achievement unlocked!",
    bonusClaimedToast: "🎁 Bonus claimed!",
    bonusClaimedDesc: "+15 extra XP from watching the video",

    // Profile
    myProfile: "My Profile",
    editAvatar: "Edit Avatar",
    stats: "Statistics",
    games: "Games",
    victories: "Victories",
    winRate: "Win Rate",
    winRateLabel: "Win rate",
    losses: "Losses",
    currentStreak: "Current streak",
    achievements: "Achievements",

    // Settings
    settingsTitle: "Settings",
    languageSection: "Language",
    accessibility: "Accessibility",
    highContrast: "High contrast",
    highContrastDesc: "Improves element visibility",
    largeText: "Large text",
    largeTextDesc: "Increases text size",
    handPreference: "Hand preference",
    rightHand: "🤚 Right-handed",
    rightHandDesc: "Controls on the right",
    leftHand: "🖐️ Left-handed",
    leftHandDesc: "Controls on the left",
    sound: "Sound",
    soundEffects: "Sound effects",
    privacy: "Privacy",
    privateProfile: "Private profile",
    privateProfileDesc: "Only your friends can see your profile",
    friendRequests: "Friend requests",
    friendRequestsDesc: "Allow people to send you requests",

    // Inventory
    inventoryTitle: "Inventory",
    hairCategory: "Hair",
    clothesCategory: "Clothes",
    accsCategory: "Accs",
    stickersCategory: "Stickers",
    saveChanges: "Save changes",

    // Inventory items
    "item-straight": "Straight",
    "item-curly": "Curly",
    "item-redhead": "Redhead",
    "item-platinum": "Platinum",
    "item-classic": "Classic",
    "item-black": "Black",
    "item-brown": "Brown",
    "item-orange": "Orange",
    "item-blonde": "Blonde",
    "item-pink": "Pink",
    "item-tshirt": "T-shirt",
    "item-dress": "Dress",
    "item-coat": "Coat",
    "item-blouse": "Blouse",
    "item-sporty": "Sporty",
    "item-bow": "Bow",
    "item-glasses": "Glasses",
    "item-backpack": "Backpack",
    "item-ring": "Ring",
    "item-cap": "Cap",
    "item-star": "Star",
    "item-rainbow": "Rainbow",
    "item-butterfly": "Butterfly",
    "item-fire": "Fire",
    "item-diamond": "Diamond",
    "item-crown": "Crown",

    // How to play
    howToPlayTitle: "How to play?",
    gameModes: "Game modes",

    // Weekly challenges
    weeklyChallenges: "Weekly challenges",
    challengeCompleted: "Challenge completed!",

    // Report
    reportPlayer: "Report player",
    reportingPlayer: "Reporting",
    selectReason: "Select the reason:",
    falseReportsWarning: "False reports may result in penalties for your account. Only report real behavior.",
    sendReport: "Send report",
    playerSuspended: "Player suspended",
    reportReceived: "Report received",
    playerSuspendedDesc: "has been suspended for 24 hours due to multiple reports.",
    reportReceivedDesc: "Thanks for helping keep the campus safe. We'll review your report.",
    understood: "Understood",
    reportSentToast: "🛡️ Report sent",

    // Report reasons
    "reason-toxic-chat": "Toxic chat",
    "reason-cheating": "Cheating / Exploit",
    "reason-inappropriate-name": "Inappropriate name",
    "reason-harassment": "Harassment",
    "reason-spam": "Spam",
    "reason-other": "Other reason",

    // Tutorial
    tutorialAgentStep1Title: "Welcome to the match!",
    tutorialAgentStep1Desc: "This tutorial will guide you through the game mechanics step by step. You can close it anytime.",
    tutorialAgentStep2Title: "Top panel (HUD)",
    tutorialAgentStep2Desc: "At the top you'll see the current round, your role, remaining time, and the task progress bar.",
    tutorialAgentStep3Title: "Zone map",
    tutorialAgentStep3Desc: "The campus has 6 zones. Tap a free zone to move there and start a mini-game.",
    tutorialAgentStep4Title: "Task mini-games",
    tutorialAgentStep4Desc: "Complete sequences, math problems, or memory tests to advance the global progress bar.",
    tutorialAgentStep5Title: "Sabotaged zones",
    tutorialAgentStep5Desc: "If a zone is blocked (red border), you can't do tasks there until it unlocks automatically.",
    tutorialAgentStep6Title: "Emergency button",
    tutorialAgentStep6Desc: "At the bottom you can call an emergency meeting to discuss and vote who to eliminate. 30s cooldown!",
    tutorialAgentStep7Title: "Meetings & voting",
    tutorialAgentStep7Desc: "In meetings, debate who could be the saboteur and vote to eliminate them. You can skip the vote.",
    tutorialAgentStep8Title: "Win the game!",
    tutorialAgentStep8Desc: "Complete at least 60% of tasks in 3 rounds to win. Good luck, agent!",

    tutorialSaboteurStep1Title: "Welcome, ELSA-BOTEADOR!",
    tutorialSaboteurStep1Desc: "Your secret mission is to sabotage without getting caught. This tutorial will show you how.",
    tutorialSaboteurStep2Title: "Top panel (HUD)",
    tutorialSaboteurStep2Desc: "At the top you'll see the round, time, and task progress. You want that bar to advance as little as possible!",
    tutorialSaboteurStep3Title: "Sabotage panel",
    tutorialSaboteurStep3Desc: "Below the map you have buttons to block zones. Each sabotage blocks a zone for 15 seconds.",
    tutorialSaboteurStep4Title: "Sabotage cooldown",
    tutorialSaboteurStep4Desc: "After sabotaging, wait 30 seconds before doing it again. Choose the right moment!",
    tutorialSaboteurStep5Title: "Act normal",
    tutorialSaboteurStep5Desc: "In meetings, defend yourself and deflect suspicion. If eliminated, you become a ghost.",
    tutorialSaboteurStep6Title: "Your victory",
    tutorialSaboteurStep6Desc: "You win if agents don't complete 60% of tasks in 3 rounds. Sabotage strategically!",

    tutorialBack: "Back",
    tutorialNext: "Next",
    tutorialGotIt: "Got it!",

    // How to play sections
    htpObjectiveTitle: "Objective",
    htpObjectiveContent: "Each match has Agents and one (or two) Saboteurs. Agents must complete all tasks or discover the Saboteur. The Saboteur must sabotage without being discovered.",
    htpRolesTitle: "Roles",
    htpRolesContent: "At the start you're assigned a secret role: Agent 🕵️ or ELSA-BOTEADOR 💣. With 5 or fewer players there's 1 Saboteur; with 6-8, there are 2.",
    htpRoundsTitle: "Action rounds",
    htpRoundsContent: "The match has 3 rounds of 90 seconds. Move between 6 campus zones (Library, Cafeteria, Auditorium, Laboratory, Gym, and Garden). Agents complete mini-games to advance the global progress bar.",
    htpSabotageTitle: "Sabotage",
    htpSabotageContent: "The Saboteur can block zones for 15 seconds (30s cooldown), preventing Agents from doing tasks there. Act stealthily!",
    htpMeetingsTitle: "Meetings",
    htpMeetingsContent: "Between rounds or when pressing the emergency button 🚨 (30s cooldown), a meeting is called. You have 30 seconds to discuss and 15 to vote. You can see which zone each player was in.",
    htpVotingTitle: "Voting",
    htpVotingContent: "Vote for who you think is the Saboteur or skip the vote. A majority (≥2 votes) is needed to expel. When expelled, their role is revealed.",
    htpGhostTitle: "Ghost mode",
    htpGhostContent: "Eliminated players become ghosts: they can still do tasks to help the team, but can't chat or vote.",
    htpVictoryTitle: "Victory",
    htpVictoryContent: "Agents win by completing all tasks or expelling all Saboteurs. The Saboteur wins if they reach numerical equality with living Agents.",
    htpPlayFriendsTitle: "Play with Friends",
    htpPlayFriendsDesc: "Create a private room with a 6-character code and share it. You're the host and decide when to start.",
    htpQuickPlayTitle: "Quick Play",
    htpQuickPlayDesc: "Choose your language (ES/EN) and the system matches you automatically with other players. When 5 join, the match starts!",
    htpTip: "💡 Tip: Watch who moves a lot between zones without completing tasks. They could be the Saboteur!",

    // Achievements
    "ach-first-game": "First mission",
    "ach-first-game-desc": "Play your first game",
    "ach-5-games": "Investigator",
    "ach-5-games-desc": "Play 5 games",
    "ach-first-win": "Victory!",
    "ach-first-win-desc": "Win your first game",
    "ach-5-wins": "Defender",
    "ach-5-wins-desc": "Win 5 games",
    "ach-10-wins": "Diamond",
    "ach-10-wins-desc": "Win 10 games",
    "ach-level-3": "On a roll",
    "ach-level-3-desc": "Reach level 3",
    "ach-level-5": "Veteran",
    "ach-level-5-desc": "Reach level 5",
    "ach-20-games": "Campus addict",
    "ach-20-games-desc": "Play 20 games",
    "ach-25-wins": "Agent queen",
    "ach-25-wins-desc": "Win 25 games",
    "ach-level-8": "Legend",
    "ach-level-8-desc": "Reach level 8",

    // Challenges
    "challenge-wk-play3": "Active player",
    "challenge-wk-play3-desc": "Play 3 games this week",
    "challenge-wk-win2": "Winning streak",
    "challenge-wk-win2-desc": "Win 2 games this week",
    "challenge-wk-play5": "Non-stop",
    "challenge-wk-play5-desc": "Play 5 games this week",

    // Chat presets
    "chat-saw-player": "I saw {player} in {zone}",
    "chat-i-was-in": "I was in {zone}",
    "chat-i-think": "I think it's {player}",
    "chat-acted-weird": "{player} acted weird",
    "chat-not-me": "It wasn't me",
    "chat-trust-me": "Trust me",
    "chat-skip-vote": "Let's skip the vote",
    "chat-where-were-you": "Where were you?",
  },
} as const;

export type TranslationKey = keyof typeof translations.es;

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text = (translations[language]?.[key] ?? translations.es[key] ?? key) as string;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return { t, language };
}

// Helper to get zone name translated
export function useZoneNames() {
  const { t } = useTranslation();
  return {
    library: t("zoneLibrary"),
    cafeteria: t("zoneCafeteria"),
    auditorium: t("zoneAuditorium"),
    lab: t("zoneLab"),
    gym: t("zoneGym"),
    garden: t("zoneGarden"),
  } as Record<string, string>;
}



# ELSA-BOTEADOR — Plan de Implementación

## Visión
Juego móvil de deducción social estilo "impostor" para chicas de 14+, ambientado en un campus universitario. Agentes vs Saboteadora en partidas rápidas de 3 rondas con 6 zonas.

---

## Fase 1: Fundación y Pantallas de Onboarding

### 1.1 Sistema de diseño "Campus"
- Paleta pastel/cartoony (rosa, lila, menta, amarillo suave)
- Tipografía redondeada y amigable
- Componentes base: botones grandes táctiles, cards, modals adaptados al estilo visual
- Layout mobile-first vertical en todas las pantallas

### 1.2 Splash Screen
- Logo animado de ELSA-BOTEADOR
- Pantalla de carga con barra de progreso estilizada

### 1.3 Login / Registro
- Pantalla con "Continuar con Google" y "Email y contraseña"
- Formulario de registro con verificación de correo
- Diseño limpio y colorido acorde al universo Campus

### 1.4 Age Gate (14+)
- Selector de año de nacimiento
- Pantalla de bloqueo si la edad es menor a 14
- Mensaje amigable explicando la restricción

### 1.5 Crear Perfil
- Input de nombre (con indicador de moderación)
- Selector de avatar 2D cartoony (pelo, piel, ropa básica)
- Selector de idioma (ES/EN)

---

## Fase 2: Home y Sistema Social

### 2.1 Pantalla Home
- CTA principal grande: "Jugar con Amigas"
- CTA secundario: "Partida Rápida"
- Accesos a: Perfil, Inventario, Ajustes
- Nivel y XP visibles

### 2.2 Flujo "Jugar con Amigas"
- Crear sala → mostrar código copiable
- Unirse a sala → input de código

### 2.3 Flujo "Partida Rápida"
- Selección de idioma para matchmaking
- Pantalla de búsqueda/espera con animación

### 2.4 Sistema de Amigos
- Agregar amiga por código único
- Lista de amigas (pendientes/aceptadas)
- Bloquear amiga

---

## Fase 3: Lobby y Pre-partida

### 3.1 Lobby
- Lista de jugadoras con avatar y nombre
- Configuración preset: tamaño de partida, idioma
- Chat de lobby (presets en quick, texto en friends)
- Botón "Empezar" visible solo para la host
- Indicadores de jugadoras listas

### 3.2 Revelación de Rol
- Pantalla dramática breve mostrando: Agente 🕵️ o Saboteadora 💣
- Icono + frase temática
- Transición animada a la partida

---

## Fase 4: Partida — Fase de Acción

### 4.1 Mapa de Zonas (Edificio Principal)
- Vista de las 6 zonas con iconografía clara
- Zona actual resaltada
- Botón "Cambiar de zona" con cooldown visual

### 4.2 HUD de Partida
- Timer de ronda
- Zona actual
- Barra de progreso global de tareas del equipo
- Indicador de ronda (1/3, 2/3, 3/3)

### 4.3 Sistema de Tareas (Agentes)
- Botón "Tarea" cuando hay tarea disponible en tu zona
- Mini-juegos simples (≤15 segundos): arrastrar, tocar secuencia, ordenar
- Feedback visual al completar

### 4.4 Sistema de Sabotaje (Saboteadora)
- Botón "Bromear" (solo si hay objetivo en tu zona)
- Cooldown visible entre bromas
- Animación de broma ejecutada

### 4.5 Estado Fantasma
- Jugadoras "eliminadas" pasan a modo fantasma
- Pueden hacer tareas fantasma (contribuyen al progreso)
- Sin acceso a chat ni votación
- Visual diferenciado (semitransparente)

---

## Fase 5: Reunión y Votación

### 5.1 Trigger de Reunión
- Botón "Reportar incidente" / "Emergencia"
- Transición animada a pantalla de reunión

### 5.2 Panel de Reunión
- Lista de jugadoras con estado (viva/fantasma)
- Última zona vista de cada jugadora
- Chat seguro:
  - Quick: presets predefinidos ("Vi a X en Y", "Yo estaba en…", "Creo que…") + emojis
  - Friends: texto libre con filtrado + emojis + botón reportar

### 5.3 Votación
- Seleccionar jugadora sospechosa o "Saltar voto"
- Timer de votación
- Resultados animados: quién fue expulsada (pasa a fantasma)

---

## Fase 6: Fin de Partida y Progresión

### 6.1 Pantalla de Resultados
- Ganador: Agentes o Saboteadora
- Reveal: "Quién era quién"
- Animación de celebración/derrota

### 6.2 Recompensas
- XP ganada
- Cosméticos desbloqueados
- Opción de rewarded video para bonus cosmético/XP (sin ventaja)

### 6.3 Inventario / Cosméticos
- Categorías: pelo, ropa, accesorios, stickers
- Equipar/desequipar items
- Preview en avatar

### 6.4 Progresión
- Sistema de niveles con XP
- Retos semanales simples
- Desbloqueos por hitos

---

## Fase 7: Seguridad y Ajustes

### 7.1 Sistema de Reportes
- Reportar jugadora desde chat o post-partida
- Selección de motivo
- Regla: 3 reportes en 24h → autoban 24h

### 7.2 Ajustes
- Idioma
- Accesibilidad: contraste, tamaño de texto
- Preferencia mano izquierda/derecha
- Privacidad básica

---

## Fase 8: Backend Supabase (cuando conectes tu proyecto)

- Configurar Auth (Google + Email/Password)
- Crear todas las tablas (profiles, rooms, room_players, matches, rounds, tasks, votes, chat, reports, sanctions, friendships)
- Configurar RLS según las reglas del documento
- Edge Functions para lógica autoritativa (asignar roles, validar acciones, cerrar fases)
- Supabase Realtime (Broadcast + Presence) para sincronización de partidas

---

## Notas Técnicas
- **Todo el frontend se construye primero con datos mock** para validar UX
- **Mobile-first vertical** en todo momento
- **Capacitor** se configurará para el build Android (AAB/APK) en fase posterior
- Los rewarded ads se integrarán cuando se defina la red publicitaria


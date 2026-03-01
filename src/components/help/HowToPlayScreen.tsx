import { motion } from "framer-motion";
import { ArrowLeft, Users, Zap, Target, MessageCircle, Vote, Trophy, Ghost, ShieldAlert } from "lucide-react";

type HowToPlayScreenProps = {
  onBack: () => void;
};

const SECTIONS = [
  {
    icon: Target,
    emoji: "🎯",
    title: "Objetivo",
    content:
      "Cada partida tiene Agentes y una (o dos) Saboteadoras. Las Agentes deben completar todas las tareas o descubrir a la Saboteadora. La Saboteadora debe sabotear sin ser descubierta.",
  },
  {
    icon: Users,
    emoji: "🕵️",
    title: "Roles",
    content:
      "Al inicio se te asigna un rol secreto: Agente 🕵️ o ELSA-BOTEADOR 💣. Con 5 o menos jugadoras hay 1 Saboteadora; con 6-8, hay 2.",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Rondas de acción",
    content:
      "La partida tiene 3 rondas de 90 segundos. Muévete entre 6 zonas del campus (Biblioteca, Cafetería, Auditorio, Laboratorio, Gimnasio y Jardín). Las Agentes completan minijuegos para avanzar la barra de progreso global.",
  },
  {
    icon: ShieldAlert,
    emoji: "💣",
    title: "Sabotaje",
    content:
      "La Saboteadora puede bloquear zonas por 15 segundos (cooldown de 30s), impidiendo que las Agentes hagan tareas ahí. ¡Actúa con disimulo!",
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "Reuniones",
    content:
      "Entre rondas o al pulsar el botón de emergencia 🚨 (cooldown 30s) se convoca una reunión. Tienes 30 segundos para discutir y 15 para votar. Puedes ver en qué zona estaba cada jugadora.",
  },
  {
    icon: Vote,
    emoji: "🗳️",
    title: "Votación",
    content:
      "Vota por quién crees que es la Saboteadora o salta el voto. Se necesita mayoría (≥2 votos) para expulsar. Al expulsar, se revela su rol.",
  },
  {
    icon: Ghost,
    emoji: "👻",
    title: "Modo fantasma",
    content:
      "Las jugadoras eliminadas pasan a modo fantasma: pueden seguir haciendo tareas para ayudar al equipo, pero no pueden chatear ni votar.",
  },
  {
    icon: Trophy,
    emoji: "🏆",
    title: "Victoria",
    content:
      "Las Agentes ganan completando todas las tareas o expulsando a todas las Saboteadoras. La Saboteadora gana si queda en igualdad numérica con las Agentes vivas.",
  },
];

const MODE_INFO = [
  {
    emoji: "👯",
    title: "Jugar con Amigas",
    desc: "Crea una sala privada con un código de 6 caracteres y compártelo. Tú eres la host y decides cuándo empezar.",
  },
  {
    emoji: "⚡",
    title: "Partida Rápida",
    desc: "Elige tu idioma (ES/EN) y el sistema te empareja automáticamente con otras jugadoras. Cuando se llenan 5, ¡empieza la partida!",
  },
];

const HowToPlayScreen = ({ onBack }: HowToPlayScreenProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pb-6 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            ¿Cómo se juega?
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 safe-bottom">
        {/* Game modes */}
        <div className="rounded-2xl bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-display text-base font-bold text-foreground">
            Modos de juego
          </h2>
          <div className="space-y-3">
            {MODE_INFO.map((mode) => (
              <div key={mode.title} className="flex gap-3">
                <span className="text-2xl">{mode.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {mode.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mechanics */}
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-card p-4 shadow-soft"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{section.emoji}</span>
              <h2 className="font-display text-sm font-bold text-foreground">
                {section.title}
              </h2>
            </div>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}

        {/* Tip */}
        <div className="rounded-2xl bg-muted p-4">
          <p className="font-body text-xs text-muted-foreground text-center leading-relaxed">
            💡 <strong>Consejo:</strong> Observa quién se mueve mucho entre zonas sin completar tareas. ¡Podría ser la Saboteadora!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayScreen;

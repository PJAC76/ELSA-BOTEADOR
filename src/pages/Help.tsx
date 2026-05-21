import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Gamepad2, ShieldCheck, Lock, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: "juego" | "privacidad" | "moderacion";
}

const faqs: FAQItem[] = [
  {
    category: "juego",
    question: "¿Qué es ELSA-BOTEADOR?",
    answer: "ELSA-BOTEADOR es un juego de deducción social para chicas donde unas jugadoras completan tareas en equipo mientras una saboteadora intenta arruinar la misión sin ser descubierta. Las partidas duran entre 5 y 10 minutos."
  },
  {
    category: "juego",
    question: "¿A partir de qué edad se puede jugar?",
    answer: "El juego está diseñado para jugadoras de 13 años en adelante. No contiene violencia: la saboteadora actúa en modo fantasma, saboteando tareas sin eliminaciones."
  },
  {
    category: "juego",
    question: "¿Necesito descargar algo para jugar?",
    answer: "No. ELSA-BOTEADOR funciona directamente en tu navegador web. También está disponible para Android. Solo necesitas una conexión a internet."
  },
  {
    category: "juego",
    question: "¿Puedo jugar sola o necesito amigas?",
    answer: "Puedes jugar en cualquier momento gracias a los bots inteligentes que rellenan las salas. También puedes invitar amigas reales a partidas privadas."
  },
  {
    category: "juego",
    question: "¿Cómo se gana XP y se sube de nivel?",
    answer: "Ganas XP completando tareas, ganando partidas, manteniendo rachas diarias y participando en ligas semanales. Con el XP desbloqueas cosméticos para tu avatar."
  },
  {
    category: "privacidad",
    question: "¿Qué datos personales recopilan?",
    answer: "Solo recopilamos lo estrictamente necesario: un nombre de usuario, correo electrónico para la cuenta y estadísticas de juego anónimas. Nunca vendemos ni compartimos tus datos con terceros."
  },
  {
    category: "privacidad",
    question: "¿Cómo protegen la privacidad de menores?",
    answer: "El juego es para mayores de 13 años. Los perfiles no muestran información personal real, los chats están moderados automáticamente y no hay sistema de voz ni compartir fotos."
  },
  {
    category: "privacidad",
    question: "¿Puedo eliminar mi cuenta y datos?",
    answer: "Sí. Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados desde la configuración de perfil o contactándonos directamente."
  },
  {
    category: "moderacion",
    question: "¿Cómo funciona el sistema de moderación?",
    answer: "Contamos con filtros automáticos de chat, un botón de reporte en cada mensaje, y un equipo de moderadores que revisa las denuncias. Los comportamientos tóxicos resultan en suspensiones temporales o permanentes."
  },
  {
    category: "moderacion",
    question: "¿Qué pasa si alguien me acosa en el juego?",
    answer: "Reporta el comportamiento con el botón de reporte. El equipo de moderación revisará la denuncia en menos de 24 horas. También puedes bloquear jugadoras para no cruzarte con ellas en futuras partidas."
  },
  {
    category: "moderacion",
    question: "¿Qué conductas están prohibidas?",
    answer: "Está prohibido el acoso, bullying, lenguaje ofensivo, suplantación de identidad, uso de exploits o trampas, y cualquier comportamiento que haga el juego incómodo para otros. Ver los Términos del Servicio para el detalle completo."
  },
  {
    category: "moderacion",
    question: "¿Cómo reporto una jugadora?",
    answer: "Durante una partida o en el chat, toca el nombre de la jugadora y selecciona Reportar. Describe lo ocurrido y nuestro equipo lo revisará."
  }
];

const categories = {
  juego: { label: "Sobre el juego", icon: Gamepad2, color: "text-[#9b72cf]" },
  privacidad: { label: "Privacidad", icon: Lock, color: "text-[#7d9b76]" },
  moderacion: { label: "Moderación", icon: ShieldCheck, color: "text-[#c45c7c]" },
} as const;

function FAQSection({ category }: { category: keyof typeof categories }) {
  const items = faqs.filter((f) => f.category === category);
  const cat = categories[category];
  const Icon = cat.icon;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`w-7 h-7 ${cat.color}`} />
        <h2 className="text-2xl font-bold text-[#2d2a26]">{cat.label}</h2>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <FAQAccordion key={`${category}-${i}`} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}

function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#e8c5d0]/40 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-[#2d2a26]">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#8b7355] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-[#4a4a4a] leading-relaxed border-t border-[#e8c5d0]/20 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#fef7f0] text-[#2d2a26]">
      <Helmet>
        <title>Ayuda — ELSA-BOTEADOR | Preguntas Frecuentes</title>
        <meta name="description" content="Respuestas a las preguntas más frecuentes sobre ELSA-BOTEADOR: cómo jugar, privacidad, moderación y seguridad." />
        <link rel="canonical" href="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/help" />
        <meta property="og:title" content="Ayuda — ELSA-BOTEADOR | Preguntas Frecuentes" />
        <meta property="og:description" content="Respuestas a las preguntas más frecuentes sobre ELSA-BOTEADOR." />
        <meta property="og:url" content="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/help" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <header className="bg-[#f8e8ee] border-b border-[#e8c5d0] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight text-[#c45c7c]">
            ELSA-BOTEADOR
          </Link>
          <Button variant="outline" size="sm" asChild className="border-[#c45c7c] text-[#c45c7c] hover:bg-[#f8e8ee]">
            <Link to="/">Volver al juego</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-[#c45c7c]" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#c45c7c]">
              Preguntas Frecuentes
            </h1>
          </div>
          <p className="text-lg text-[#4a4a4a] leading-relaxed">
            Todo lo que necesitas saber sobre ELSA-BOTEADOR: cómo jugar, qué hacemos con tus datos,
            y cómo mantenemos la comunidad segura.
          </p>
        </section>

        <FAQSection category="juego" />
        <FAQSection category="privacidad" />
        <FAQSection category="moderacion" />

        <section className="bg-[#f8e8ee] rounded-2xl p-8 text-center mt-16">
          <h2 className="text-xl font-bold text-[#2d2a26] mb-3">¿No encontraste lo que buscabas?</h2>
          <p className="text-[#4a4a4a] mb-6">
            Consulta nuestras páginas de <Link to="/privacy" className="text-[#c45c7c] underline">Privacidad</Link> y{" "}
            <Link to="/terms" className="text-[#c45c7c] underline">Términos del Servicio</Link> para más detalle.
          </p>
          <Button size="lg" asChild className="bg-[#c45c7c] hover:bg-[#a64d6a] text-white rounded-full px-8">
            <Link to="/">Volver al juego</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-[#e8c5d0]/40 mt-12 py-8 text-center text-sm text-[#8b7355]">
        <p>ELSA-BOTEADOR {new Date().getFullYear()} — Juego de deducción social</p>
      </footer>
    </div>
  );
}

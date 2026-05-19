import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Ghost, Sparkles, Heart, Users, Gamepad2, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#fef7f0] text-[#2d2a26]">
      <Helmet>
        <title>Sobre ELSA-BOTEADOR — Juego de deducción social</title>
        <meta name="description" content="Descubre qué es ELSA-BOTEADOR: un juego de deducción social para chicas donde completas tareas, das pistas y descubres a la saboteadora del campus." />
        <link rel="canonical" href="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/about" />
        <meta property="og:title" content="Sobre ELSA-BOTEADOR — Juego de deducción social" />
        <meta property="og:description" content="Un juego de deducción social para chicas: completa tareas, da pistas y descubre a la saboteadora del campus." />
        <meta property="og:url" content="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/about" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "Sobre ELSA-BOTEADOR",
            "description": "Página de información sobre el juego de deducción social ELSA-BOTEADOR.",
            "url": "https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/about",
            "mainEntity": {
              "@type": "VideoGame",
              "name": "ELSA-BOTEADOR",
              "description": "Juego de deducción social para chicas donde completas tareas, das pistas y descubres a la saboteadora del campus.",
              "genre": ["Party Game", "Social Deduction"],
              "gamePlatform": ["Web Browser", "Android"],
              "applicationCategory": "Game",
              "operatingSystem": ["Web", "Android"],
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "contentRating": "ESRB Everyone 10+"
            }
          })}
        </script>
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
        <section className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#c45c7c] mb-6">
            ¿Qué es ELSA-BOTEADOR?
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-[#4a4a4a]">
            ELSA-BOTEADOR es un juego de <strong>deducción social</strong> pensado para grupos de amigas.
            Entra en el campus, completa tareas en equipo, descubre pistas sobre una palabra secreta…
            pero cuidado: una de vosotras es la <strong>saboteadora</strong> y hará todo lo posible por
            arruinar la misión sin ser descubierta.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8c5d0]/40">
            <Users className="w-10 h-10 text-[#9b72cf] mb-4" />
            <h2 className="text-xl font-bold text-[#2d2a26] mb-2">Multijugador en tiempo real</h2>
            <p className="text-[#4a4a4a]">
              Juega con amigas de verdad o con bots inteligentes. Salas privadas, partidas rápidas
              y sistema de amistad para siempre tener con quién jugar.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8c5d0]/40">
            <Ghost className="w-10 h-10 text-[#c45c7c] mb-4" />
            <h2 className="text-xl font-bold text-[#2d2a26] mb-2">Sin violencia, pura diversión</h2>
            <p className="text-[#4a4a4a]">
              La saboteadora actúa en modo "fantasma": sabotea tareas y despista con pistas falsas.
              Nada de eliminaciones violentas. Ideal para jugadoras de 13+ años.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8c5d0]/40">
            <Sparkles className="w-10 h-10 text-[#e88aab] mb-4" />
            <h2 className="text-xl font-bold text-[#2d2a26] mb-2">Progresión y recompensas</h2>
            <p className="text-[#4a4a4a]">
              Gana XP, sube de nivel, desbloquea cosméticos para tu avatar y compite en ligas semanales
              con tu squad de mejores amigas.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8c5d0]/40">
            <Gamepad2 className="w-10 h-10 text-[#67e8f9] mb-4" />
            <h2 className="text-xl font-bold text-[#2d2a26] mb-2">Minijuegos variados</h2>
            <p className="text-[#4a4a4a]">
              Cada partida incluye minijuegos de palabras, conexiones lógicas y adivinanzas que
              se adaptan a tu nivel para que nunca se repitan.
            </p>
          </div>
        </section>

        <section className="bg-[#f8e8ee] rounded-2xl p-8 mb-16">
          <div className="flex items-start gap-4">
            <Heart className="w-8 h-8 text-[#c45c7c] shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-3">Diseñado para amigas</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                El juego nació con una idea simple: crear un espacio divertido, seguro y acogedor
                donde las chicas puedan juntarse, reírse y poner a prueba su capacidad de deducción.
                Con controles simples, partidas de 5-10 minutos y un estético visual pastel,
                ELSA-BOTEADOR es perfecto para una tarde con amigas o una pausa entre clases.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-[#7d9b76] shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-3">Seguridad y moderación</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Contamos con filtros automáticos de chat, sistema de reportes con revisión humana,
                y moderadores que garantizan que la comunidad siga siendo un lugar respetuoso.
                Tu privacidad es importante: los datos personales nunca se comparten con terceros.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Button size="lg" asChild className="bg-[#c45c7c] hover:bg-[#a64d6a] text-white rounded-full px-8">
            <Link to="/">Jugar ahora</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-[#e8c5d0]/40 mt-12 py-8 text-center text-sm text-[#8b7355]">
        <p>ELSA-BOTEADOR {new Date().getFullYear()} — Juego de deducción social</p>
      </footer>
    </div>
  );
}

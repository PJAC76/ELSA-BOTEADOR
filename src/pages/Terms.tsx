import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileCheck, UserCheck, Ban, Gavel, RotateCcw, AlertTriangle, MessageCircle } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#fef7f0] text-[#2d2a26]">
      <Helmet>
        <title>Términos del Servicio — ELSA-BOTEADOR</title>
        <meta name="description" content="Términos y condiciones de uso de ELSA-BOTEADOR. Reglas de conducta, requisitos de edad, propiedad intelectual y política de cuentas." />
        <link rel="canonical" href="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/terms" />
        <meta property="og:title" content="Términos del Servicio — ELSA-BOTEADOR" />
        <meta property="og:description" content="Reglas de conducta, requisitos de edad y condiciones de uso de ELSA-BOTEADOR." />
        <meta property="og:url" content="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/terms" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Términos del Servicio",
            "description": "Términos y condiciones de uso de ELSA-BOTEADOR.",
            "url": "https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/terms",
            "isPartOf": {
              "@type": "WebSite",
              "name": "ELSA-BOTEADOR",
              "url": "https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app"
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
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#c45c7c] mb-4">
            Términos del Servicio
          </h1>
          <p className="text-[#8b7355]">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <FileCheck className="w-8 h-8 text-[#7d9b76] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">1. Aceptación de los términos</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Al crear una cuenta, acceder o usar ELSA-BOTEADOR, aceptas estos Términos del Servicio 
                y nuestra <Link to="/privacy" className="text-[#c45c7c] underline hover:text-[#a64d6a]">Política de Privacidad</Link>. 
                Si no estás de acuerdo, no debes utilizar el servicio. Nos reservamos el derecho de 
                actualizar estos términos; te notificaremos de cambios importantes mediante aviso en 
                la aplicación o correo electrónico.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <UserCheck className="w-8 h-8 text-[#9b72cf] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">2. Requisitos de edad y cuenta</h2>
              <p className="text-[#4a4a4a] leading-relaxed mb-3">
                Para usar ELSA-BOTEADOR debes tener al menos <strong>13 años de edad</strong>. Al registrarte, 
                confirmas que cumples este requisito. Si tienes entre 13 y 16 años, te recomendamos que 
                revises estos términos con un padre o tutor.
              </p>
              <p className="text-[#4a4a4a] leading-relaxed">
                Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades 
                que ocurran bajo tu cuenta. No compartas tu cuenta con terceros. Notifícanos inmediatamente 
                si sospechas de acceso no autorizado.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-[#e88aab] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">3. Conducta del usuario</h2>
              <p className="text-[#4a4a4a] leading-relaxed mb-3">
                ELSA-BOTEADOR es un espacio seguro y acogedor. Está estrictamente prohibido:
              </p>
              <ul className="list-disc list-inside text-[#4a4a4a] leading-relaxed space-y-1">
                <li>Acosar, intimidar, amenazar o discriminar a otras jugadoras por cualquier motivo.</li>
                <li>Usar lenguaje ofensivo, obsceno o discriminatorio en el chat o nombres de usuario.</li>
                <li>Compartir información personal de terceros sin su consentimiento (doxing).</li>
                <li>Usar trampas, exploits, bots no autorizados o cualquier medio para obtener ventaja injusta.</li>
                <li>Impersonar a otros usuarios, moderadores o miembros del equipo de desarrollo.</li>
                <li>Realizar ingeniería inversa, descompilar o intentar acceder al código fuente del juego.</li>
                <li>Interferir con los servidores, redes o sistemas de otros jugadores (ataques DDoS, etc.).</li>
              </ul>
              <p className="text-[#4a4a4a] leading-relaxed mt-3">
                El incumplimiento de estas normas puede resultar en advertencias, suspensión temporal 
                o eliminación permanente de la cuenta, a discreción del equipo de moderación.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Ban className="w-8 h-8 text-[#c4654a] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">4. Sanciones y moderación</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Contamos con filtros automáticos de chat, sistema de reportes revisado por moderadores 
                humanos y herramientas de detección de trampas. Las sanciones se aplican de forma progresiva: 
                advertencia → silenciamiento de chat (24-72h) → suspensión de cuenta (7-30 días) → 
                eliminación permanente. En casos graves (discriminación sistemática, grooming, amenazas 
                de violencia), la eliminación puede ser inmediata e irreversible. Puedes apelar sanciones 
                escribiendo a <a href="mailto:support@elsa-boteador.app" className="text-[#c45c7c] underline hover:text-[#a64d6a]">support@elsa-boteador.app</a>.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <RotateCcw className="w-8 h-8 text-[#2d8a9e] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">5. Propiedad intelectual</h2>
              <p className="text-[#4a4a4a] leading-relaxed mb-3">
                ELSA-BOTEADOR, incluyendo su código, diseño, gráficos, música, marcas y contenido, 
                es propiedad de sus respectivos dueños y está protegido por leyes de propiedad intelectual. 
                Te otorgamos una licencia limitada, no exclusiva e intransferible para usar el juego 
                con fines personales y no comerciales.
              </p>
              <p className="text-[#4a4a4a] leading-relaxed">
                Los cosméticos, avatares y elementos desbloqueados dentro del juego son contenido digital 
                con licencia de uso; no constituyen propiedad tangible ni pueden transferirse, venderse 
                ni intercambiarse fuera del juego.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Gavel className="w-8 h-8 text-[#cd7f32] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">6. Terminación de servicio</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Puedes eliminar tu cuenta en cualquier momento desde la sección de Configuración. 
                La eliminación es permanente: todos tus datos, progreso, logros y amistades se borrarán 
                irrevocablemente en un plazo de 30 días. Nos reservamos el derecho de suspender o 
                discontinuar el servicio con un preaviso de 60 días. En caso de cierre del servicio, 
                no se realizarán reembolsos de contenido digital adquirido con moneda virtual del juego.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <MessageCircle className="w-8 h-8 text-[#c45c7c] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">7. Limitación de responsabilidad</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                ELSA-BOTEADOR se proporciona "tal cual" y "según disponibilidad". No garantizamos que 
                el servicio sea ininterrumpido, seguro o libre de errores. En ningún caso seremos 
                responsables de daños indirectos, incidentales o consecuentes derivados del uso del juego. 
                El uso del chat y las interacciones sociales son bajo tu propia responsabilidad; te 
                recomendamos no compartir información personal sensible con desconocidos.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <FileCheck className="w-8 h-8 text-[#5a8a5c] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">8. Modificaciones y contacto</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Podemos modificar estos términos en cualquier momento. Los cambios entrarán en vigor 15 días 
                después de su publicación, salvo que afecten a tus derechos fundamentales, en cuyo caso te 
                notificaremos directamente. Si tienes dudas sobre estos términos, escríbenos a{" "}
                <a href="mailto:legal@elsa-boteador.app" className="text-[#c45c7c] underline hover:text-[#a64d6a]">
                  legal@elsa-boteador.app
                </a>.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Button size="lg" asChild className="bg-[#c45c7c] hover:bg-[#a64d6a] text-white rounded-full px-8">
            <Link to="/">Volver al juego</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-[#e8c5d0]/40 mt-12 py-8 text-center text-sm text-[#8b7355]">
        <p>ELSA-BOTEADOR {new Date().getFullYear()} — Juego de deducción social</p>
      </footer>
    </div>
  );
}

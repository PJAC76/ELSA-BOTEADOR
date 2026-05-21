import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Database, Eye, Trash2, Cookie, Mail, Lock } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#fef7f0] text-[#2d2a26]">
      <Helmet>
        <title>Política de Privacidad — ELSA-BOTEADOR</title>
        <meta name="description" content="Política de privacidad de ELSA-BOTEADOR: cómo recopilamos, usamos y protegemos tus datos personales en nuestro juego de deducción social." />
        <link rel="canonical" href="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/privacy" />
        <meta property="og:title" content="Política de Privacidad — ELSA-BOTEADOR" />
        <meta property="og:description" content="Cómo recopilamos, usamos y protegemos tus datos personales en ELSA-BOTEADOR." />
        <meta property="og:url" content="https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/privacy" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Política de Privacidad",
            "description": "Política de privacidad de ELSA-BOTEADOR.",
            "url": "https://id-preview--a323d17d-449e-4414-a637-3c9c23c9178e.lovable.app/privacy",
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
            Política de Privacidad
          </h1>
          <p className="text-[#8b7355]">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Database className="w-8 h-8 text-[#9b72cf] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">1. Datos que recopilamos</h2>
              <p className="text-[#4a4a4a] leading-relaxed mb-3">
                Para ofrecerte la mejor experiencia de juego, recopilamos la siguiente información:
              </p>
              <ul className="list-disc list-inside text-[#4a4a4a] leading-relaxed space-y-1">
                <li><strong>Información de cuenta:</strong> nombre de usuario, dirección de correo electrónico y contraseña cifrada.</li>
                <li><strong>Perfil de jugador:</strong> avatar personalizado, progreso de nivel, logros desbloqueados y preferencias de configuración.</li>
                <li><strong>Datos de partida:</strong> historial de partidas, estadísticas de rendimiento, amistades y squad memberships.</li>
                <li><strong>Datos técnicos:</strong> dirección IP (anonimizada), tipo de dispositivo y navegador, únicamente para diagnóstico de errores.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Eye className="w-8 h-8 text-[#e88aab] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">2. Cómo usamos tus datos</h2>
              <p className="text-[#4a4a4a] leading-relaxed mb-3">
                Utilizamos la información recopilada exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-[#4a4a4a] leading-relaxed space-y-1">
                <li>Operar el juego: matchmaking, salas multijugador, sincronización de partidas.</li>
                <li>Personalizar tu experiencia: progresión, recompensas, recomendaciones de amistad.</li>
                <li>Garantizar la seguridad: moderación de chat, detección de comportamiento tóxico, prevención de trampas.</li>
                <li>Mejorar el servicio: análisis agregado de uso, corrección de errores, balanceo de mecánicas.</li>
              </ul>
              <p className="text-[#4a4a4a] leading-relaxed mt-3">
                <strong>No vendemos ni compartimos tus datos personales con terceros con fines publicitarios.</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Lock className="w-8 h-8 text-[#7d9b76] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">3. Protección de menores</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                ELSA-BOTEADOR está dirigido a jugadoras de <strong>13 años o más</strong>. No recopilamos 
                conscientemente datos personales de menores de 13 años. Si descubrimos que una cuenta 
                pertenece a una menor de edad, la eliminaremos de inmediato junto con todos sus datos 
                asociados. Los padres o tutores pueden contactarnos para solicitar la eliminación de 
                datos de sus hijos menores.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Cookie className="w-8 h-8 text-[#cd7f32] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">4. Cookies y almacenamiento local</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Usamos <code className="bg-[#f0ebe3] px-1 rounded text-sm">localStorage</code> y cookies 
                esenciales para mantener tu sesión de autenticación, guardar preferencias de configuración 
                (idioma, tema, audio) y recordar tu progreso de racha diaria. No utilizamos cookies de 
                seguimiento ni publicidad de terceros. Puedes borrar el almacenamiento local desde la 
                configuración de tu navegador en cualquier momento.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Trash2 className="w-8 h-8 text-[#c4654a] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">5. Tus derechos</h2>
              <p className="text-[#4a4a4a] leading-relaxed mb-3">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-[#4a4a4a] leading-relaxed space-y-1">
                <li><strong>Acceder</strong> a todos los datos personales que tenemos sobre ti.</li>
                <li><strong>Rectificar</strong> información incorrecta o desactualizada.</li>
                <li><strong>Eliminar</strong> tu cuenta y todos tus datos personales permanentemente.</li>
                <li><strong>Exportar</strong> tus datos en formato legible (JSON).</li>
                <li><strong>Restringir</strong> ciertos usos de tus datos (p. ej., desactivar análisis agregado).</li>
              </ul>
              <p className="text-[#4a4a4a] leading-relaxed mt-3">
                Para ejercer cualquiera de estos derechos, contáctanos a través del correo indicado abajo.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Shield className="w-8 h-8 text-[#2d8a9e] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">6. Seguridad de la información</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado TLS 
                en todas las comunicaciones, hash de contraseñas con bcrypt, autenticación JWT con 
                rotación de tokens, y acceso a bases de datos restringido mediante Row-Level Security (RLS). 
                Realizamos auditorías de seguridad periódicas y mantenemos un canal de reporte de 
                vulnerabilidades.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <Mail className="w-8 h-8 text-[#c45c7c] shrink-2" />
            <div>
              <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">7. Contacto</h2>
              <p className="text-[#4a4a4a] leading-relaxed">
                Si tienes preguntas sobre esta política de privacidad, deseas ejercer tus derechos o 
                reportar un problema de seguridad, escríbenos a{" "}
                <a href="mailto:privacy@elsa-boteador.app" className="text-[#c45c7c] underline hover:text-[#a64d6a]">
                  privacy@elsa-boteador.app
                </a>.
                Responderemos en un plazo máximo de 30 días.
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

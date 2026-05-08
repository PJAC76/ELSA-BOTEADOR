import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User, Loader2, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  logGoogleSignInEvent,
  getGoogleSessionSummary,
  clearGoogleSessionSummary,
  hashAnonId,
  setAnonUserId,
  type GoogleSessionSummary,
} from "@/lib/auth-metrics";

type LoginScreenProps = {
  onLogin: () => void;
};

type Mode = "welcome" | "login" | "register";

const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const outcomeLabel = (o: GoogleSessionSummary["lastOutcome"]) => {
  switch (o) {
    case "success": return { text: "Última sesión: Inicio exitoso", tone: "success" as const };
    case "timeout": return { text: "Última sesión: Tiempo de espera agotado", tone: "warn" as const };
    case "error": return { text: "Última sesión: Error de Google", tone: "error" as const };
    case "cancelled": return { text: "Última sesión: Cancelaste el intento", tone: "warn" as const };
    default: return { text: "Intento en curso…", tone: "info" as const };
  }
};

const GoogleSessionSummaryBanner = ({
  summary,
  onDismiss,
}: { summary: GoogleSessionSummary; onDismiss: () => void }) => {
  const { text, tone } = outcomeLabel(summary.lastOutcome);
  const toneClass =
    tone === "success" ? "border-primary/40 bg-primary/10 text-foreground" :
    tone === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" :
    tone === "warn" ? "border-amber-500/40 bg-amber-500/10 text-foreground" :
    "border-border bg-muted/40 text-foreground";
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border ${toneClass} p-3`}>
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-80" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-xs font-bold">{text}</p>
          <p className="font-body text-[11px] opacity-80 mt-0.5">
            Intentos: {summary.totalAttempts} · Reintentos: {summary.retries}
            {summary.timeouts > 0 ? ` · Timeouts: ${summary.timeouts}` : ""}
            {summary.errors > 0 ? ` · Errores: ${summary.errors}` : ""}
            {summary.cancellations > 0 ? ` · Cancelaciones: ${summary.cancellations}` : ""}
          </p>
          {summary.lastErrorMessage && (
            <p className="font-body text-[11px] opacity-70 mt-1 line-clamp-2">{summary.lastErrorMessage}</p>
          )}
        </div>
        <button onClick={onDismiss} className="font-body text-[10px] underline-offset-2 hover:underline opacity-70">
          Limpiar
        </button>
      </div>
    </motion.div>
  );
};

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleAttempts, setGoogleAttempts] = useState(0);
  const googleInFlightRef = useRef(false);
  const [sessionSummary, setSessionSummary] = useState<GoogleSessionSummary>(() => getGoogleSessionSummary());
  const { t } = useTranslation();
  const { toast } = useToast();

  // Refresh summary when window regains focus (e.g. user returns from OAuth tab).
  useEffect(() => {
    const refresh = () => setSessionSummary(getGoogleSessionSummary());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  // On mount, if a Supabase session already exists, prefer hashing the user_id
  // (more stable than email and never collides across providers).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (!uid || cancelled) return;
        const hash = await hashAnonId(uid);
        if (!cancelled && hash) setAnonUserId({ anonUserId: hash, anonSource: "user_id" });
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshSummary = () => setSessionSummary(getGoogleSessionSummary());

  const trackGoogleEvent: typeof logGoogleSignInEvent = (evt) => {
    logGoogleSignInEvent(evt);
    refreshSummary();
  };

  const describeGoogleError = (raw: unknown): string => {
    const msg = raw instanceof Error ? raw.message : typeof raw === "string" ? raw : JSON.stringify(raw);
    const lower = (msg || "").toLowerCase();
    if (lower.includes("popup") && lower.includes("clos")) return "Cerraste la ventana de Google antes de completar el acceso. Intenta de nuevo.";
    if (lower.includes("popup") && lower.includes("block")) return "Tu navegador bloqueó la ventana emergente de Google. Permite popups para este sitio e intenta de nuevo.";
    if (lower.includes("network") || lower.includes("failed to fetch")) return "Problema de conexión al contactar con Google. Revisa tu internet e inténtalo de nuevo.";
    if (lower.includes("redirect") && lower.includes("uri")) return "La URL de redirección no está autorizada. Revisa la configuración de Google en Lovable Cloud.";
    if (lower.includes("provider") && lower.includes("not")) return "El proveedor Google no está habilitado en este proyecto.";
    if (lower.includes("access_denied") || lower.includes("denied")) return "Cancelaste el acceso con Google o no se concedieron los permisos.";
    if (lower.includes("invalid") && lower.includes("client")) return "Credenciales de Google inválidas. Revisa la configuración OAuth.";
    return msg ? `No se pudo iniciar sesión con Google: ${msg}` : "No se pudo iniciar sesión con Google. Inténtalo de nuevo.";
  };

  const GOOGLE_TIMEOUT_MS = 15000;

  const handleGoogleLogin = async () => {
    if (googleInFlightRef.current || loading) {
      console.warn("[GoogleSignIn] Intento ignorado: ya hay una solicitud en curso");
      logGoogleSignInEvent({
        attemptId: Date.now(),
        attemptNumber: googleAttempts + 1,
        outcome: "ignored_concurrent",
      });
      return;
    }
    googleInFlightRef.current = true;
    setLoading(true);
    setGoogleError(null);
    const attemptId = Date.now();
    const attemptNumber = googleAttempts + 1;
    const startedAt = performance.now();

    // Set anon id from email if we don't already have a user_id-based one.
    if (email.trim()) {
      try {
        const hash = await hashAnonId(email);
        if (hash) setAnonUserId({ anonUserId: hash, anonSource: "email" });
      } catch { /* ignore */ }
    }

    console.info("[GoogleSignIn] Iniciando OAuth con Google", { origin: window.location.origin, attemptId, attemptNumber });
    logGoogleSignInEvent({ attemptId, attemptNumber, outcome: "started" });

    // Timeout safety net: if the OAuth call hangs (no redirect, no resolve) for too long,
    // surface a clear error and let the user retry or fall back to email.
    const timeoutPromise = new Promise<{ __timeout: true }>((resolve) =>
      setTimeout(() => resolve({ __timeout: true }), GOOGLE_TIMEOUT_MS)
    );

    try {
      const oauthPromise = lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      const raced = await Promise.race([oauthPromise, timeoutPromise]);

      if ("__timeout" in raced) {
        const durationMs = Math.round(performance.now() - startedAt);
        console.warn("[GoogleSignIn] Timeout esperando respuesta de Google", { attemptId, attemptNumber, durationMs });
        const desc = "Google tardó demasiado en responder. Revisa tu conexión e inténtalo de nuevo, o usa email y contraseña.";
        setGoogleError(desc);
        setGoogleAttempts((n) => n + 1);
        toast({ title: "Tiempo de espera agotado", description: desc, variant: "destructive" });
        logGoogleSignInEvent({ attemptId, attemptNumber, outcome: "timeout", durationMs, errorMessage: desc });
        setLoading(false);
        return;
      }

      const result = raced as Awaited<typeof oauthPromise>;
      const durationMs = Math.round(performance.now() - startedAt);

      if (result.error) {
        console.error("[GoogleSignIn] Error devuelto por lovable.auth", { attemptId, attemptNumber, error: result.error });
        const desc = describeGoogleError(result.error);
        setGoogleError(desc);
        setGoogleAttempts((n) => n + 1);
        toast({ title: "Error al iniciar sesión con Google", description: desc, variant: "destructive" });
        logGoogleSignInEvent({
          attemptId,
          attemptNumber,
          outcome: "error",
          durationMs,
          errorMessage: result.error instanceof Error ? result.error.message : String(result.error),
          errorName: result.error instanceof Error ? result.error.name : undefined,
        });
        setLoading(false);
        return;
      }

      if (result.redirected) {
        console.info("[GoogleSignIn] Redirigiendo al proveedor Google…", { attemptId, attemptNumber, durationMs });
        logGoogleSignInEvent({ attemptId, attemptNumber, outcome: "redirected", durationMs });
        // Don't reset loading: page is about to navigate away.
        return;
      }

      console.info("[GoogleSignIn] Sesión establecida correctamente", { attemptId, attemptNumber, durationMs });
      logGoogleSignInEvent({ attemptId, attemptNumber, outcome: "success", durationMs });
      setGoogleError(null);
      onLogin();
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startedAt);
      console.error("[GoogleSignIn] Excepción no controlada", { attemptId, attemptNumber, err });
      const desc = describeGoogleError(err);
      setGoogleError(desc);
      setGoogleAttempts((n) => n + 1);
      toast({ title: "Error al iniciar sesión con Google", description: desc, variant: "destructive" });
      logGoogleSignInEvent({
        attemptId,
        attemptNumber,
        outcome: "error",
        durationMs,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.name : undefined,
      });
    } finally {
      googleInFlightRef.current = false;
      setLoading(false);
    }
  };

  const cancelGoogleLoading = () => {
    console.info("[GoogleSignIn] Usuario canceló el intento manualmente");
    logGoogleSignInEvent({
      attemptId: Date.now(),
      attemptNumber: googleAttempts + 1,
      outcome: "cancelled",
    });
    googleInFlightRef.current = false;
    setLoading(false);
    setGoogleError("Cancelaste el intento. Puedes reintentar o usar email y contraseña.");
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast({ title: "Email requerido", description: "Ingresa tu email para enviarte el enlace de recuperación.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "📧 Revisa tu email", description: "Te enviamos un enlace para restablecer tu contraseña." });
      
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo enviar el email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const switchToEmailFallback = () => {
    setMode("login");
    setGoogleError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() || "Jugadora" },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "✅", description: "Account created! Check your email to confirm." });
        onLogin();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (mode === "welcome") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary shadow-glow">
            <span className="text-4xl">🕵️</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-1 font-display text-3xl font-black text-foreground">
          {t("welcome")}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-10 font-body text-base text-muted-foreground">
          {t("welcomeSubtitle")}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex w-full max-w-sm flex-col gap-3">
          {sessionSummary.totalAttempts > 0 && (
            <GoogleSessionSummaryBanner summary={sessionSummary} onDismiss={() => { clearGoogleSessionSummary(); refreshSummary(); }} />
          )}
          <Button onClick={handleGoogleLogin} disabled={loading} size="lg" className="h-14 w-full rounded-2xl bg-card text-foreground shadow-card hover:shadow-glow border border-border font-display text-base font-bold">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon />}
            {loading ? "Conectando con Google…" : t("continueWithGoogle")}
          </Button>
          {loading && (
            <button onClick={cancelGoogleLoading} className="font-body text-xs text-muted-foreground underline-offset-2 hover:underline">
              Cancelar y usar otro método
            </button>
          )}

          {googleError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="font-body text-xs text-destructive">{googleError}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleGoogleLogin} disabled={loading} size="sm" variant="outline" className="h-10 rounded-xl font-display text-xs font-bold">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Reintentar con Google {googleAttempts > 1 ? `(${googleAttempts})` : ""}
                </Button>
                <Button onClick={switchToEmailFallback} size="sm" className="h-10 rounded-xl gradient-primary text-primary-foreground font-display text-xs font-bold">
                  <Mail className="mr-2 h-3 w-3" />
                  Usar email y contraseña
                </Button>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-border" />
            <span className="font-body text-xs text-muted-foreground">{t("or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button onClick={() => setMode("login")} disabled={loading} size="lg" className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold">
            <Mail className="mr-2 h-5 w-5" />
            {t("emailAndPassword")}
          </Button>

          <p className="mt-4 text-center font-body text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <button onClick={() => setMode("register")} disabled={loading} className="font-bold text-primary underline-offset-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
              {t("register")}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-soft">
        <span className="text-3xl">🕵️</span>
      </motion.div>

      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-1 font-display text-2xl font-bold text-foreground">
        {mode === "login" ? t("login") : t("createAccount")}
      </motion.h2>
      <p className="mb-6 font-body text-sm text-muted-foreground">
        {mode === "login" ? t("campusAwaits") : t("joinTheFun")}
      </p>

      {/* Google button in both login and register */}
      <Button onClick={handleGoogleLogin} disabled={loading} size="lg" className="h-14 w-full max-w-sm rounded-2xl bg-card text-foreground shadow-card hover:shadow-glow border border-border font-display text-base font-bold mb-2">
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <GoogleIcon />}
        {loading ? "Conectando con Google…" : t("continueWithGoogle")}
      </Button>
      {loading && (
        <button onClick={cancelGoogleLoading} className="mb-4 font-body text-xs text-muted-foreground underline-offset-2 hover:underline">
          Cancelar y usar email
        </button>
      )}

      {googleError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-destructive/40 bg-destructive/10 p-4 mb-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="font-body text-xs text-destructive">{googleError}</p>
          </div>
          <Button onClick={handleGoogleLogin} disabled={loading} size="sm" variant="outline" className="h-10 w-full rounded-xl font-display text-xs font-bold">
            <RefreshCw className="mr-2 h-3 w-3" />
            Reintentar con Google {googleAttempts > 1 ? `(${googleAttempts})` : ""}
          </Button>
          <p className="mt-2 font-body text-[11px] text-muted-foreground text-center">O completa tus datos abajo para entrar con email.</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3 my-2 w-full max-w-sm">
        <div className="h-px flex-1 bg-border" />
        <span className="font-body text-xs text-muted-foreground">{t("or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 mt-4">
        {mode === "register" && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("yourName")} value={name} onChange={(e) => setName(e.target.value)} className="h-14 rounded-2xl pl-11 font-body text-base" />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 rounded-2xl pl-11 font-body text-base" />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type={showPassword ? "text" : "password"} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-2xl pl-11 pr-12 font-body text-base" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button type="submit" disabled={loading} size="lg" className="h-14 rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {mode === "login" ? t("enter") : t("createAccountBtn")}
        </Button>

        {mode === "login" && (
          <button type="button" onClick={handlePasswordReset} disabled={loading} className="text-center font-body text-xs text-primary underline-offset-2 hover:underline">
            ¿Olvidaste tu contraseña? Te enviamos un enlace
          </button>
        )}

        <p className="text-center font-body text-sm text-muted-foreground">
          {mode === "login" ? t("noAccount") + " " : t("haveAccount") + " "}
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} disabled={loading} className="font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {mode === "login" ? t("register") : t("signIn")}
          </button>
        </p>
      </motion.form>

      <button onClick={() => setMode("welcome")} disabled={loading} className="mt-6 font-body text-sm text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed">
        {t("back")}
      </button>
    </div>
  );
};

export default LoginScreen;

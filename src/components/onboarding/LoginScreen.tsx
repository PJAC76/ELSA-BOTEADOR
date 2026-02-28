import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

type LoginScreenProps = {
  onLogin: () => void;
};

type Mode = "welcome" | "login" | "register";

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  if (mode === "welcome") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary shadow-glow">
            <span className="text-4xl">🕵️</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-1 font-display text-3xl font-black text-foreground"
        >
          ¡Bienvenida!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 font-body text-base text-muted-foreground"
        >
          Entra al campus y descubre quién es ELSA-BOTEADOR
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          {/* Google */}
          <Button
            onClick={onLogin}
            size="lg"
            className="h-14 w-full rounded-2xl bg-card text-foreground shadow-card hover:shadow-glow border border-border font-display text-base font-bold"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-border" />
            <span className="font-body text-xs text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email login */}
          <Button
            onClick={() => setMode("login")}
            size="lg"
            className="h-14 w-full rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold"
          >
            <Mail className="mr-2 h-5 w-5" />
            Email y contraseña
          </Button>

          {/* Register */}
          <p className="mt-4 text-center font-body text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => setMode("register")}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              Regístrate
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-soft"
      >
        <span className="text-3xl">🕵️</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-1 font-display text-2xl font-bold text-foreground"
      >
        {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
      </motion.h2>
      <p className="mb-8 font-body text-sm text-muted-foreground">
        {mode === "login"
          ? "¡El campus te espera!"
          : "Únete a la diversión"}
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        {mode === "register" && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-2xl pl-11 font-body text-base"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 rounded-2xl pl-11 font-body text-base"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 rounded-2xl pl-11 pr-12 font-body text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-14 rounded-2xl gradient-primary text-primary-foreground shadow-soft font-display text-base font-bold"
        >
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </Button>

        <p className="text-center font-body text-sm text-muted-foreground">
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-bold text-primary"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </motion.form>

      <button
        onClick={() => setMode("welcome")}
        className="mt-6 font-body text-sm text-muted-foreground"
      >
        ← Volver
      </button>
    </div>
  );
};

export default LoginScreen;

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Accessibility, Shield, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type SettingsScreenProps = {
  onBack: () => void;
};

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [friendRequests, setFriendRequests] = useState(true);

  const Section = ({
    icon: Icon,
    title,
    children,
    delay = 0,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-3xl bg-card p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );

  const SettingRow = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label className="font-display text-sm font-semibold text-foreground">
          {label}
        </Label>
        {description && (
          <p className="font-body text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="gradient-primary px-6 pb-8 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            Ajustes
          </h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 -mt-4 pb-8">
        {/* Language */}
        <Section icon={Globe} title="Idioma" delay={0.1}>
          <div className="flex gap-2">
            {([
              { code: "es" as const, label: "🇪🇸 Español" },
              { code: "en" as const, label: "🇬🇧 English" },
            ] as const).map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`flex-1 rounded-2xl py-3 font-display text-sm font-bold transition-colors ${
                  language === code
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* Accessibility */}
        <Section icon={Accessibility} title="Accesibilidad" delay={0.2}>
          <SettingRow
            label="Alto contraste"
            description="Mejora la visibilidad de los elementos"
            checked={highContrast}
            onChange={setHighContrast}
          />
          <SettingRow
            label="Texto grande"
            description="Aumenta el tamaño del texto"
            checked={largeText}
            onChange={setLargeText}
          />
        </Section>

        {/* Sound */}
        <Section icon={Volume2} title="Sonido" delay={0.3}>
          <SettingRow
            label="Efectos de sonido"
            checked={soundEffects}
            onChange={setSoundEffects}
          />
        </Section>

        {/* Privacy */}
        <Section icon={Shield} title="Privacidad" delay={0.4}>
          <SettingRow
            label="Perfil privado"
            description="Solo tus amigas verán tu perfil"
            checked={privateProfile}
            onChange={setPrivateProfile}
          />
          <SettingRow
            label="Solicitudes de amistad"
            description="Permite que te envíen solicitudes"
            checked={friendRequests}
            onChange={setFriendRequests}
          />
        </Section>
      </div>
    </div>
  );
};

export default SettingsScreen;

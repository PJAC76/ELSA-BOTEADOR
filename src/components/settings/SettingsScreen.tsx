import { motion } from "framer-motion";
import { ArrowLeft, Globe, Accessibility, Shield, Volume2, Hand, Palette, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setSoundEnabled } from "@/lib/sounds";
import { useSettingsStore } from "@/stores/settings-store";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ThemeSelector from "./ThemeSelector";

type SettingsScreenProps = {
  onBack: () => void;
};

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const settings = useSettingsStore();
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      window.location.reload();
    }
  };

  const Section = ({ icon: Icon, title, children, delay = 0 }: { icon: React.ElementType; title: string; children: React.ReactNode; delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="rounded-3xl bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );

  const SettingRow = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label className="font-display text-sm font-semibold text-foreground">{label}</Label>
        {description && <p className="font-body text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-primary px-6 pb-8 pt-12 safe-top">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/20 text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">{t("settingsTitle")}</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 -mt-4 pb-8">
        <Section icon={Globe} title={t("languageSection")} delay={0.1}>
          <div className="flex gap-2">
            {([{ code: "es" as const, label: "🇪🇸 Español" }, { code: "en" as const, label: "🇬🇧 English" }]).map(({ code, label }) => (
              <button key={code} onClick={() => settings.setLanguage(code)} className={`flex-1 rounded-2xl py-3 font-display text-sm font-bold transition-colors ${settings.language === code ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {label}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Palette} title={t("themesSection" as any)} delay={0.15}>
          <ThemeSelector />
        </Section>

        <Section icon={Accessibility} title={t("accessibility")} delay={0.2}>
          <SettingRow label={t("highContrast")} description={t("highContrastDesc")} checked={settings.highContrast} onChange={settings.setHighContrast} />
          <SettingRow label={t("largeText")} description={t("largeTextDesc")} checked={settings.largeText} onChange={settings.setLargeText} />
        </Section>

        <Section icon={Hand} title={t("handPreference")} delay={0.25}>
          <div className="flex gap-2">
            {([{ value: "right" as const, label: t("rightHand"), desc: t("rightHandDesc") }, { value: "left" as const, label: t("leftHand"), desc: t("leftHandDesc") }]).map(({ value, label, desc }) => (
              <button key={value} onClick={() => settings.setHandPreference(value)} className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 px-2 transition-colors ${settings.handPreference === value ? "gradient-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                <span className="font-display text-sm font-bold">{label}</span>
                <span className="font-body text-[10px] opacity-70">{desc}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Volume2} title={t("sound")} delay={0.3}>
          <SettingRow label={t("soundEffects")} checked={settings.soundEnabled} onChange={(v) => { settings.setSoundEnabled(v); setSoundEnabled(v); }} />
        </Section>

        <Section icon={Shield} title={t("privacy")} delay={0.35}>
          <SettingRow label={t("privateProfile")} description={t("privateProfileDesc")} checked={settings.privateProfile} onChange={settings.setPrivateProfile} />
          <SettingRow label={t("friendRequests")} description={t("friendRequestsDesc")} checked={settings.friendRequests} onChange={settings.setFriendRequests} />
        </Section>
        </Section>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button onClick={handleSignOut} variant="destructive" size="lg" className="h-14 w-full rounded-2xl font-display text-base font-bold">
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar sesión
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen;

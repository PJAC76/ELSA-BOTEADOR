import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Flag, X, Check, ShieldAlert } from "lucide-react";
import { useReportsStore, REPORT_REASONS, type ReportReason } from "@/stores/reports-store";
import { useToast } from "@/hooks/use-toast";
import { playTap } from "@/lib/sounds";

type ReportPlayerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
};

const ReportPlayerModal = ({ isOpen, onClose, playerId, playerName }: ReportPlayerModalProps) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [wasBanned, setWasBanned] = useState(false);
  const { submitReport } = useReportsStore();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedReason) return;
    playTap();

    const result = submitReport({
      reportedPlayerId: playerId,
      reportedPlayerName: playerName,
      reason: selectedReason,
    });

    setWasBanned(result.banned);
    setSubmitted(true);

    toast({
      title: "🛡️ Reporte enviado",
      description: result.banned
        ? `${playerName} ha sido suspendida temporalmente.`
        : `Gracias por reportar. Revisaremos el caso.`,
    });
  };

  const handleClose = () => {
    setSelectedReason(null);
    setSubmitted(false);
    setWasBanned(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm px-4 pb-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-card"
          >
            {!submitted ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-destructive" />
                    <h2 className="font-display text-lg font-black text-foreground">
                      Reportar jugadora
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <p className="font-body text-sm text-muted-foreground mb-4">
                  Reportando a <span className="font-bold text-foreground">{playerName}</span>.
                  Selecciona el motivo:
                </p>

                {/* Reasons */}
                <div className="space-y-2 mb-5">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      onClick={() => { setSelectedReason(reason.value); playTap(); }}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                        selectedReason === reason.value
                          ? "bg-destructive/10 ring-2 ring-destructive/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="text-lg">{reason.emoji}</span>
                      <span className="font-display text-sm font-bold text-foreground">
                        {reason.label}
                      </span>
                      {selectedReason === reason.value && (
                        <Check className="ml-auto h-4 w-4 text-destructive" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 rounded-2xl bg-campus-yellow/10 p-3 mb-4">
                  <AlertTriangle className="h-4 w-4 text-campus-yellow shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-muted-foreground">
                    Los reportes falsos pueden resultar en sanciones para tu cuenta.
                    Solo reporta comportamiento real.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedReason}
                  className="h-12 w-full rounded-2xl bg-destructive text-destructive-foreground font-display text-sm font-bold"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Enviar reporte
                </Button>
              </>
            ) : (
              /* Confirmation */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    wasBanned ? "bg-destructive/15" : "bg-accent/15"
                  }`}
                >
                  {wasBanned ? (
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                  ) : (
                    <Check className="h-8 w-8 text-accent-foreground" />
                  )}
                </motion.div>

                <h3 className="font-display text-lg font-black text-foreground text-center">
                  {wasBanned ? "Jugadora suspendida" : "Reporte recibido"}
                </h3>
                <p className="font-body text-sm text-muted-foreground text-center">
                  {wasBanned
                    ? `${playerName} ha sido suspendida por 24 horas debido a múltiples reportes.`
                    : "Gracias por ayudar a mantener el campus seguro. Revisaremos tu reporte."}
                </p>

                <Button
                  onClick={handleClose}
                  className="mt-2 h-12 w-full rounded-2xl gradient-primary text-primary-foreground font-display text-sm font-bold"
                >
                  Entendido
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportPlayerModal;

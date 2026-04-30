import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidaturaId: string;
  servicoId: string;
  trabalhadorId: string;
  onSuccess?: () => void;
};

const AvaliacaoDialog = ({ open, onOpenChange, candidaturaId, servicoId, trabalhadorId, onSuccess }: Props) => {
  const { user } = useAuth();
  const [estrelas, setEstrelas] = useState(0);
  const [hover, setHover] = useState(0);
  const [justificativa, setJustificativa] = useState("");
  const [saving, setSaving] = useState(false);

  const justObrigatoria = estrelas > 0 && estrelas <= 3;
  const justInvalida = justObrigatoria && justificativa.trim().length < 5;

  const reset = () => {
    setEstrelas(0);
    setHover(0);
    setJustificativa("");
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (estrelas < 1 || estrelas > 5) {
      toast.error("Selecione de 1 a 5 estrelas.");
      return;
    }
    if (justInvalida) {
      toast.error("Justificativa obrigatória (mínimo 5 caracteres) para 1, 2 ou 3 estrelas.");
      return;
    }
    setSaving(true);

    // Marca candidatura como concluída
    const { error: errCand } = await supabase
      .from("candidaturas")
      .update({ status: "concluida" })
      .eq("id", candidaturaId);

    if (errCand) {
      toast.error("Erro ao concluir candidatura.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("avaliacoes").insert({
      candidatura_id: candidaturaId,
      servico_id: servicoId,
      trabalhador_id: trabalhadorId,
      avaliador_id: user.id,
      estrelas,
      justificativa: justificativa.trim() || null,
    });

    setSaving(false);
    if (error) {
      toast.error(error.message || "Erro ao salvar avaliação.");
      return;
    }
    toast.success("Avaliação registrada!");
    reset();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar trabalhador</DialogTitle>
          <DialogDescription>
            Selecione uma nota de 1 a 5 estrelas. Justificativa é obrigatória para notas até 3.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || estrelas) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} estrelas`}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setEstrelas(n)}
                  className="rounded p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      active ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                    )}
                  />
                </button>
              );
            })}
          </div>
          {estrelas > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {estrelas} {estrelas === 1 ? "estrela" : "estrelas"}
            </p>
          )}

          <div className="space-y-2">
            <Label>
              Justificativa{" "}
              <span className={cn("text-xs", justObrigatoria ? "text-destructive" : "text-muted-foreground")}>
                {justObrigatoria ? "(obrigatória)" : "(opcional)"}
              </span>
            </Label>
            <Textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva o desempenho do trabalhador..."
              rows={4}
              maxLength={1000}
            />
            {justInvalida && (
              <p className="text-xs text-destructive">Mínimo de 5 caracteres.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || estrelas < 1 || justInvalida}>
            {saving ? "Enviando..." : "Confirmar avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoDialog;

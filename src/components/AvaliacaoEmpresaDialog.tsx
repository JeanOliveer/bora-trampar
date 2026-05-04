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
  empresaNome: string | null;
  onSuccess?: () => void;
};

const AvaliacaoEmpresaDialog = ({
  open,
  onOpenChange,
  candidaturaId,
  servicoId,
  trabalhadorId,
  empresaNome,
  onSuccess,
}: Props) => {
  const { user } = useAuth();
  const [estrelas, setEstrelas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setEstrelas(0);
    setHover(0);
    setComentario("");
  };

  const submit = async () => {
    if (!user) return;
    if (estrelas < 1) {
      toast.error("Selecione de 1 a 5 estrelas.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("avaliacoes").insert({
      candidatura_id: candidaturaId,
      servico_id: servicoId,
      trabalhador_id: trabalhadorId,
      avaliador_id: user.id,
      estrelas,
      justificativa: comentario.trim() || null,
      tipo: "trabalhador_para_empresa",
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Erro ao enviar avaliação.");
      return;
    }
    toast.success("Obrigado pela sua avaliação!");
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
          <DialogTitle>Avaliar {empresaNome ?? "a empresa"}</DialogTitle>
          <DialogDescription>
            Sua avaliação ajuda outros trabalhadores. <strong>O comentário é opcional.</strong>
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
                      active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
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
              Observações <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Como foi sua experiência com a empresa?"
              rows={4}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving || estrelas < 1}>
            {saving ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoEmpresaDialog;

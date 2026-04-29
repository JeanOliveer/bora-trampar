import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const candidaturaSchema = z.object({
  mensagem: z
    .string()
    .trim()
    .min(10, "A mensagem deve ter no mínimo 10 caracteres")
    .max(500, "A mensagem deve ter no máximo 500 caracteres"),
  disponibilidade: z.enum(["imediata", "uma_semana", "duas_semanas", "a_combinar"], {
    errorMap: () => ({ message: "Selecione uma disponibilidade" }),
  }),
  telefone: z
    .string()
    .trim()
    .min(10, "Telefone inválido")
    .max(20, "Telefone muito longo")
    .regex(/^[0-9()+\-\s]+$/, "Use apenas números e símbolos válidos"),
  experiencia: z
    .string()
    .trim()
    .max(300, "Máximo de 300 caracteres")
    .optional(),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicoTitulo: string;
};

const disponibilidadeLabel: Record<string, string> = {
  imediata: "Imediata",
  uma_semana: "Em até 1 semana",
  duas_semanas: "Em até 2 semanas",
  a_combinar: "A combinar",
};

const CandidaturaDialog = ({ open, onOpenChange, servicoTitulo }: Props) => {
  const [mensagem, setMensagem] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setMensagem("");
    setDisponibilidade("");
    setTelefone("");
    setExperiencia("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = candidaturaSchema.safeParse({
      mensagem,
      disponibilidade,
      telefone,
      experiencia: experiencia || undefined,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success("Candidatura enviada!", {
        description: `Disponibilidade: ${disponibilidadeLabel[disponibilidade]}.`,
      });
      setSubmitting(false);
      reset();
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidatar-se à diária</DialogTitle>
          <DialogDescription className="line-clamp-2">{servicoTitulo}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem ao contratante *</Label>
            <Textarea
              id="mensagem"
              placeholder="Apresente-se rapidamente e explique por que você é ideal para esta vaga."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              maxLength={500}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">{mensagem.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilidade">Disponibilidade *</Label>
            <Select value={disponibilidade} onValueChange={setDisponibilidade}>
              <SelectTrigger id="disponibilidade">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imediata">Imediata</SelectItem>
                <SelectItem value="uma_semana">Em até 1 semana</SelectItem>
                <SelectItem value="duas_semanas">Em até 2 semanas</SelectItem>
                <SelectItem value="a_combinar">A combinar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone para contato *</Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(31) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencia">Experiência relevante (opcional)</Label>
            <Textarea
              id="experiencia"
              placeholder="Conte sobre experiências anteriores relacionadas à vaga."
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{experiencia.length}/300</p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar candidatura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CandidaturaDialog;

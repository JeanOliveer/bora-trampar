import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, FileCheck2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const candidaturaSchema = z.object({
  cpf: z
    .string()
    .trim()
    .refine((v) => onlyDigits(v).length === 11, "CPF deve ter 11 dígitos"),
  telefone: z
    .string()
    .trim()
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length >= 10 && d.length <= 11;
    }, "Telefone inválido (DDD + número)"),
  rua: z.string().trim().min(3, "Informe a rua").max(120, "Máximo 120 caracteres"),
  numero: z.string().trim().min(1, "Informe o número").max(10, "Máximo 10 caracteres"),
  bairro: z.string().trim().min(2, "Informe o bairro").max(80, "Máximo 80 caracteres"),
  cidade: z.string().trim().min(2, "Informe a cidade").max(80, "Máximo 80 caracteres"),
  pix: z.string().trim().min(1, "Informe sua chave PIX").max(120, "Máximo 120 caracteres"),
  mensagem: z
    .string()
    .trim()
    .min(10, "A mensagem deve ter no mínimo 10 caracteres")
    .max(500, "A mensagem deve ter no máximo 500 caracteres"),
  disponibilidade: z.enum(["imediata", "uma_semana", "duas_semanas", "a_combinar"], {
    errorMap: () => ({ message: "Selecione uma disponibilidade" }),
  }),
  experiencia: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
});

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_DOC_BYTES = 5 * 1024 * 1024; // 5MB

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicoId: string;
  servicoTitulo: string;
};

const CandidaturaDialog = ({ open, onOpenChange, servicoId, servicoTitulo }: Props) => {
  const { user, profile } = useAuth();

  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [pix, setPix] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [documento, setDocumento] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const profileCpfDigits = profile?.cpf ? onlyDigits(profile.cpf) : "";
  const profilePix = (profile?.chave_pix ?? "").trim();

  const reset = () => {
    setCpf("");
    setTelefone("");
    setRua("");
    setNumero("");
    setBairro("");
    setCidade(profile?.cidade ?? "");
    setPix("");
    setMensagem("");
    setDisponibilidade("");
    setExperiencia("");
    setDocumento(null);
    setErrors({});
  };

  useEffect(() => {
    if (open) {
      setCidade(profile?.cidade ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Validações em tempo real (campo a campo)
  const validateField = (name: string, value: string) => {
    const next = { ...errors };
    if (name === "cpf") {
      if (onlyDigits(value).length !== 11) next.cpf = "CPF deve ter 11 dígitos";
      else if (profileCpfDigits && onlyDigits(value) !== profileCpfDigits)
        next.cpf = "CPF não coincide com o cadastrado na sua conta";
      else delete next.cpf;
    }
    if (name === "pix") {
      if (!value.trim()) next.pix = "Informe sua chave PIX";
      else if (profilePix && value.trim() !== profilePix)
        next.pix = "PIX não coincide com o cadastrado na sua conta";
      else delete next.pix;
    }
    setErrors(next);
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const next = { ...errors };
    if (!file) {
      setDocumento(null);
      next.documento = "Envie a foto do RG ou CNH";
      setErrors(next);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      next.documento = "Formato inválido. Use JPG, PNG, WEBP ou PDF";
      setDocumento(null);
      setErrors(next);
      return;
    }
    if (file.size > MAX_DOC_BYTES) {
      next.documento = "Arquivo muito grande (máx 5MB)";
      setDocumento(null);
      setErrors(next);
      return;
    }
    delete next.documento;
    setErrors(next);
    setDocumento(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Faça login para se candidatar");
      return;
    }

    if (!profileCpfDigits || !profilePix) {
      toast.error("Complete seu perfil com CPF e chave PIX antes de se candidatar");
      return;
    }

    const result = candidaturaSchema.safeParse({
      cpf,
      telefone,
      rua,
      numero,
      bairro,
      cidade,
      pix,
      mensagem,
      disponibilidade,
      experiencia: experiencia || undefined,
    });

    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.errors) {
        const k = issue.path[0] as string;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
    }

    // Comparação rigorosa CPF e PIX vs profile
    if (onlyDigits(cpf) !== profileCpfDigits) {
      fieldErrors.cpf = "CPF não coincide com o cadastrado na sua conta";
    }
    if (pix.trim() !== profilePix) {
      fieldErrors.pix = "PIX não coincide com o cadastrado na sua conta";
    }
    if (!documento) {
      fieldErrors.documento = "Envie a foto do RG ou CNH";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Corrija os campos destacados antes de enviar");
      return;
    }

    setSubmitting(true);
    try {
      // Upload do documento
      const ext = documento!.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${user.id}/${servicoId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos-candidatura")
        .upload(path, documento!, { upsert: false, contentType: documento!.type });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("candidaturas").insert({
        servico_id: servicoId,
        user_id: user.id,
        telefone: telefone.trim(),
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        mensagem: mensagem.trim(),
        disponibilidade,
        experiencia: experiencia.trim() || null,
        documento_url: path,
      });

      if (insertError) {
        // Limpa arquivo órfão se insert falhar
        await supabase.storage.from("documentos-candidatura").remove([path]);
        if (insertError.code === "23505") {
          toast.error("Você já se candidatou a este serviço");
        } else {
          toast.error(insertError.message || "Erro ao enviar candidatura");
        }
        return;
      }

      toast.success("Candidatura enviada com sucesso!");
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro inesperado ao enviar candidatura");
    } finally {
      setSubmitting(false);
    }
  };

  const missingProfileData = !profileCpfDigits || !profilePix;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Candidatar-se à diária</DialogTitle>
          <DialogDescription className="line-clamp-2">{servicoTitulo}</DialogDescription>
        </DialogHeader>

        {missingProfileData && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cadastre seu CPF e chave PIX no seu perfil antes de se candidatar.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  setCpf(e.target.value);
                  validateField("cpf", e.target.value);
                }}
                aria-invalid={!!errors.cpf}
                maxLength={14}
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(31) 99999-9999"
                value={telefone}
                onChange={(e) => {
                  setTelefone(e.target.value);
                  setErrors((er) => {
                    const n = { ...er };
                    const d = onlyDigits(e.target.value);
                    if (d.length < 10 || d.length > 11) n.telefone = "Telefone inválido";
                    else delete n.telefone;
                    return n;
                  });
                }}
                aria-invalid={!!errors.telefone}
                maxLength={16}
              />
              {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label htmlFor="rua">Rua *</Label>
              <Input
                id="rua"
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                aria-invalid={!!errors.rua}
                maxLength={120}
              />
              {errors.rua && <p className="text-sm text-destructive">{errors.rua}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                aria-invalid={!!errors.numero}
                maxLength={10}
              />
              {errors.numero && <p className="text-sm text-destructive">{errors.numero}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                aria-invalid={!!errors.bairro}
                maxLength={80}
              />
              {errors.bairro && <p className="text-sm text-destructive">{errors.bairro}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                aria-invalid={!!errors.cidade}
                maxLength={80}
              />
              {errors.cidade && <p className="text-sm text-destructive">{errors.cidade}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix">Chave PIX *</Label>
            <Input
              id="pix"
              placeholder="Mesma chave cadastrada no seu perfil"
              value={pix}
              onChange={(e) => {
                setPix(e.target.value);
                validateField("pix", e.target.value);
              }}
              aria-invalid={!!errors.pix}
              maxLength={120}
            />
            {errors.pix && <p className="text-sm text-destructive">{errors.pix}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento">Documento (RG ou CNH) *</Label>
            <label
              htmlFor="documento"
              className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-muted/30 p-4 text-sm transition hover:bg-muted/60"
            >
              {documento ? (
                <>
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  <span className="truncate">{documento.name}</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Clique para enviar foto do RG ou CNH (JPG, PNG, WEBP ou PDF — até 5MB)
                  </span>
                </>
              )}
              <Input
                id="documento"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleDocChange}
              />
            </label>
            {errors.documento && <p className="text-sm text-destructive">{errors.documento}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilidade">Disponibilidade *</Label>
            <Select value={disponibilidade} onValueChange={setDisponibilidade}>
              <SelectTrigger id="disponibilidade" aria-invalid={!!errors.disponibilidade}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imediata">Imediata</SelectItem>
                <SelectItem value="uma_semana">Em até 1 semana</SelectItem>
                <SelectItem value="duas_semanas">Em até 2 semanas</SelectItem>
                <SelectItem value="a_combinar">A combinar</SelectItem>
              </SelectContent>
            </Select>
            {errors.disponibilidade && (
              <p className="text-sm text-destructive">{errors.disponibilidade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem ao contratante *</Label>
            <Textarea
              id="mensagem"
              placeholder="Apresente-se rapidamente e explique por que você é ideal para esta vaga."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              maxLength={500}
              rows={4}
              aria-invalid={!!errors.mensagem}
            />
            <p className="text-xs text-muted-foreground">{mensagem.length}/500</p>
            {errors.mensagem && <p className="text-sm text-destructive">{errors.mensagem}</p>}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || missingProfileData}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar candidatura"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CandidaturaDialog;

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, FileCheck2, AlertCircle, Camera, X } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [documento, setDocumento] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Perguntas customizadas do serviço
  type Pergunta = { id: string; texto: string; tipo: "texto_curto" | "texto_longo" | "multipla_escolha"; opcoes: string[]; obrigatoria: boolean };
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  // Câmera (compartilhada entre RG e Selfie)
  const [cameraOpen, setCameraOpen] = useState<false | "documento" | "selfie">(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const profileCpfDigits = profile?.cpf ? onlyDigits(profile.cpf) : "";
  const profilePix = (profile?.chave_pix ?? "").trim();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const reset = () => {
    setCpf("");
    setTelefone("");
    setRua("");
    setNumero("");
    setBairro("");
    setCidade(profile?.cidade ?? "");
    setPix("");
    setDocumento(null);
    if (docPreview) URL.revokeObjectURL(docPreview);
    setDocPreview(null);
    setSelfie(null);
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfiePreview(null);
    setRespostas({});
    setErrors({});
    stopCamera();
  };

  useEffect(() => {
    if (open) {
      setCidade(profile?.cidade ?? "");
      // carregar perguntas customizadas do serviço
      if (servicoId) {
        supabase
          .from("servico_perguntas")
          .select("id, texto, tipo, opcoes, obrigatoria, ordem")
          .eq("servico_id", servicoId)
          .order("ordem", { ascending: true })
          .then(({ data }) => {
            const items = (data || []).map((p: any) => ({
              id: p.id,
              texto: p.texto,
              tipo: p.tipo,
              opcoes: Array.isArray(p.opcoes) ? p.opcoes : [],
              obrigatoria: p.obrigatoria,
            })) as Pergunta[];
            setPerguntas(items);
          });
      }
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, servicoId]);

  useEffect(() => {
    return () => {
      if (docPreview) URL.revokeObjectURL(docPreview);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const setDocFile = (file: File) => {
    if (docPreview) URL.revokeObjectURL(docPreview);
    setDocumento(file);
    if (file.type.startsWith("image/")) {
      setDocPreview(URL.createObjectURL(file));
    } else {
      setDocPreview(null);
    }
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
    setDocFile(file);
  };

  const openCamera = async (mode: "documento" | "selfie") => {
    setCameraStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Seu dispositivo não suporta captura de câmera");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode === "selfie" ? "user" : "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(mode);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: any) {
      toast.error(
        err?.name === "NotAllowedError"
          ? "Permissão de câmera negada"
          : "Não foi possível acessar a câmera"
      );
    } finally {
      setCameraStarting(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const mode = cameraOpen;
    if (!video || !video.videoWidth || !mode) {
      toast.error("Câmera ainda não está pronta");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Falha ao capturar imagem");
          return;
        }
        const file = new File([blob], `${mode}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        if (file.size > MAX_DOC_BYTES) {
          toast.error("Imagem capturada muito grande");
          return;
        }
        if (mode === "documento") {
          setDocFile(file);
          setErrors((er) => {
            const n = { ...er };
            delete n.documento;
            return n;
          });
        } else {
          if (selfiePreview) URL.revokeObjectURL(selfiePreview);
          setSelfie(file);
          setSelfiePreview(URL.createObjectURL(file));
          setErrors((er) => {
            const n = { ...er };
            delete n.selfie;
            return n;
          });
        }
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
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
    });

    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.errors) {
        const k = issue.path[0] as string;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
    }

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
        documento_url: path,
      });

      if (insertError) {
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
            <Label>Documento (RG ou CNH) *</Label>

            {cameraOpen ? (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full rounded-md bg-black object-cover"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={capturePhoto} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Capturar foto
                  </Button>
                  <Button type="button" variant="outline" onClick={stopCamera}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label
                    htmlFor="documento"
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-muted/30 p-4 text-sm transition hover:bg-muted/60"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Enviar arquivo</span>
                    <Input
                      id="documento"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleDocChange}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openCamera("documento")}
                    disabled={cameraStarting}
                    className="h-auto justify-start gap-3 border-dashed bg-muted/30 p-4 text-sm font-normal hover:bg-muted/60"
                  >
                    {cameraStarting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Tirar foto agora</span>
                  </Button>
                </div>

                {documento && (
                  <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3 text-sm">
                    {docPreview ? (
                      <img
                        src={docPreview}
                        alt="Pré-visualização do documento"
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <FileCheck2 className="h-5 w-5 text-primary" />
                    )}
                    <span className="flex-1 truncate">{documento.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (docPreview) URL.revokeObjectURL(docPreview);
                        setDocumento(null);
                        setDocPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP ou PDF — até 5MB
                </p>
              </>
            )}

            {errors.documento && <p className="text-sm text-destructive">{errors.documento}</p>}
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

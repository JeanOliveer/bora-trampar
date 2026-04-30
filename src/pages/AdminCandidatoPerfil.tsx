import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Phone, MapPin, FileText, Calendar, CreditCard, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import RankedAvatar from "@/components/RankedAvatar";
import AvaliacaoDialog from "@/components/AvaliacaoDialog";
import { getNivel } from "@/lib/career";
import { cn } from "@/lib/utils";

type Candidatura = {
  id: string;
  user_id: string;
  servico_id: string;
  telefone: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  documento_url: string;
  status: string;
  created_at: string;
};

type Profile = {
  user_id: string;
  nome_completo: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  estado_civil: string | null;
  cidade: string | null;
  estado: string | null;
  chave_pix: string | null;
};

type Servico = { id: string; titulo: string };

const initials = (name: string | null | undefined) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value || "—"}</div>
    </div>
  </div>
);

const AdminCandidatoPerfil = () => {
  const { id: candidaturaId } = useParams<{ id: string }>();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cand, setCand] = useState<Candidatura | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [servico, setServico] = useState<Servico | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/servicos");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!candidaturaId || !isAdmin) return;
      setLoading(true);

      const { data: c } = await supabase
        .from("candidaturas")
        .select("*")
        .eq("id", candidaturaId)
        .maybeSingle();
      const candidatura = c as Candidatura | null;
      setCand(candidatura);

      if (candidatura) {
        const [{ data: p }, { data: s }] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", candidatura.user_id).maybeSingle(),
          supabase.from("servicos").select("id, titulo").eq("id", candidatura.servico_id).maybeSingle(),
        ]);
        setProfile(p as Profile | null);
        setServico(s as Servico | null);

        if (candidatura.documento_url) {
          const { data: signed } = await supabase.storage
            .from("documentos-candidatura")
            .createSignedUrl(candidatura.documento_url, 60 * 10);
          setDocUrl(signed?.signedUrl ?? null);
        }
      }

      setLoading(false);
    };
    load();
  }, [candidaturaId, isAdmin]);

  if (authLoading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex-1 py-10">Carregando perfil...</main>
      </div>
    );
  }

  if (!cand) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container flex-1 py-10">
          <p className="text-muted-foreground">Candidatura não encontrada.</p>
        </main>
      </div>
    );
  }

  const nome = profile?.nome_completo || "Sem nome";
  const enderecoCompleto = [
    [cand.rua, cand.numero].filter(Boolean).join(", "),
    cand.bairro,
    [cand.cidade, profile?.estado].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <Link
          to={`/admin/servicos/${cand.servico_id}/candidatos`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para candidatos
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="mb-3 h-24 w-24">
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {initials(nome)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{nome}</CardTitle>
              <Badge variant="secondary" className="mt-2">{cand.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={Phone} label="Telefone" value={cand.telefone} />
              <InfoRow icon={MapPin} label="Endereço" value={enderecoCompleto} />
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" /> Dados cadastrais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={User} label="Nome completo" value={profile?.nome_completo} />
                <InfoRow icon={CreditCard} label="CPF" value={profile?.cpf} />
                <InfoRow icon={Calendar} label="Data de nascimento" value={profile?.data_nascimento} />
                <InfoRow icon={User} label="Estado civil" value={profile?.estado_civil} />
                <InfoRow
                  icon={MapPin}
                  label="Cidade / Estado do perfil"
                  value={[profile?.cidade, profile?.estado].filter(Boolean).join(" - ")}
                />
                <InfoRow icon={CreditCard} label="Chave PIX" value={profile?.chave_pix} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" /> Documento enviado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {docUrl ? (
                  <div className="space-y-3">
                    {/\.(jpe?g|png|webp)$/i.test(cand.documento_url) ? (
                      <img
                        src={docUrl}
                        alt="Documento do candidato"
                        className="max-h-[480px] w-full rounded-md border object-contain"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Pré-visualização não disponível para este formato.
                      </p>
                    )}
                    <Button asChild variant="outline">
                      <a href={docUrl} target="_blank" rel="noopener noreferrer">
                        Abrir documento em nova aba
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Documento indisponível.</p>
                )}
              </CardContent>
            </Card>

            {servico && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Serviço da candidatura</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{servico.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    Candidatura enviada em {new Date(cand.created_at).toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCandidatoPerfil;

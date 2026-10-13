import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Users, Phone, MapPin, ExternalLink, CheckCircle2, Star, XCircle, MessageCircle, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import RankedAvatar from "@/components/RankedAvatar";
import { getNivel } from "@/lib/career";
import VoltarButton from "@/components/VoltarButton";

type Candidatura = {
  id: string;
  user_id: string;
  telefone: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  documento_url: string;
  status: string;
  created_at: string;
  aprovada_em: string | null;
};

type ProfileLite = {
  user_id: string;
  nome_completo: string | null;
  cidade: string | null;
  estado: string | null;
  pontuacao: number;
};

type Servico = {
  id: string;
  titulo: string;
  categoria: string | null;
  cidade: string | null;
  estado: string | null;
  data_servico: string | null;
  horario: string | null;
};

type Stats = { user_id: string; media_estrelas: number | null; total_avaliacoes: number; pct_presenca: number | null };

const formatarData = (d: string | null) => {
  if (!d) return null;
  const txt = new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

const initials = (name: string | null | undefined) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
};

const AdminCandidatos = () => {
  const { id: servicoId } = useParams<{ id: string }>();
  const { user, isAdmin: isAdminRole, isContratante, loading: authLoading, profileLoading } = useAuth();
  const isAdmin = isAdminRole || isContratante;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [servico, setServico] = useState<Servico | null>(null);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileLite>>({});
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [conversas, setConversas] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (profileLoading) return;
    if (!isAdmin) navigate("/inicio", { replace: true });
  }, [authLoading, profileLoading, user, isAdmin, navigate]);

  const load = useCallback(async (cancelledRef?: { value: boolean }) => {
    if (!servicoId || !isAdmin) return;
    setLoading(true);
    setErrorMessage(null);

    const [{ data: srv, error: srvError }, { data: cands, error: candError }] = await Promise.all([
      supabase
        .from("servicos")
        .select("id, titulo, categoria, cidade, estado, data_servico, horario")
        .eq("id", servicoId)
        .maybeSingle(),
      supabase
        .from("candidaturas")
        .select("id, user_id, telefone, cidade, bairro, rua, numero, documento_url, status, created_at, aprovada_em")
        .eq("servico_id", servicoId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (cancelledRef?.value) return;
    if (srvError || candError) {
      setErrorMessage("Não foi possível carregar os candidatos.");
      setLoading(false);
      return;
    }
    setServico((srv as Servico) || null);

    const list = (cands as Candidatura[]) || [];
    setCandidaturas(list);

    const ids = Array.from(new Set(list.map((c) => c.user_id)));
    if (ids.length > 0) {
      const [{ data: profs }, { data: st }, { data: convs }] = await Promise.all([
        supabase.from("profiles").select("user_id, nome_completo, cidade, estado, pontuacao").in("user_id", ids),
        supabase.rpc("estatisticas_trabalhadores", { _ids: ids }),
        supabase.from("chat_conversas").select("id, candidatura_id").eq("servico_id", servicoId),
      ]);
      if (cancelledRef?.value) return;
      const map: Record<string, ProfileLite> = {};
      (profs as ProfileLite[] | null)?.forEach((p) => (map[p.user_id] = p));
      setProfilesMap(map);
      const sMap: Record<string, Stats> = {};
      ((st as Stats[] | null) ?? []).forEach((s) => (sMap[s.user_id] = s));
      setStats(sMap);
      const cMap: Record<string, string> = {};
      (convs ?? []).forEach((cv) => (cMap[cv.candidatura_id] = cv.id));
      setConversas(cMap);
    } else {
      setProfilesMap({});
    }

    setLoading(false);
  }, [servicoId, isAdmin]);

  useEffect(() => {
    const cancelledRef = { value: false };
    load(cancelledRef);
    return () => { cancelledRef.value = true; };
  }, [load]);

  const contratar = async (c: Candidatura) => {
    if (c.status === "aprovada" || !user || !servicoId) return;
    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("candidaturas")
      .update({ status: "aprovada", aprovada_em: agora })
      .eq("id", c.id);
    if (error) {
      toast.error("Erro ao aceitar candidato.");
      return;
    }
    const { data: conv, error: convErr } = await supabase
      .from("chat_conversas")
      .upsert(
        { candidatura_id: c.id, servico_id: servicoId, contratante_id: user.id, trabalhador_id: c.user_id },
        { onConflict: "candidatura_id", ignoreDuplicates: false },
      )
      .select("id")
      .single();
    setCandidaturas((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "aprovada", aprovada_em: agora } : x)));
    if (convErr || !conv) {
      toast.success("Candidato aceito!");
      return;
    }
    setConversas((prev) => ({ ...prev, [c.id]: conv.id }));
    toast.success("Candidato aceito! O chat foi liberado.", {
      action: { label: "Abrir chat", onClick: () => navigate(`/mensagens/${conv.id}`) },
    });
  };

  const rejeitar = async (c: Candidatura) => {
    const { error } = await supabase.from("candidaturas").update({ status: "rejeitada" }).eq("id", c.id);
    if (error) {
      toast.error("Erro ao recusar candidato.");
      return;
    }
    toast("Candidatura recusada.");
    setCandidaturas((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: "rejeitada" } : x)));
  };

  if (authLoading || profileLoading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <VoltarButton to="/admin" />

        <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{servico?.titulo ?? "Serviço"}</h1>
            {servico?.data_servico && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <CalendarDays className="h-4 w-4" />
                {formatarData(servico.data_servico)}
                {servico.horario ? ` • ${servico.horario}` : ""}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {[servico?.categoria, servico?.cidade, servico?.estado].filter(Boolean).join(" • ") || "Candidatos"}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-primary/10 px-4 py-3 text-primary">
            <Users className="h-6 w-6" />
            <div>
              <div className="text-2xl font-bold leading-none">{candidaturas.length}</div>
              <div className="text-xs uppercase tracking-wide text-primary/80">
                {candidaturas.length === 1 ? "candidato" : "candidatos"}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando candidatos...</p>
        ) : errorMessage ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" onClick={() => load()}>Tentar novamente</Button>
            </CardContent>
          </Card>
        ) : candidaturas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum candidato ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Assim que alguém se candidatar, aparecerá aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidaturas.map((c) => {
              const p = profilesMap[c.user_id];
              const nome = p?.nome_completo || "Sem nome";
              const pts = p?.pontuacao ?? 0;
              const nivel = getNivel(pts);
              return (
                <Card key={c.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <RankedAvatar nome={nome} pontuacao={pts} size="md" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">{nome}</CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {s?.media_estrelas != null ? Number(s.media_estrelas).toFixed(1) : "Novo"}
                          {s && s.total_avaliacoes > 0 && (
                            <span className="font-normal text-muted-foreground">({s.total_avaliacoes})</span>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                          {s?.pct_presenca != null ? `${s.pct_presenca}% presença` : "Sem histórico"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge className={`text-xs ${nivel.badgeClass}`}>{nivel.label} • {pts} pts</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{c.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {[c.cidade, p?.estado].filter(Boolean).join(" - ") || c.cidade}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {c.status === "aprovada" || c.status === "concluida" ? (
                        <>
                          <div className="flex items-center justify-center gap-1 rounded-md bg-emerald-500/10 px-2 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            {c.status === "concluida" ? "Serviço concluído" : "Aceito"}
                          </div>
                          {conversas[c.id] && (
                            <Button className="w-full" onClick={() => navigate(`/mensagens/${conversas[c.id]}`)}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Mensagens
                            </Button>
                          )}
                        </>
                      ) : c.status === "rejeitada" ? (
                        <div className="flex items-center justify-center gap-1 rounded-md bg-destructive/10 px-2 py-2 text-xs font-medium text-destructive">
                          <XCircle className="h-4 w-4" />
                          Recusado
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="destructive" onClick={() => rejeitar(c)}>
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Recusar
                          </Button>
                          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => contratar(c)}>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Aceitar
                          </Button>
                        </div>
                      )}
                      <Link to={`/admin/candidatos/${c.id}`}>
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver perfil
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCandidatos;

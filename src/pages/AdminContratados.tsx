import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import RankedAvatar from "@/components/RankedAvatar";
import { getNivel } from "@/lib/career";

type Candidatura = {
  id: string;
  user_id: string;
  servico_id: string;
  telefone: string;
  cidade: string;
  status: string;
  aprovada_em: string | null;
  aprovada_pela_empresa: boolean;
  checkin_em: string | null;
  presenca_confirmada_em: string | null;
};

type Servico = { id: string; titulo: string; cidade: string | null; estado: string | null; data_servico: string | null; horario: string | null };
type ProfileLite = { user_id: string; nome_completo: string | null; pontuacao: number };

const AdminContratados = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [candsByServico, setCandsByServico] = useState<Record<string, Candidatura[]>>({});
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileLite>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/servicos");
    }
  }, [authLoading, user, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    const { data: cands } = await supabase
      .from("candidaturas")
      .select("*")
      .eq("status", "aprovada")
      .order("aprovada_em", { ascending: false });
    const list = (cands as Candidatura[]) || [];

    const servicoIds = Array.from(new Set(list.map((c) => c.servico_id)));
    const userIds = Array.from(new Set(list.map((c) => c.user_id)));

    const [{ data: srvs }, { data: profs }] = await Promise.all([
      servicoIds.length
        ? supabase.from("servicos").select("id, titulo, cidade, estado, data_servico, horario").in("id", servicoIds)
        : Promise.resolve({ data: [] as Servico[] }),
      userIds.length
        ? supabase.from("profiles").select("user_id, nome_completo, pontuacao").in("user_id", userIds)
        : Promise.resolve({ data: [] as ProfileLite[] }),
    ]);

    const grouped: Record<string, Candidatura[]> = {};
    list.forEach((c) => {
      grouped[c.servico_id] = grouped[c.servico_id] || [];
      grouped[c.servico_id].push(c);
    });
    const pmap: Record<string, ProfileLite> = {};
    (profs as ProfileLite[] | null)?.forEach((p) => (pmap[p.user_id] = p));

    setServicos((srvs as Servico[]) || []);
    setCandsByServico(grouped);
    setProfilesMap(pmap);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const confirmarChegada = async (c: Candidatura) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("candidaturas")
      .update({
        presenca_confirmada_em: now,
        aprovada_pela_empresa: true,
        checkin_em: c.checkin_em || now,
      })
      .eq("id", c.id);
    if (error) {
      toast.error("Erro ao confirmar chegada.");
      return;
    }
    toast.success("Chegada confirmada!");
    load();
  };

  if (authLoading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  const totalContratados = Object.values(candsByServico).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para o painel
        </Link>

        <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Contratados</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos os trabalhadores contratados, agrupados por serviço.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-primary/10 px-4 py-3 text-primary">
            <UserCheck className="h-6 w-6" />
            <div>
              <div className="text-2xl font-bold leading-none">{totalContratados}</div>
              <div className="text-xs uppercase tracking-wide text-primary/80">contratados</div>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : servicos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum trabalhador contratado ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Aprove candidatos na lista de candidatos para vê-los aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {servicos.map((s) => {
              const lista = candsByServico[s.id] || [];
              return (
                <Card key={s.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{s.titulo}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {[s.cidade, s.estado].filter(Boolean).join(" - ")}
                          {s.data_servico && ` • ${new Date(s.data_servico).toLocaleDateString("pt-BR")}`}
                          {s.horario && ` • ${s.horario}`}
                        </p>
                      </div>
                      <Badge variant="secondary">{lista.length} contratado(s)</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lista.map((c) => {
                      const p = profilesMap[c.user_id];
                      const nome = p?.nome_completo || "Sem nome";
                      const pts = p?.pontuacao ?? 0;
                      const nivel = getNivel(pts);
                      const chegou = !!c.presenca_confirmada_em;
                      return (
                        <div
                          key={c.id}
                          className={`rounded-lg border p-4 transition-colors ${
                            chegou ? "border-emerald-500/40 bg-emerald-500/5" : "bg-card"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RankedAvatar nome={nome} pontuacao={pts} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">{nome}</div>
                              <Badge className={`mt-1 text-xs ${nivel.badgeClass}`}>
                                {nivel.label} • {pts} pts
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {c.telefone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {c.cidade}
                            </div>
                          </div>
                          <div className="mt-3">
                            {chegou ? (
                              <div className="flex items-center justify-center gap-1 rounded-md bg-emerald-500/10 px-2 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Chegada confirmada
                              </div>
                            ) : (
                              <Button size="sm" className="w-full" onClick={() => confirmarChegada(c)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirmar chegada
                              </Button>
                            )}
                          </div>
                          <Link
                            to={`/admin/candidatos/${c.id}`}
                            className="mt-2 block text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                          >
                            Ver perfil completo
                          </Link>
                        </div>
                      );
                    })}
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

export default AdminContratados;

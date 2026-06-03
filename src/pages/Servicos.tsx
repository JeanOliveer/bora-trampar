import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, MapPin, Calendar, DollarSign, Clock, Users, CheckCircle2, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";
import CandidaturaDialog from "@/components/CandidaturaDialog";
import ProgressoServico from "@/components/ProgressoServico";
import { StatusBadge } from "@/components/StatusBadge";

type Servico = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  valor: number | null;
  cidade: string | null;
  estado: string | null;
  data_servico: string | null;
  horario: string | null;
  requisitos: string | null;
  empresa_nome: string | null;
};

type Aprovada = {
  id: string;
  status: string;
  presenca_confirmada_em: string | null;
  chegada_confirmada_em: string | null;
  servico: Servico;
};

const Servicos = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [aprovadas, setAprovadas] = useState<Aprovada[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  const fetchAprovadas = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("candidaturas")
      .select(
        "id, status, presenca_confirmada_em, chegada_confirmada_em, servico:servicos(id, titulo, descricao, categoria, valor, cidade, estado, data_servico, horario, requisitos, empresa_nome)"
      )
      .eq("user_id", user.id)
      .in("status", ["aprovada", "concluida"])
      .order("created_at", { ascending: false });
    setAprovadas((data as unknown as Aprovada[]) || []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: svc }] = await Promise.all([
        supabase
          .from("servicos")
          .select("*")
          .eq("ativo", true)
          .order("created_at", { ascending: false }),
        fetchAprovadas(),
      ]);
      if (cancelled) return;
      setServicos((svc as Servico[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, fetchAprovadas]);

  // Realtime: atualiza quando a empresa confirmar chegada / status mudar
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`cand-user-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidaturas", filter: `user_id=eq.${user.id}` },
        () => fetchAprovadas()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAprovadas]);

  const confirmarPresenca = async (cId: string) => {
    const { error } = await supabase
      .from("candidaturas")
      .update({ presenca_confirmada_em: new Date().toISOString() })
      .eq("id", cId);
    if (error) toast.error("Erro ao confirmar presença");
    else {
      toast.success("Presença confirmada!");
      fetchAprovadas();
    }
  };

  const totalDisponiveis = servicos.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hidden md:block">
        <Header />
      </div>
      <AppMobileHeader
        eyebrow="UaiTrampo"
        title="Serviços"
        subtitle={`${totalDisponiveis} ${totalDisponiveis === 1 ? "vaga disponível" : "vagas disponíveis"}`}
      />
      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="mt-2 text-muted-foreground">Veja as diárias disponíveis e acompanhe seus serviços aprovados.</p>
        </div>

        <Tabs defaultValue="disponiveis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:max-w-sm">
            <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
            <TabsTrigger value="aprovados">
              Aprovados {aprovadas.length > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{aprovadas.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disponiveis">
            {loading ? (
              <p className="text-muted-foreground">Carregando serviços...</p>
            ) : servicos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">Nenhum serviço disponível</p>
                  <p className="mt-1 text-sm text-muted-foreground">Volte em breve para novas oportunidades.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {servicos.map((s) => (
                  <Card key={s.id} className="rounded-2xl shadow-[var(--shadow-card)] transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{s.titulo}</CardTitle>
                        {s.categoria && <Badge variant="secondary">{s.categoria}</Badge>}
                      </div>
                      {s.descricao && <CardDescription className="line-clamp-2">{s.descricao}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {s.valor != null && (
                        <div className="flex items-center gap-2 font-medium text-primary">
                          <DollarSign className="h-4 w-4" />
                          R$ {Number(s.valor).toFixed(2)}
                        </div>
                      )}
                      {(s.cidade || s.estado) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {[s.cidade, s.estado].filter(Boolean).join(" - ")}
                        </div>
                      )}
                      {s.data_servico && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(s.data_servico).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      {s.horario && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {s.horario}
                        </div>
                      )}
                      {s.requisitos && (
                        <p className="pt-2 text-xs text-muted-foreground">
                          <strong>Requisitos:</strong> {s.requisitos}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      {!isAdmin && (
                        <Button className="w-full" onClick={() => setServicoSelecionado(s)}>
                          Candidatar-se
                        </Button>
                      )}
                      {isAdmin && (
                        <Link to={`/admin/servicos/${s.id}/candidatos`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Users className="mr-2 h-4 w-4" />
                            Candidatos
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aprovados">
            {aprovadas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">Nenhum serviço aprovado ainda</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quando uma empresa aprovar sua candidatura, ela aparecerá aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {aprovadas.map((a) => {
                  const presenca = !!a.presenca_confirmada_em;
                  const chegada = !!a.chegada_confirmada_em;
                  const concluida = a.status === "concluida";
                  return (
                    <Card key={a.id} className="rounded-2xl shadow-[var(--shadow-card)]">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <CardTitle className="truncate text-lg">{a.servico.titulo}</CardTitle>
                            {a.servico.empresa_nome && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3" /> {a.servico.empresa_nome}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={a.status} presenca={presenca} chegada={chegada} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {a.servico.data_servico && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(a.servico.data_servico).toLocaleDateString("pt-BR")}
                            {a.servico.horario && <span className="ml-1">• {a.servico.horario}</span>}
                          </div>
                        )}
                        {(a.servico.cidade || a.servico.estado) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {[a.servico.cidade, a.servico.estado].filter(Boolean).join(" - ")}
                          </div>
                        )}
                        <div className="pt-3">
                          <ProgressoServico
                            aprovada
                            presencaConfirmada={presenca}
                            chegadaConfirmada={chegada}
                            concluida={concluida}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        {!presenca ? (
                          <Button className="w-full" onClick={() => confirmarPresenca(a.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirmar Presença
                          </Button>
                        ) : !chegada ? (
                          <Button className="w-full" variant="outline" disabled>
                            Aguardando empresa confirmar chegada
                          </Button>
                        ) : concluida ? (
                          <Button className="w-full" variant="outline" disabled>
                            Serviço concluído
                          </Button>
                        ) : (
                          <Button className="w-full" variant="outline" disabled>
                            Chegada confirmada
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <CandidaturaDialog
        open={!!servicoSelecionado}
        onOpenChange={(o) => !o && setServicoSelecionado(null)}
        servicoId={servicoSelecionado?.id ?? ""}
        servicoTitulo={servicoSelecionado?.titulo ?? ""}
      />
      <BottomTabBar />
    </div>
  );
};

export default Servicos;

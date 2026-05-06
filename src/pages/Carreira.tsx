import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, TrendingUp, Award, MessageSquare, Building2, MapPin, MapPinCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import RankedAvatar from "@/components/RankedAvatar";
import AvaliacaoEmpresaDialog from "@/components/AvaliacaoEmpresaDialog";
import { getNivel, proximoLimite } from "@/lib/career";
import { cn } from "@/lib/utils";

type Avaliacao = {
  id: string;
  estrelas: number;
  justificativa: string | null;
  pontos: number;
  created_at: string;
  servico_id: string;
};

type ServicoLite = { id: string; titulo: string; empresa_nome: string | null };

type AvalPendente = {
  candidatura_id: string;
  servico_id: string;
  trabalhador_id: string;
  servico_titulo: string;
  empresa_nome: string | null;
};

const StarRow = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn("h-4 w-4", n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
      />
    ))}
  </div>
);

const Carreira = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pontuacao, setPontuacao] = useState(0);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [servicosMap, setServicosMap] = useState<Record<string, ServicoLite>>({});
  const [loading, setLoading] = useState(true);

  const [pendentes, setPendentes] = useState<AvalPendente[]>([]);
  const [alvoPendente, setAlvoPendente] = useState<AvalPendente | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      const { data: prof } = await supabase
        .from("profiles")
        .select("pontuacao")
        .eq("user_id", user.id)
        .maybeSingle();
      setPontuacao(((prof as { pontuacao?: number } | null)?.pontuacao) ?? 0);

      const { data: avals } = await supabase
        .from("avaliacoes")
        .select("id, estrelas, justificativa, pontos, created_at, servico_id")
        .eq("trabalhador_id", user.id)
        .order("created_at", { ascending: false });

      const list = (avals as Avaliacao[]) || [];
      setAvaliacoes(list);

      const ids = Array.from(new Set(list.map((a) => a.servico_id)));
      const map: Record<string, ServicoLite> = {};
      if (ids.length > 0) {
        const { data: srvs } = await supabase
          .from("servicos")
          .select("id, titulo, empresa_nome")
          .in("id", ids);
        (srvs as ServicoLite[] | null)?.forEach((s) => (map[s.id] = s));
        setServicosMap(map);
      }

      // Avaliações pendentes do trabalhador para a empresa:
      // candidaturas onde a empresa já avaliou e o trabalhador ainda não respondeu
      const { data: recebidas } = await supabase
        .from("avaliacoes")
        .select("candidatura_id, servico_id")
        .eq("trabalhador_id", user.id)
        .eq("tipo", "empresa_para_trabalhador");

      const candIds = ((recebidas as Array<{ candidatura_id: string; servico_id: string }> | null) ?? []).map((r) => r.candidatura_id);

      if (candIds.length > 0) {
        const { data: minhas } = await supabase
          .from("avaliacoes")
          .select("candidatura_id")
          .eq("avaliador_id", user.id)
          .eq("tipo", "trabalhador_para_empresa")
          .in("candidatura_id", candIds);
        const jaFeitas = new Set(((minhas as Array<{ candidatura_id: string }> | null) ?? []).map((m) => m.candidatura_id));

        const aFazer = ((recebidas as Array<{ candidatura_id: string; servico_id: string }>) ?? []).filter(
          (r) => !jaFeitas.has(r.candidatura_id)
        );

        if (aFazer.length > 0) {
          const srvIds = Array.from(new Set(aFazer.map((a) => a.servico_id)));
          const missing = srvIds.filter((sid) => !map[sid]);
          if (missing.length > 0) {
            const { data: extra } = await supabase
              .from("servicos")
              .select("id, titulo, empresa_nome")
              .in("id", missing);
            (extra as ServicoLite[] | null)?.forEach((s) => (map[s.id] = s));
            setServicosMap({ ...map });
          }
          setPendentes(
            aFazer.map((a) => ({
              candidatura_id: a.candidatura_id,
              servico_id: a.servico_id,
              trabalhador_id: user.id,
              servico_titulo: map[a.servico_id]?.titulo ?? "Serviço",
              empresa_nome: map[a.servico_id]?.empresa_nome ?? null,
            }))
          );
        } else {
          setPendentes([]);
        }
      } else {
        setPendentes([]);
      }

      setLoading(false);
    };
    load();
  }, [user, refreshKey]);

  const nivel = getNivel(pontuacao);
  const total = avaliacoes.length;
  const media = total > 0 ? avaliacoes.reduce((s, a) => s + a.estrelas, 0) / total : 0;
  const limite = proximoLimite(pontuacao);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <Link to="/perfil" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Carreira</h1>
          <p className="text-sm text-muted-foreground">
            Sua reputação cresce conforme as avaliações dos serviços que você realiza.
          </p>
        </div>

        <Card className={cn("mb-6 border-2", nivel.borderClass)}>
          <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
            <RankedAvatar nome={profile?.nome_completo} pontuacao={pontuacao} size="xl" />
            <div className="flex-1 text-center sm:text-left">
              <Badge className={cn("mb-2", nivel.badgeClass)}>{nivel.label}</Badge>
              <div className="text-4xl font-bold leading-none">{pontuacao}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">pontos totais</div>
              {limite && (
                <div className="mt-4 max-w-sm">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Próximo nível</span>
                    <span>
                      faltam <strong>{limite.restante}</strong> pts ({limite.alvo})
                    </span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, ((limite.alvo - limite.restante) / limite.alvo) * 100))} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Nível atual</div>
                <div className="font-semibold">{nivel.label}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Média de estrelas</div>
                <div className="font-semibold">{total > 0 ? media.toFixed(1) : "—"}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xs uppercase text-muted-foreground">Avaliações</div>
                <div className="font-semibold">{total}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {pendentes.length > 0 && (
          <Card className="mb-6 border-2 border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" /> Avalie a empresa
              </CardTitle>
              <CardDescription>
                Você concluiu {pendentes.length === 1 ? "um serviço" : `${pendentes.length} serviços`}. Sua opinião sobre a empresa ajuda toda a comunidade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendentes.map((p) => (
                <div
                  key={p.candidatura_id}
                  className="flex flex-col gap-2 rounded-md border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.servico_titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      Empresa: {p.empresa_nome ?? "—"} • Serviço finalizado
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setAlvoPendente(p)}>
                    <Star className="mr-1 h-4 w-4" /> Avaliar empresa
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" /> Histórico de avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : avaliacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você ainda não recebeu avaliações. Conclua serviços para começar a construir sua reputação.
              </p>
            ) : (
              <ul className="space-y-4">
                {avaliacoes.map((a) => (
                  <li key={a.id} className="rounded-md border p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <StarRow value={a.estrelas} />
                        <span className="text-sm font-medium">
                          {servicosMap[a.servico_id]?.titulo ?? "Serviço"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={a.pontos >= 0 ? "text-emerald-700" : "text-red-700"}
                        >
                          {a.pontos > 0 ? `+${a.pontos}` : a.pontos} pts
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    {a.justificativa && (
                      <p className="text-sm text-muted-foreground">"{a.justificativa}"</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      {alvoPendente && (
        <AvaliacaoEmpresaDialog
          open={!!alvoPendente}
          onOpenChange={(o) => !o && setAlvoPendente(null)}
          candidaturaId={alvoPendente.candidatura_id}
          servicoId={alvoPendente.servico_id}
          trabalhadorId={alvoPendente.trabalhador_id}
          empresaNome={alvoPendente.empresa_nome}
          onSuccess={() => {
            setAlvoPendente(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
};

export default Carreira;

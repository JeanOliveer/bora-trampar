import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, TrendingUp, Award, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import RankedAvatar from "@/components/RankedAvatar";
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

type ServicoLite = { id: string; titulo: string };

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
      if (ids.length > 0) {
        const { data: srvs } = await supabase
          .from("servicos")
          .select("id, titulo")
          .in("id", ids);
        const map: Record<string, ServicoLite> = {};
        (srvs as ServicoLite[] | null)?.forEach((s) => (map[s.id] = s));
        setServicosMap(map);
      }
      setLoading(false);
    };
    load();
  }, [user]);

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
    </div>
  );
};

export default Carreira;

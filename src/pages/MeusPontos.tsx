import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Lock, Check, Trophy, Sparkles, TrendingUp, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";
import VoltarButton from "@/components/VoltarButton";
import { getNivel, type NivelKey } from "@/lib/career";
import { cn } from "@/lib/utils";

type Nivel = {
  key: NivelKey;
  label: string;
  pontos: number;
  dot: string;
  ring: string;
  text: string;
};

// Ordem crescente de progressão (mesmos limiares de getNivel)
const NIVEIS: Nivel[] = [
  { key: "pessimo", label: "Péssimo Funcionário", pontos: -5, dot: "bg-red-600", ring: "ring-red-600", text: "text-red-700" },
  { key: "ruim", label: "Funcionário Ruim", pontos: -3, dot: "bg-orange-500", ring: "ring-orange-500", text: "text-orange-700" },
  { key: "padrao", label: "Padrão", pontos: 0, dot: "bg-muted-foreground/60", ring: "ring-muted-foreground/40", text: "text-muted-foreground" },
  { key: "otimo", label: "Funcionário Ótimo", pontos: 5, dot: "bg-blue-500", ring: "ring-blue-500", text: "text-blue-700" },
  { key: "excelente", label: "Funcionário Excelente", pontos: 10, dot: "bg-amber-400", ring: "ring-amber-400", text: "text-amber-700" },
];

const ESTRELAS_PONTOS = [
  { estrelas: 1, pontos: -2 },
  { estrelas: 2, pontos: -1 },
  { estrelas: 3, pontos: 1 },
  { estrelas: 4, pontos: 2 },
  { estrelas: 5, pontos: 3 },
];

const formatPontos = (p: number) => `${p > 0 ? "+" : ""}${p} ${Math.abs(p) === 1 ? "ponto" : "pontos"}`;

const StarRow = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={cn("h-3.5 w-3.5", n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
    ))}
  </div>
);

type HistItem = {
  id: string;
  titulo: string;
  data: string;
  estrelas: number;
  pontos: number;
  totalDepois: number;
};

const MeusPontos = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pontuacao, setPontuacao] = useState(0);
  const [historico, setHistorico] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
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
      const pts = ((prof as { pontuacao?: number } | null)?.pontuacao) ?? 0;
      setPontuacao(pts);

      const { data: avals } = await supabase
        .from("avaliacoes")
        .select("id, estrelas, pontos, created_at, servico_id, tipo")
        .eq("trabalhador_id", user.id)
        .eq("tipo", "empresa_para_trabalhador")
        .order("created_at", { ascending: true });

      const lista = ((avals as Array<{
        id: string; estrelas: number; pontos: number; created_at: string; servico_id: string;
      }> | null) ?? []);

      const map: Record<string, string> = {};
      const ids = Array.from(new Set(lista.map((a) => a.servico_id)));
      if (ids.length > 0) {
        const { data: srvs } = await supabase.from("servicos").select("id, titulo").in("id", ids);
        ((srvs as Array<{ id: string; titulo: string }> | null) ?? []).forEach((s) => (map[s.id] = s.titulo));
      }

      let acumulado = 0;
      const comTotal: HistItem[] = lista.map((a) => {
        acumulado += a.pontos;
        return {
          id: a.id,
          titulo: map[a.servico_id] ?? "Serviço",
          data: a.created_at,
          estrelas: a.estrelas,
          pontos: a.pontos,
          totalDepois: acumulado,
        };
      });

      setHistorico(comTotal.reverse());
      setLoading(false);
    };
    load();
  }, [user]);

  const nivelAtual = getNivel(pontuacao);
  const idxAtual = useMemo(() => NIVEIS.findIndex((n) => n.key === nivelAtual.key), [nivelAtual.key]);
  const proximo = idxAtual >= 0 && idxAtual < NIVEIS.length - 1 ? NIVEIS[idxAtual + 1] : null;
  const base = NIVEIS[Math.max(0, idxAtual)].pontos;
  const faltam = proximo ? Math.max(0, proximo.pontos - pontuacao) : 0;
  const progresso = proximo
    ? Math.max(0, Math.min(100, ((pontuacao - base) / (proximo.pontos - base)) * 100))
    : 100;

  if (authLoading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hidden md:block">
        <Header />
      </div>
      <AppMobileHeader
        eyebrow="UaiTrampo"
        title="Meus Pontos"
        subtitle="Sua jornada de progressão"
        backTo="/carreira"
      />

      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <VoltarButton to="/carreira" className="hidden md:inline-flex" />

        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold">Meus Pontos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua evolução de nível na UaiTrampo.</p>
        </div>

        {/* 1. Nível atual */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className={cn("mb-6 overflow-hidden border-2", nivelAtual.borderClass)}>
            <div className="bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-90">
                <Trophy className="h-4 w-4" /> Nível Atual
              </div>
              <div className="mt-1 text-2xl font-bold">{nivelAtual.label}</div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold leading-none">{pontuacao}</span>
                <span className="pb-1 text-sm opacity-90">
                  {Math.abs(pontuacao) === 1 ? "ponto" : "pontos"}
                </span>
              </div>
            </div>
            <CardContent className="p-6">
              {proximo ? (
                <>
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{NIVEIS[Math.max(0, idxAtual)].label}</span>
                    <span>{proximo.label}</span>
                  </div>
                  <Progress value={progresso} className="h-3" />
                  <p className="mt-3 text-sm font-medium">
                    Faltam <strong className="text-primary">{faltam}</strong>{" "}
                    {faltam === 1 ? "ponto" : "pontos"} para {proximo.label}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-amber-800">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">Você alcançou o nível máximo!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 2 e 3. Caminho de progressão */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Caminho de níveis</h2>
            </div>

            <ol className="relative space-y-1">
              {[...NIVEIS].reverse().map((n, i, arr) => {
                const realIdx = NIVEIS.length - 1 - i;
                const atual = realIdx === idxAtual;
                const desbloqueado = realIdx <= idxAtual;
                const isLast = i === arr.length - 1;
                return (
                  <motion.li
                    key={n.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                    className="relative flex gap-4 pb-4"
                  >
                    {!isLast && (
                      <span
                        className={cn(
                          "absolute left-[21px] top-11 h-full w-0.5 rounded-full",
                          realIdx - 1 <= idxAtual ? "bg-primary/40" : "bg-border"
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-foreground ring-4 ring-offset-2 ring-offset-background",
                        desbloqueado ? n.dot : "bg-muted",
                        atual ? n.ring : "ring-transparent"
                      )}
                    >
                      {atual ? (
                        <Trophy className="h-5 w-5" />
                      ) : desbloqueado ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 rounded-2xl border p-4 transition-all",
                        atual ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border",
                        !desbloqueado && "opacity-70"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("font-semibold", atual && "text-primary")}>{n.label}</span>
                        {atual && <Badge className="bg-primary text-primary-foreground hover:bg-primary">Você está aqui</Badge>}
                        {!desbloqueado && (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" /> Bloqueado
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {n.pontos > 0 ? `+${n.pontos}` : n.pontos} pontos
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        {/* 5. Como ganho pontos */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-1 text-lg font-bold">Como ganho pontos?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              A cada serviço concluído a empresa avalia você de 1 a 5 estrelas.
            </p>
            <div className="space-y-2">
              {ESTRELAS_PONTOS.map((e) => (
                <div
                  key={e.estrelas}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"
                >
                  <StarRow value={e.estrelas} />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      e.pontos > 0 ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {formatPontos(e.pontos)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 6. Histórico de pontos */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Histórico de Pontos</h2>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : historico.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você ainda não recebeu avaliações. Conclua um serviço para começar a somar pontos.
              </p>
            ) : (
              <div className="space-y-3">
                {historico.map((h) => (
                  <div key={h.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{h.titulo}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <StarRow value={h.estrelas} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.data).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-sm font-bold",
                            h.pontos > 0 ? "text-emerald-600" : h.pontos < 0 ? "text-red-600" : "text-muted-foreground"
                          )}
                        >
                          {formatPontos(h.pontos)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total: {h.totalDepois}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomTabBar />
    </div>
  );
};

export default MeusPontos;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";
import VoltarButton from "@/components/VoltarButton";
import { cn } from "@/lib/utils";

const MediaEstrelas = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [estrelas, setEstrelas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from("avaliacoes")
        .select("estrelas")
        .eq("trabalhador_id", user.id)
        .eq("tipo", "empresa_para_trabalhador");
      setEstrelas(((data as Array<{ estrelas: number }> | null) ?? []).map((a) => a.estrelas));
      setLoading(false);
    };
    load();
  }, [user]);

  const total = estrelas.length;
  const media = total > 0 ? estrelas.reduce((s, n) => s + n, 0) / total : 0;
  const contagem = [5, 4, 3, 2, 1].map((n) => ({
    n,
    qtd: estrelas.filter((e) => e === n).length,
  }));

  if (authLoading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hidden md:block">
        <Header />
      </div>
      <AppMobileHeader
        eyebrow="Carreira"
        title="Média de Estrelas"
        subtitle="Como as empresas avaliam o seu trabalho"
        backTo="/carreira"
      />
      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <VoltarButton to="/carreira" className="hidden md:inline-flex" />

        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold">Média de Estrelas</h1>
          <p className="text-sm text-muted-foreground">
            Calculada automaticamente com base nas avaliações reais recebidas.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="flex flex-col items-center gap-2 p-8">
            <div className="flex items-center gap-2">
              <Star className="h-9 w-9 fill-amber-400 text-amber-400" />
              <span className="text-4xl font-bold leading-none">
                {loading ? "—" : total > 0 ? media.toFixed(1).replace(".", ",") : "—"}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "h-4 w-4",
                    n <= Math.round(media) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "avaliação" : "avaliações"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            {contagem.map(({ n, qtd }) => (
              <div key={n} className="flex items-center gap-3">
                <div className="flex w-24 shrink-0 items-center gap-0.5">
                  {Array.from({ length: n }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Progress value={total > 0 ? (qtd / total) * 100 : 0} className="flex-1" />
                <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                  {qtd} {qtd === 1 ? "avaliação" : "avaliações"}
                </span>
              </div>
            ))}
            {total === 0 && !loading && (
              <p className="pt-2 text-sm text-muted-foreground">
                Você ainda não recebeu nenhuma avaliação.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomTabBar />
    </div>
  );
};

export default MediaEstrelas;

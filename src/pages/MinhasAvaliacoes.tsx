import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquare, Building2, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";
import VoltarButton from "@/components/VoltarButton";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  estrelas: number;
  justificativa: string | null;
  pontos: number;
  created_at: string;
  titulo: string;
  empresa_nome: string | null;
};

const MinhasAvaliacoes = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      const { data: avals } = await supabase
        .from("avaliacoes")
        .select("id, estrelas, justificativa, pontos, created_at, servico_id")
        .eq("trabalhador_id", user.id)
        .eq("tipo", "empresa_para_trabalhador")
        .order("created_at", { ascending: false });

      const lista = ((avals as Array<{
        id: string; estrelas: number; justificativa: string | null;
        pontos: number; created_at: string; servico_id: string;
      }> | null) ?? []);

      if (lista.length === 0) {
        setItens([]);
        setLoading(false);
        return;
      }

      const sids = Array.from(new Set(lista.map((a) => a.servico_id)));
      const { data: srvs } = await supabase
        .from("servicos")
        .select("id, titulo, empresa_nome")
        .in("id", sids);
      const sMap = new Map(((srvs as Array<{ id: string; titulo: string; empresa_nome: string | null }> | null) ?? []).map((s) => [s.id, s]));

      setItens(
        lista.map((a) => ({
          id: a.id,
          estrelas: a.estrelas,
          justificativa: a.justificativa,
          pontos: a.pontos,
          created_at: a.created_at,
          titulo: sMap.get(a.servico_id)?.titulo ?? "Serviço",
          empresa_nome: sMap.get(a.servico_id)?.empresa_nome ?? null,
        })),
      );
      setLoading(false);
    };
    load();
  }, [user]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hidden md:block">
        <Header />
      </div>
      <AppMobileHeader
        eyebrow="Carreira"
        title="Minhas Avaliações"
        subtitle="Histórico completo das avaliações recebidas"
        backTo="/carreira"
      />
      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <VoltarButton to="/carreira" className="hidden md:inline-flex" />

        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold">Minhas Avaliações</h1>
          <p className="text-sm text-muted-foreground">
            Da mais recente para a mais antiga, com os pontos de cada avaliação.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : itens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">Você ainda não recebeu nenhuma avaliação.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {itens.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn(
                            "h-4 w-4",
                            n <= a.estrelas ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={a.pontos >= 0 ? "text-emerald-700" : "text-red-700"}>
                        {a.pontos > 0 ? `+${a.pontos}` : a.pontos} pts
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(a.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <p className="break-words font-semibold">{a.titulo}</p>
                  <p className="flex items-center gap-2 break-words text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 shrink-0" />
                    {a.empresa_nome ?? "Empresa"}
                  </p>
                  {a.justificativa && (
                    <p className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                      "{a.justificativa}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomTabBar />
    </div>
  );
};

export default MinhasAvaliacoes;

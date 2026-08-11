import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MapPinCheck, Building2, CalendarDays, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";
import VoltarButton from "@/components/VoltarButton";

type Presenca = {
  candidatura_id: string;
  titulo: string;
  empresa_nome: string | null;
  data_servico: string | null;
  horario: string | null;
  presenca_confirmada_em: string;
  chegada_confirmada_em: string | null;
};

const PresencasConfirmadas = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [itens, setItens] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      const { data: cands } = await supabase
        .from("candidaturas")
        .select("id, servico_id, presenca_confirmada_em, chegada_confirmada_em")
        .eq("user_id", user.id)
        .not("presenca_confirmada_em", "is", null);

      const lista = ((cands as Array<{
        id: string; servico_id: string;
        presenca_confirmada_em: string; chegada_confirmada_em: string | null;
      }> | null) ?? []);

      if (lista.length === 0) {
        setItens([]);
        setLoading(false);
        return;
      }

      const sids = Array.from(new Set(lista.map((c) => c.servico_id)));
      const { data: srvs } = await supabase
        .from("servicos")
        .select("id, titulo, empresa_nome, data_servico, horario")
        .in("id", sids);

      const sMap = new Map(((srvs as Array<{
        id: string; titulo: string; empresa_nome: string | null;
        data_servico: string | null; horario: string | null;
      }> | null) ?? []).map((s) => [s.id, s]));

      const mapped: Presenca[] = lista.map((c) => {
        const s = sMap.get(c.servico_id);
        return {
          candidatura_id: c.id,
          titulo: s?.titulo ?? "Serviço",
          empresa_nome: s?.empresa_nome ?? null,
          data_servico: s?.data_servico ?? null,
          horario: s?.horario ?? null,
          presenca_confirmada_em: c.presenca_confirmada_em,
          chegada_confirmada_em: c.chegada_confirmada_em,
        };
      });

      mapped.sort(
        (a, b) =>
          new Date(b.presenca_confirmada_em).getTime() - new Date(a.presenca_confirmada_em).getTime(),
      );

      setItens(mapped);
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
        title="Presenças Confirmadas"
        subtitle="Diárias com presença confirmada pela empresa"
        backTo="/carreira"
      />
      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <VoltarButton to="/carreira" className="hidden md:inline-flex" />

        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold">Presenças Confirmadas</h1>
          <p className="text-sm text-muted-foreground">
            Somente as presenças realmente confirmadas pelas empresas são contabilizadas.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="flex items-center gap-3 p-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <div className="text-xs uppercase text-muted-foreground">Total de presenças confirmadas</div>
              <div className="text-2xl font-bold">{loading ? "—" : itens.length}</div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : itens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <MapPinCheck className="h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">Você ainda não possui presenças confirmadas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {itens.map((p) => (
              <Card key={p.candidatura_id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold">{p.titulo}</p>
                    <Badge className="shrink-0 gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
                      <MapPinCheck className="h-3 w-3" />
                      {p.chegada_confirmada_em ? "Chegada confirmada" : "Presença confirmada"}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2 break-words">
                      <Building2 className="h-4 w-4 shrink-0" />
                      {p.empresa_nome ?? "Empresa"}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      {p.data_servico
                        ? new Date(p.data_servico).toLocaleDateString("pt-BR")
                        : new Date(p.presenca_confirmada_em).toLocaleDateString("pt-BR")}
                    </p>
                    {p.horario && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {p.horario}
                      </p>
                    )}
                    <p className="text-xs">
                      Confirmada em {new Date(p.presenca_confirmada_em).toLocaleString("pt-BR")}
                    </p>
                  </div>
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

export default PresencasConfirmadas;

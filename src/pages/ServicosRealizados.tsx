import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, CalendarDays, Clock, Building2, Wallet, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";
import VoltarButton from "@/components/VoltarButton";

type ServicoRealizado = {
  candidatura_id: string;
  titulo: string;
  empresa_nome: string | null;
  cidade: string | null;
  estado: string | null;
  data_servico: string | null;
  horario: string | null;
  valor: number | null;
  concluido_em: string | null;
};

const formatValor = (valor: number | null) =>
  valor == null
    ? "—"
    : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ServicosRealizados = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [itens, setItens] = useState<ServicoRealizado[]>([]);
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
        .select("id, servico_id, status, expediente_encerrado_em, created_at")
        .eq("user_id", user.id);

      const lista = ((cands as Array<{
        id: string;
        servico_id: string;
        status: string;
        expediente_encerrado_em: string | null;
        created_at: string;
      }> | null) ?? []).filter((c) => !!c.expediente_encerrado_em || c.status === "concluida");

      if (lista.length === 0) {
        setItens([]);
        setLoading(false);
        return;
      }

      const sids = Array.from(new Set(lista.map((c) => c.servico_id)));
      const { data: srvs } = await supabase
        .from("servicos")
        .select("id, titulo, empresa_nome, cidade, estado, data_servico, horario, valor")
        .in("id", sids);

      const sMap = new Map(((srvs as Array<{
        id: string; titulo: string; empresa_nome: string | null; cidade: string | null;
        estado: string | null; data_servico: string | null; horario: string | null; valor: number | null;
      }> | null) ?? []).map((s) => [s.id, s]));

      const mapped: ServicoRealizado[] = lista.map((c) => {
        const s = sMap.get(c.servico_id);
        return {
          candidatura_id: c.id,
          titulo: s?.titulo ?? "Serviço",
          empresa_nome: s?.empresa_nome ?? null,
          cidade: s?.cidade ?? null,
          estado: s?.estado ?? null,
          data_servico: s?.data_servico ?? null,
          horario: s?.horario ?? null,
          valor: s?.valor != null ? Number(s.valor) : null,
          concluido_em: c.expediente_encerrado_em ?? c.created_at,
        };
      });

      mapped.sort((a, b) => {
        const da = new Date(a.concluido_em ?? 0).getTime();
        const db = new Date(b.concluido_em ?? 0).getTime();
        return db - da;
      });

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
        title="Serviços Realizados"
        subtitle="Histórico completo dos seus serviços"
        backTo="/carreira"
      />
      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <VoltarButton to="/carreira" className="hidden md:inline-flex" />

        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold">Serviços Realizados</h1>
          <p className="text-sm text-muted-foreground">
            Todos os serviços que você já concluiu, do mais recente ao mais antigo.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : itens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">Você ainda não possui serviços realizados.</p>
              <p className="text-sm text-muted-foreground">
                Ao concluir um serviço, ele aparecerá aqui automaticamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {itens.map((s) => (
              <Card key={s.candidatura_id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-semibold">{s.titulo}</p>
                    <Badge className="shrink-0 gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Concluído
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2 break-words">
                      <Building2 className="h-4 w-4 shrink-0" />
                      {s.empresa_nome ?? "Empresa"}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      {s.data_servico
                        ? new Date(s.data_servico).toLocaleDateString("pt-BR")
                        : new Date(s.concluido_em ?? "").toLocaleDateString("pt-BR")}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      {s.horario ?? "—"}
                    </p>
                    <p className="flex items-center gap-2 break-words">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {s.cidade ? `${s.cidade}${s.estado ? `/${s.estado}` : ""}` : "—"}
                    </p>
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Wallet className="h-4 w-4 shrink-0 text-primary" />
                      {formatValor(s.valor)}
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

export default ServicosRealizados;

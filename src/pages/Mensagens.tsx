import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VoltarButton from "@/components/VoltarButton";

type Item = {
  id: string;
  status: string;
  created_at: string;
  contratante_id: string;
  trabalhador_id: string;
  servico_id: string;
  outroNome: string;
  titulo: string;
};

const iniciais = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

const Mensagens = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    (async () => {
      const { data: convs } = await supabase
        .from("chat_conversas")
        .select("id, status, created_at, contratante_id, trabalhador_id, servico_id")
        .order("updated_at", { ascending: false });
      const list = convs ?? [];
      const outros = Array.from(new Set(list.map((c) => (c.contratante_id === user.id ? c.trabalhador_id : c.contratante_id))));
      const srvIds = Array.from(new Set(list.map((c) => c.servico_id)));
      const [{ data: profs }, { data: srvs }] = await Promise.all([
        outros.length ? supabase.from("profiles").select("user_id, nome_completo").in("user_id", outros) : Promise.resolve({ data: [] }),
        srvIds.length ? supabase.from("servicos").select("id, titulo, empresa_nome").in("id", srvIds) : Promise.resolve({ data: [] }),
      ]);
      const pMap = new Map((profs ?? []).map((p: { user_id: string; nome_completo: string | null }) => [p.user_id, p.nome_completo]));
      const sMap = new Map((srvs ?? []).map((s: { id: string; titulo: string; empresa_nome: string | null }) => [s.id, s]));
      setItens(list.map((c) => {
        const souContratante = c.contratante_id === user.id;
        const srv = sMap.get(c.servico_id);
        const outroNome = souContratante
          ? pMap.get(c.trabalhador_id) || "Trabalhador"
          : srv?.empresa_nome || pMap.get(c.contratante_id) || "Contratante";
        return { ...c, outroNome, titulo: srv?.titulo ?? "Serviço" };
      }));
      setCarregando(false);
    })();
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-muted/40 pb-24">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <VoltarButton to="/inicio" />
        <h1 className="mb-1 text-2xl font-bold">Mensagens</h1>
        <p className="mb-5 text-sm text-muted-foreground">Chats temporários dos seus serviços aceitos.</p>
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : itens.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border bg-card p-10 text-center">
            <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Nenhuma conversa ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">O chat é liberado quando uma candidatura é aceita.</p>
          </div>
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {itens.map((i) => (
              <li key={i.id}>
                <Link to={`/mensagens/${i.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/60">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">{iniciais(i.outroNome)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.outroNome}</p>
                    <p className="truncate text-sm text-muted-foreground">{i.titulo}</p>
                  </div>
                  {i.status === "encerrado" ? (
                    <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" />Encerrado</Badge>
                  ) : (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Ativo</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Mensagens;

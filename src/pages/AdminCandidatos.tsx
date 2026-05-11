import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Phone, MapPin, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import RankedAvatar from "@/components/RankedAvatar";
import { getNivel } from "@/lib/career";

type Candidatura = {
  id: string;
  user_id: string;
  telefone: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  documento_url: string;
  status: string;
  created_at: string;
  aprovada_em: string | null;
};

type ProfileLite = {
  user_id: string;
  nome_completo: string | null;
  cidade: string | null;
  estado: string | null;
  pontuacao: number;
};

type Servico = {
  id: string;
  titulo: string;
  categoria: string | null;
  cidade: string | null;
  estado: string | null;
};

const initials = (name: string | null | undefined) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
};

const AdminCandidatos = () => {
  const { id: servicoId } = useParams<{ id: string }>();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [servico, setServico] = useState<Servico | null>(null);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileLite>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/servicos");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!servicoId || !isAdmin) return;
      setLoading(true);

      const { data: srv } = await supabase
        .from("servicos")
        .select("id, titulo, categoria, cidade, estado")
        .eq("id", servicoId)
        .maybeSingle();
      setServico((srv as Servico) || null);

      const { data: cands } = await supabase
        .from("candidaturas")
        .select("*")
        .eq("servico_id", servicoId)
        .order("created_at", { ascending: false });

      const list = (cands as Candidatura[]) || [];
      setCandidaturas(list);

      const ids = Array.from(new Set(list.map((c) => c.user_id)));
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, nome_completo, cidade, estado, pontuacao")
          .in("user_id", ids);
        const map: Record<string, ProfileLite> = {};
        (profs as ProfileLite[] | null)?.forEach((p) => (map[p.user_id] = p));
        setProfilesMap(map);
      } else {
        setProfilesMap({});
      }

      setLoading(false);
    };
    load();
  }, [servicoId, isAdmin]);

  const contratar = async (c: Candidatura) => {
    if (c.status === "aprovada") return;
    const { error } = await supabase
      .from("candidaturas")
      .update({ status: "aprovada", aprovada_em: new Date().toISOString() })
      .eq("id", c.id);
    if (error) {
      toast.error("Erro ao contratar candidato.");
      return;
    }
    toast.success("Candidato contratado!");
    setCandidaturas((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status: "aprovada", aprovada_em: new Date().toISOString() } : x)),
    );
  };

  if (authLoading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o painel
        </Link>

        <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{servico?.titulo ?? "Serviço"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[servico?.categoria, servico?.cidade, servico?.estado].filter(Boolean).join(" • ") || "Candidatos"}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-primary/10 px-4 py-3 text-primary">
            <Users className="h-6 w-6" />
            <div>
              <div className="text-2xl font-bold leading-none">{candidaturas.length}</div>
              <div className="text-xs uppercase tracking-wide text-primary/80">
                {candidaturas.length === 1 ? "candidato" : "candidatos"}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando candidatos...</p>
        ) : candidaturas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum candidato ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Assim que alguém se candidatar, aparecerá aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidaturas.map((c) => {
              const p = profilesMap[c.user_id];
              const nome = p?.nome_completo || "Sem nome";
              const pts = p?.pontuacao ?? 0;
              const nivel = getNivel(pts);
              return (
                <Card key={c.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <RankedAvatar nome={nome} pontuacao={pts} size="md" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">{nome}</CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                        <Badge className={`text-xs ${nivel.badgeClass}`}>{nivel.label} • {pts} pts</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{c.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {[c.cidade, p?.estado].filter(Boolean).join(" - ") || c.cidade}
                      </span>
                    </div>
                    <Link to={`/admin/candidatos/${c.id}`}>
                      <Button variant="outline" className="mt-3 w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver perfil
                      </Button>
                    </Link>
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

export default AdminCandidatos;

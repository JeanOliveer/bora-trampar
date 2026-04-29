import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Calendar, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import CandidaturaDialog from "@/components/CandidaturaDialog";

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
};

const Servicos = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("servicos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });
      setServicos((data as Servico[]) || []);
      setLoading(false);
    };
    if (user) fetch();
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Serviços Disponíveis</h1>
          <p className="mt-2 text-muted-foreground">Confira as diárias publicadas e candidate-se às que combinam com você.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando serviços...</p>
        ) : servicos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhum serviço disponível no momento</p>
              <p className="mt-1 text-sm text-muted-foreground">Volte em breve para conferir novas oportunidades.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <Card key={s.id} className="transition-shadow hover:shadow-md">
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
                    <p className="pt-2 text-xs text-muted-foreground"><strong>Requisitos:</strong> {s.requisitos}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => toast.success("Candidatura enviada!", { description: `Você se candidatou para "${s.titulo}".` })}
                  >
                    Candidatar-se
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Servicos;

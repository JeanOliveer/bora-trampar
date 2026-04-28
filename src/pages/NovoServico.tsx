import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

const estadosBR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const categorias = [
  "Logística",
  "Ajudante Geral",
  "Limpeza",
  "Construção Civil",
  "Garçom / Eventos",
  "Carga e Descarga",
  "Mudança",
  "Jardinagem",
  "Outros",
];

const NovoServico = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [valor, setValor] = useState("");
  const [requisitos, setRequisitos] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate("/login");
      else if (!isAdmin) navigate("/servicos");
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (titulo.trim().length < 3 || titulo.length > 120) {
      toast.error("Título deve ter entre 3 e 120 caracteres.");
      return;
    }
    if (!categoria) { toast.error("Selecione uma categoria."); return; }
    if (!cidade.trim()) { toast.error("Informe a cidade."); return; }
    if (!estado) { toast.error("Selecione o estado."); return; }
    if (descricao.length > 2000) { toast.error("Descrição muito longa."); return; }

    setSaving(true);
    const horario = horarioInicio && horarioFim
      ? `${horarioInicio} às ${horarioFim}`
      : horarioInicio || null;

    const { error } = await supabase.from("servicos").insert({
      titulo: titulo.trim(),
      categoria,
      descricao: descricao.trim() || null,
      cidade: cidade.trim(),
      estado,
      data_servico: dataServico || null,
      horario,
      valor: valor ? Number(valor) : null,
      requisitos: requisitos.trim() || null,
      created_by: user!.id,
    });

    setSaving(false);

    if (error) {
      toast.error("Erro ao publicar serviço.");
      return;
    }
    toast.success("Serviço publicado com sucesso!");
    navigate("/admin");
  };

  if (authLoading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container flex-1 py-10">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </Link>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Nova Diária</CardTitle>
            <CardDescription>Preencha os dados do serviço a ser publicado para os trabalhadores.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  required
                  maxLength={120}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Ajudante para mudança"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria} required>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  maxLength={2000}
                  rows={4}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o serviço, atividades e detalhes importantes."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Cidade *</Label>
                  <Input
                    required
                    maxLength={80}
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Belo Horizonte"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select value={estado} onValueChange={setEstado} required>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {estadosBR.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={dataServico} onChange={(e) => setDataServico(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor da diária (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="150.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requisitos</Label>
                  <Input
                    maxLength={300}
                    value={requisitos}
                    onChange={(e) => setRequisitos(e.target.value)}
                    placeholder="Ex: Maior de 18 anos, com EPI"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Publicando..." : "Publicar Serviço"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NovoServico;

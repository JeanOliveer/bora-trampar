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
import PerguntasEditor, { type PerguntaDraft } from "@/components/PerguntasEditor";

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
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaEmail, setEmpresaEmail] = useState("");
  const [linkEmpresa, setLinkEmpresa] = useState<string | null>(null);
  const [perguntas, setPerguntas] = useState<PerguntaDraft[]>([]);

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
    if (!empresaNome.trim()) { toast.error("Informe o nome da empresa contratante."); return; }

    setSaving(true);
    const horario = horarioInicio && horarioFim
      ? `${horarioInicio} às ${horarioFim}`
      : horarioInicio || null;

    const { data: inserted, error } = await supabase.from("servicos").insert({
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
      empresa_nome: empresaNome.trim(),
      empresa_email: empresaEmail.trim() || null,
    }).select("id, empresa_token").single();

    if (error || !inserted) {
      setSaving(false);
      toast.error("Erro ao publicar serviço.");
      return;
    }

    const insertedRow = inserted as { id: string; empresa_token: string };

    if (perguntas.length > 0) {
      const rows = perguntas.map((p, idx) => ({
        servico_id: insertedRow.id,
        ordem: idx,
        texto: p.texto,
        tipo: p.tipo,
        opcoes: p.opcoes,
        obrigatoria: p.obrigatoria,
      }));
      await supabase.from("servico_perguntas").insert(rows);
    }

    setSaving(false);
    const link = `${window.location.origin}/empresa/${(inserted as { empresa_token: string }).empresa_token}`;
    setLinkEmpresa(link);
    toast.success("Serviço publicado! Compartilhe o link com a empresa.");
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Empresa contratante *</Label>
                  <Input
                    required
                    maxLength={120}
                    value={empresaNome}
                    onChange={(e) => setEmpresaNome(e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail da empresa</Label>
                  <Input
                    type="email"
                    maxLength={160}
                    value={empresaEmail}
                    onChange={(e) => setEmpresaEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving || !!linkEmpresa}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Publicando..." : linkEmpresa ? "Publicado" : "Publicar Serviço"}
              </Button>

              {linkEmpresa && (
                <div className="space-y-2 rounded-md border bg-muted/40 p-4">
                  <p className="text-sm font-medium">Link exclusivo da empresa</p>
                  <p className="text-xs text-muted-foreground">
                    Envie este link para a empresa contratante. Ela poderá ver candidatos, aprovar e avaliar o trabalhador sem precisar criar conta.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input readOnly value={linkEmpresa} className="font-mono text-xs" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(linkEmpresa);
                        toast.success("Link copiado!");
                      }}
                    >
                      Copiar
                    </Button>
                    <Button type="button" onClick={() => navigate("/admin")}>
                      Ir para o painel
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NovoServico;

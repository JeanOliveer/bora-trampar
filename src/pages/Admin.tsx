import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Trash2, Pencil, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomTabBar from "@/components/BottomTabBar";
import AppMobileHeader from "@/components/AppMobileHeader";

const estadosBR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

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
  ativo: boolean;
};

const emptyForm = {
  titulo: "",
  descricao: "",
  categoria: "",
  valor: "",
  cidade: "",
  estado: "",
  data_servico: "",
  horario: "",
  requisitos: "",
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    // Wait for role to be loaded before deciding to redirect
    if (profileLoading) return;
    if (!isAdmin) navigate("/servicos", { replace: true });
  }, [authLoading, profileLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("servicos")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setServicos((data as Servico[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const load = async () => {
    const { data } = await supabase
      .from("servicos")
      .select("*")
      .order("created_at", { ascending: false });
    setServicos((data as Servico[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.titulo) { toast.error("Título é obrigatório."); return; }
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      categoria: form.categoria || null,
      valor: form.valor ? Number(form.valor) : null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      data_servico: form.data_servico || null,
      horario: form.horario || null,
      requisitos: form.requisitos || null,
      created_by: user!.id,
    };

    const { error } = editingId
      ? await supabase.from("servicos").update(payload).eq("id", editingId)
      : await supabase.from("servicos").insert(payload);

    if (error) { toast.error("Erro ao salvar serviço."); return; }
    toast.success(editingId ? "Serviço atualizado!" : "Serviço publicado!");
    setOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const handleEdit = (s: Servico) => {
    setEditingId(s.id);
    setForm({
      titulo: s.titulo,
      descricao: s.descricao || "",
      categoria: s.categoria || "",
      valor: s.valor?.toString() || "",
      cidade: s.cidade || "",
      estado: s.estado || "",
      data_servico: s.data_servico || "",
      horario: s.horario || "",
      requisitos: s.requisitos || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este serviço?")) return;
    const { error } = await supabase.from("servicos").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir.");
    else { toast.success("Serviço excluído!"); load(); }
  };

  const toggleAtivo = async (s: Servico) => {
    await supabase.from("servicos").update({ ativo: !s.ativo }).eq("id", s.id);
    load();
  };

  if (authLoading || profileLoading || !isAdmin) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hidden md:block">
        <Header />
      </div>
      <AppMobileHeader
        eyebrow="UaiTrampo"
        title="Empresa"
        subtitle="Gerencie serviços e contratações"
      />
      <main className="container flex-1 py-6 pb-24 md:py-10 md:pb-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold">Painel Empresa</h1>
            <p className="text-muted-foreground">Gerencie os serviços disponíveis na plataforma.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/novo-servico">
              <Button><Plus className="mr-2 h-4 w-4" /> Novo Serviço</Button>
            </Link>
            <Link to="/admin/contratados">
              <Button variant="outline"><UserCheck className="mr-2 h-4 w-4" /> Contratados</Button>
            </Link>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Editar Serviço</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
                <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Categoria</Label><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></div>
                  <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
                  <div>
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                      <SelectContent>{estadosBR.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Data</Label><Input type="date" value={form.data_servico} onChange={(e) => setForm({ ...form, data_servico: e.target.value })} /></div>
                  <div><Label>Horário</Label><Input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} placeholder="08:00 às 17:00" /></div>
                </div>
                <div><Label>Requisitos</Label><Textarea value={form.requisitos} onChange={(e) => setForm({ ...form, requisitos: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={handleSave}>Salvar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : servicos.length === 0 ? (
          <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
        ) : (
          <div className="grid gap-3">
            {servicos.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{s.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {[s.categoria, s.cidade, s.estado].filter(Boolean).join(" • ")}
                      {s.valor != null && ` • R$ ${Number(s.valor).toFixed(2)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/servicos/${s.id}/candidatos`}>
                      <Button size="sm" variant="outline"><Users className="mr-1 h-4 w-4" /> Candidatos</Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => toggleAtivo(s)}>{s.ativo ? "Desativar" : "Ativar"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                {s.descricao && <CardContent><p className="text-sm text-muted-foreground">{s.descricao}</p></CardContent>}
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomTabBar />
    </div>
  );
};

export default Admin;

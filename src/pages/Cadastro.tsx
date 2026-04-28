import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const Cadastro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          user_type: "trabalhador",
          nome_completo: nome,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        cpf, data_nascimento: dataNascimento || null, estado_civil: estadoCivil,
        cidade, estado, chave_pix: chavePix || null,
      }).eq("user_id", user.id);
    }

    setLoading(false);
    toast.success("Conta criada com sucesso!");
    navigate("/servicos");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">UaiTrampo</span>
      </Link>

      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar Conta de Trabalhador</CardTitle>
          <CardDescription>Cadastre-se para encontrar diárias disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João da Silva" />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input required value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Input required type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado Civil *</Label>
                <Select value={estadoCivil} onValueChange={setEstadoCivil} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"].map((ec) => (
                      <SelectItem key={ec} value={ec}>{ec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cidade *</Label>
                <Input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Belo Horizonte" />
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={estado} onValueChange={setEstado} required>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {estadosBR.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Chave PIX (opcional)</Label>
              <Input value={chavePix} onChange={(e) => setChavePix(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input required type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>

      <Link to="/" className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar para início
      </Link>
    </div>
  );
};

export default Cadastro;

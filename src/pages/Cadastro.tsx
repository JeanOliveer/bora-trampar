import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Building2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const CadastroTrabalhador = () => {
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

    // Update profile with extra fields
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        cpf, data_nascimento: dataNascimento || null, estado_civil: estadoCivil,
        cidade, estado, chave_pix: chavePix || null,
      }).eq("user_id", user.id);
    }

    setLoading(false);
    toast.success("Conta criada com sucesso!");
    navigate("/");
  };

  return (
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
        {loading ? "Criando conta..." : "Criar Conta de Trabalhador"}
      </Button>
    </form>
  );
};

const CadastroEmpresa = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
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
        data: {
          user_type: "empresa",
          nome_completo: responsavel,
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
        nome_empresa: nomeEmpresa, cnpj, responsavel, cidade, estado,
      }).eq("user_id", user.id);
    }

    setLoading(false);
    toast.success("Conta de empresa criada com sucesso!");
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome da Empresa *</Label>
        <Input required value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} placeholder="Empresa LTDA" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>CNPJ *</Label>
          <Input required value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
        </div>
        <div className="space-y-2">
          <Label>Responsável *</Label>
          <Input required value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" />
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>E-mail *</Label>
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="empresa@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Senha *</Label>
          <Input required type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Criando conta..." : "Criar Conta de Empresa"}
      </Button>
    </form>
  );
};

const Cadastro = () => {
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
          <CardTitle className="text-xl">Criar Conta</CardTitle>
          <CardDescription>Escolha o tipo de conta que deseja criar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trabalhador">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trabalhador" className="gap-2">
                <User className="h-4 w-4" />
                Trabalhador
              </TabsTrigger>
              <TabsTrigger value="empresa" className="gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trabalhador" className="mt-6">
              <CadastroTrabalhador />
            </TabsContent>

            <TabsContent value="empresa" className="mt-6">
              <CadastroEmpresa />
            </TabsContent>
          </Tabs>

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

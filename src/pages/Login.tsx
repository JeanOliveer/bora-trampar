import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = (tipo: string) => {
    if (!email || !senha) {
      toast.error("Preencha todos os campos.");
      return;
    }
    toast.success(`Login como ${tipo} realizado com sucesso!`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Briefcase className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">UaiTrampo</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Entrar na Plataforma</CardTitle>
          <CardDescription>Escolha seu tipo de conta para continuar</CardDescription>
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

            <TabsContent value="trabalhador" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-t">E-mail</Label>
                <Input id="email-t" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha-t">Senha</Label>
                <Input id="senha-t" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => handleLogin("trabalhador")}>
                Entrar como Trabalhador
              </Button>
            </TabsContent>

            <TabsContent value="empresa" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-e">E-mail</Label>
                <Input id="email-e" type="email" placeholder="empresa@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha-e">Senha</Label>
                <Input id="senha-e" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => handleLogin("empresa")}>
                Entrar como Empresa
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

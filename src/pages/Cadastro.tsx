import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const estadosBR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const CadastroTrabalhador = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cadastro de trabalhador realizado! Faça login para continuar.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome Completo *</Label>
          <Input required placeholder="João da Silva" />
        </div>
        <div className="space-y-2">
          <Label>CPF *</Label>
          <Input required placeholder="000.000.000-00" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Data de Nascimento *</Label>
          <Input required type="date" />
        </div>
        <div className="space-y-2">
          <Label>Estado Civil *</Label>
          <Select required>
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
          <Input required placeholder="Belo Horizonte" />
        </div>
        <div className="space-y-2">
          <Label>Estado *</Label>
          <Select required>
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
        <Label>Chave PIX *</Label>
        <Input required placeholder="CPF, e-mail, telefone ou chave aleatória" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>E-mail *</Label>
          <Input required type="email" placeholder="seu@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Senha *</Label>
          <Input required type="password" placeholder="Mínimo 6 caracteres" />
        </div>
      </div>
      <Button type="submit" className="w-full">Criar Conta de Trabalhador</Button>
    </form>
  );
};

const CadastroEmpresa = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cadastro de empresa realizado! Faça login para continuar.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome da Empresa *</Label>
        <Input required placeholder="Empresa LTDA" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>CNPJ *</Label>
          <Input required placeholder="00.000.000/0000-00" />
        </div>
        <div className="space-y-2">
          <Label>Responsável *</Label>
          <Input required placeholder="Nome do responsável" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cidade *</Label>
          <Input required placeholder="Belo Horizonte" />
        </div>
        <div className="space-y-2">
          <Label>Estado *</Label>
          <Select required>
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
          <Input required type="email" placeholder="empresa@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Senha *</Label>
          <Input required type="password" placeholder="Mínimo 6 caracteres" />
        </div>
      </div>
      <Button type="submit" className="w-full">Criar Conta de Empresa</Button>
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

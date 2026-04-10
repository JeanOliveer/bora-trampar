import { Search, UserCheck, Briefcase, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const steps = [
  {
    icon: UserCheck,
    titulo: "Crie sua conta",
    descricao: "Cadastre-se como trabalhador ou empresa em poucos minutos com suas informações básicas.",
  },
  {
    icon: Search,
    titulo: "Encontre oportunidades",
    descricao: "Trabalhadores encontram diárias disponíveis. Empresas publicam vagas com todos os detalhes.",
  },
  {
    icon: Briefcase,
    titulo: "Candidate-se ou contrate",
    descricao: "Trabalhadores se candidatam na hora. Empresas escolhem os melhores perfis para o dia.",
  },
  {
    icon: Star,
    titulo: "Avalie e cresça",
    descricao: "Após o trabalho, empresas avaliam trabalhadores. Bons perfis ganham destaque na plataforma.",
  },
];

const ComoFunciona = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Como o UaiTrampo funciona?
            </h1>
            <p className="text-muted-foreground text-balance">
              Simples, rápido e seguro. Conectamos trabalhadores e empresas em 4 passos.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl gap-8 md:grid-cols-2">
            {steps.map((step, i) => (
              <div key={step.titulo} className="animate-fade-in flex gap-4 rounded-xl border border-border bg-card p-6" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{step.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{step.descricao}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/cadastro">
              <Button size="lg" className="gap-2">
                Começar Agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComoFunciona;

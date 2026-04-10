import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-card">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_70%)]" />
      <div className="container relative py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Vagas disponíveis agora
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Encontre sua{" "}
            <span className="text-primary">diária</span>{" "}
            de trabalho
          </h1>

          <p className="mb-8 text-lg text-muted-foreground text-balance">
            Conectamos trabalhadores qualificados a empresas que precisam de mão de obra
            em logística, serviços gerais e limpeza.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/cadastro">
              <Button size="lg" className="gap-2 px-8">
                Começar Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button variant="outline" size="lg" className="gap-2 px-8">
                <Search className="h-4 w-4" />
                Como Funciona
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-center">
            {[
              { num: "500+", label: "Diárias postadas" },
              { num: "1.200+", label: "Trabalhadores" },
              { num: "150+", label: "Empresas" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-foreground">{stat.num}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

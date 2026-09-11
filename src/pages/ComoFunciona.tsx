import { Search, UserCheck, Briefcase, Check, Star, CircleDot, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomTabBar from "@/components/BottomTabBar";

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
    icon: Check,
    titulo: "Trabalhe e receba",
    descricao: "Conclua o trabalho, receba o combinado e avalie a experiência com a outra parte.",
  },
];

const ComoFunciona = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container bg-background pb-32 pt-10 md:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
                <CircleDot className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Guia rápido
              </div>
            </div>

            <h1 className="mt-5 text-center text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
              Como o <span className="text-primary">UaiTrampo</span> funciona?
            </h1>

            <p className="mt-4 text-center text-base leading-relaxed text-muted-foreground">
              Simples, rápido e seguro. Conectamos trabalhadores e empresas em 4 passos — como bater o crachá.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative">
              <div
                className="absolute top-5 bottom-5 w-px border-l-2 border-dashed border-primary/25 md:top-6 md:bottom-6"
                style={{ left: "19px" }}
                aria-hidden="true"
              />

              <div className="space-y-8 md:space-y-10">
                {steps.map((step, i) => {
                  const isLast = i === steps.length - 1;
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.titulo}
                      className="animate-fade-in relative flex items-start gap-4 md:gap-6"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg md:h-12 md:w-12",
                          isLast
                            ? "bg-gradient-to-br from-emerald-400 to-green-600"
                            : "bg-gradient-to-br from-primary to-blue-700"
                        )}
                      >
                        <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
                      </div>

                      <div className="relative flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                        <div
                          className="absolute top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full border border-border bg-background sm:block md:h-6 md:w-6"
                          style={{ left: "-10px" }}
                          aria-hidden="true"
                        />

                        <span className="text-xs font-bold uppercase tracking-wide text-primary">
                          Passo {i + 1}
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-foreground md:text-xl">
                          {step.titulo}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-base">
                          {step.descricao}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5 md:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white md:h-11 md:w-11">
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-primary md:text-base">
                Todo trabalhador e empresa passa por verificação antes de iniciar um trampo.
              </p>
            </div>

            <div className="mt-12 text-center">
              <Link to="/cadastro">
                <Button size="lg" className="gap-2 rounded-full px-8">
                  Começar Agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
};

export default ComoFunciona;

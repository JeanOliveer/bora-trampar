import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Truck, Sparkles, HardHat, LayoutGrid, ChevronRight, Bell, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import JobCard from "@/components/JobCard";
import BottomTabBar from "@/components/BottomTabBar";
import { mockJobs } from "@/data/mockJobs";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const categorias = [
  { key: "todas", label: "Todas", icon: LayoutGrid, tint: "bg-primary/10 text-primary" },
  { key: "logistica", label: "Logística", icon: Truck, tint: "bg-blue-500/10 text-blue-600" },
  { key: "ajudante", label: "Ajudante", icon: HardHat, tint: "bg-amber-500/10 text-amber-600" },
  { key: "limpeza", label: "Limpeza", icon: Sparkles, tint: "bg-emerald-500/10 text-emerald-600" },
];

const Index = () => {
  const { user, profile } = useAuth();
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas");

  const jobsFiltrados = mockJobs.filter((job) => {
    const matchBusca =
      job.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      job.empresa.toLowerCase().includes(busca.toLowerCase()) ||
      job.localizacao.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaAtiva === "todas" || job.categoria === categoriaAtiva;
    return matchBusca && matchCategoria;
  });

  const handleCandidatar = () => {
    if (!user) {
      toast.info("Faça login para se candidatar a esta vaga.", {
        action: { label: "Entrar", onClick: () => (window.location.href = "/login") },
      });
    } else {
      window.location.href = "/servicos";
    }
  };

  const primeiroNome = profile?.nome_completo?.split(" ")[0] ?? "Bem-vindo";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Desktop header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile app-style header */}
      <header className="md:hidden sticky top-0 z-30 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground pb-6 pt-3 px-5 rounded-b-3xl shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-80">
              {user ? "Olá," : "UaiTrampo"}
            </p>
            <h1 className="text-xl font-bold leading-tight">
              {user ? `${primeiroNome} 👋` : "Encontre sua diária"}
            </h1>
            {profile?.cidade && (
              <p className="mt-0.5 flex items-center gap-1 text-xs opacity-90">
                <MapPin className="h-3 w-3" /> {profile.cidade}
                {profile.estado ? `, ${profile.estado}` : ""}
              </p>
            )}
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 active:scale-95 transition-transform"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar diárias, cidade, empresa..."
            className="h-12 rounded-2xl border-0 bg-white pl-11 text-foreground shadow-md placeholder:text-muted-foreground"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </header>

      {/* Desktop hero */}
      <div className="hidden md:block">
        <HeroSection />
      </div>

      <main className="flex-1 pb-24 md:pb-0">
        {/* Mobile quick stats */}
        <section className="md:hidden -mt-5 px-5">
          <div className="mx-auto grid max-w-sm grid-cols-3 items-center rounded-2xl bg-card shadow-[var(--shadow-card)] px-[12px] py-[30px]">
            {[
              { num: mockJobs.length, label: "Vagas hoje" },
              { num: "1.2k+", label: "Trabalhadores" },
              { num: "150+", label: "Empresas" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "flex flex-col items-center justify-center text-center px-2",
                  i > 0 && "border-l border-border"
                )}
              >
                <div className="text-base font-bold leading-tight text-foreground">{s.num}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile categories — app style icon tiles */}
        <section className="md:hidden mt-6 px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {categorias.map((cat) => {
              const ativo = categoriaAtiva === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategoriaAtiva(cat.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl py-3 transition-all active:scale-95",
                    ativo ? "bg-primary text-primary-foreground shadow-md" : "bg-card"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      ativo ? "bg-white/20" : cat.tint
                    )}
                  >
                    <cat.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Mobile featured CTA card */}
        {!user && (
          <section className="md:hidden mt-6 px-5">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-[var(--shadow-elevated)]">
              <p className="text-xs uppercase tracking-wider opacity-80">Comece agora</p>
              <h3 className="mt-1 text-lg font-bold">Cadastre-se e candidate-se em segundos</h3>
              <p className="mt-1 text-xs opacity-90">Sem taxas. Sua próxima diária a um toque.</p>
              <Link to="/cadastro">
                <Button size="sm" variant="secondary" className="mt-4 rounded-full font-semibold">
                  Criar conta grátis
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Vagas — desktop original layout */}
        <section className="container py-10 hidden md:block">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Diárias Disponíveis</h2>
              <p className="text-sm text-muted-foreground">
                {jobsFiltrados.length}{" "}
                {jobsFiltrados.length === 1 ? "vaga encontrada" : "vagas encontradas"}
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar diárias..."
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategoriaAtiva(cat.key)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  categoriaAtiva === cat.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {jobsFiltrados.map((job, i) => (
              <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <JobCard job={job} onCandidatar={handleCandidatar} />
              </div>
            ))}
          </div>
        </section>

        {/* Vagas — mobile app feed */}
        <section className="md:hidden mt-6 px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Diárias para você
            </h2>
            <Link
              to="/servicos"
              className="flex items-center text-xs font-medium text-primary"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {jobsFiltrados.length === 0 && (
              <div className="rounded-2xl bg-card p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhuma diária encontrada
                </p>
              </div>
            )}
            {jobsFiltrados.map((job, i) => {
              const cat = categorias.find((c) => c.key === job.categoria) ?? categorias[0];
              return (
                <button
                  key={job.id}
                  onClick={handleCandidatar}
                  className="animate-fade-in flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all active:scale-[0.98]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
                      cat.tint
                    )}
                  >
                    <cat.icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {job.titulo}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.empresa} • {job.localizacao}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {job.dataInicio} • {job.horario}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground">Diária</p>
                    <p className="text-sm font-bold text-primary">
                      R$ {job.valor.toFixed(0)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Index;

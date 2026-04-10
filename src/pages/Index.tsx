import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import JobCard from "@/components/JobCard";
import { mockJobs } from "@/data/mockJobs";

const categorias = [
  { key: "todas", label: "Todas" },
  { key: "logistica", label: "Logística" },
  { key: "ajudante", label: "Ajudante" },
  { key: "limpeza", label: "Limpeza" },
];

const Index = () => {
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
    toast.info("Faça login para se candidatar a esta vaga.", {
      action: {
        label: "Entrar",
        onClick: () => window.location.href = "/login",
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <HeroSection />

      <main className="flex-1">
        <section className="container py-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Diárias Disponíveis</h2>
              <p className="text-sm text-muted-foreground">
                {jobsFiltrados.length} {jobsFiltrados.length === 1 ? "vaga encontrada" : "vagas encontradas"}
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
              <Badge
                key={cat.key}
                variant={categoriaAtiva === cat.key ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => setCategoriaAtiva(cat.key)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            {jobsFiltrados.map((job, i) => (
              <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <JobCard job={job} onCandidatar={handleCandidatar} />
              </div>
            ))}
            {jobsFiltrados.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg font-medium text-muted-foreground">Nenhuma diária encontrada</p>
                <p className="text-sm text-muted-foreground">Tente alterar os filtros ou a busca.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

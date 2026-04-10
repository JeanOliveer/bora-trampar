import { MapPin, Clock, DollarSign, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Job {
  id: string;
  titulo: string;
  empresa: string;
  categoria: "logistica" | "ajudante" | "limpeza";
  localizacao: string;
  dataInicio: string;
  horario: string;
  valor: number;
  vagas: number;
  requisitos?: string;
}

const categoriaCores: Record<string, string> = {
  logistica: "bg-primary/10 text-primary border-primary/20",
  ajudante: "bg-warning/10 text-warning border-warning/20",
  limpeza: "bg-success/10 text-success border-success/20",
};

const categoriaLabels: Record<string, string> = {
  logistica: "Logística",
  ajudante: "Ajudante",
  limpeza: "Limpeza",
};

interface JobCardProps {
  job: Job;
  onCandidatar?: () => void;
}

const JobCard = ({ job, onCandidatar }: JobCardProps) => {
  return (
    <Card className="group transition-all duration-200 hover:shadow-[var(--shadow-elevated)] hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={categoriaCores[job.categoria]}>
                {categoriaLabels[job.categoria]}
              </Badge>
              <span className="text-xs text-muted-foreground">{job.empresa}</span>
            </div>

            <h3 className="text-lg font-semibold text-foreground leading-tight">
              {job.titulo}
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.localizacao}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {job.dataInicio}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {job.horario}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {job.vagas} {job.vagas === 1 ? "vaga" : "vagas"}
              </span>
            </div>

            {job.requisitos && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Requisitos:</span> {job.requisitos}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Diária</span>
              <div className="flex items-center gap-1 text-xl font-bold text-primary">
                <DollarSign className="h-4 w-4" />
                {job.valor.toFixed(2)}
              </div>
            </div>
            <Button size="sm" onClick={onCandidatar}>
              Candidatar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;

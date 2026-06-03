import { Check, CircleDot, MapPin, ThumbsUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type EtapaStatus = "aprovada" | "presenca" | "chegada" | "concluida";

type Props = {
  aprovada: boolean;
  presencaConfirmada: boolean;
  chegadaConfirmada: boolean;
  concluida: boolean;
  className?: string;
};

const steps: { key: EtapaStatus; label: string; icon: any }[] = [
  { key: "aprovada", label: "Aprovado", icon: ThumbsUp },
  { key: "presenca", label: "Presença", icon: CircleDot },
  { key: "chegada", label: "Chegada", icon: MapPin },
  { key: "concluida", label: "Concluído", icon: Trophy },
];

const ProgressoServico = ({
  aprovada,
  presencaConfirmada,
  chegadaConfirmada,
  concluida,
  className,
}: Props) => {
  const completedMap: Record<EtapaStatus, boolean> = {
    aprovada,
    presenca: presencaConfirmada,
    chegada: chegadaConfirmada,
    concluida,
  };

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex min-w-max items-center gap-2">
        {steps.map((s, i) => {
          const done = completedMap[s.key];
          const Icon = done ? Check : s.icon;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border-2 transition-colors",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-card text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 rounded-full transition-colors",
                    completedMap[steps[i + 1].key] ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressoServico;

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
    <div className={cn("w-full", className)}>
      <div className="flex w-full items-start gap-1 sm:gap-2">
        {steps.map((s, i) => {
          const done = completedMap[s.key];
          const Icon = done ? Check : s.icon;
          return (
            <div key={s.key} className="flex flex-1 items-start gap-1 sm:gap-2">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <div
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors sm:h-9 sm:w-9",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-card text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight text-center",
                    done ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mt-4 h-0.5 flex-1 rounded-full transition-colors sm:mt-[18px]",
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

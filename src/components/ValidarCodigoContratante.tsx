import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck } from "lucide-react";

type Registro = {
  codigo: string;
  status_codigo: string;
  expira_em: string;
  created_at: string;
  usado_em: string | null;
};

type Perfil = { nome_completo: string | null; cidade: string | null; estado: string | null } | null;

const rotulos: Record<string, string> = {
  ativo: "Ativo",
  usado: "Já utilizado",
  expirado: "Expirado",
};

const ValidarCodigoContratante = () => {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [perfil, setPerfil] = useState<Perfil>(null);

  const chamar = async (acao: "conferir" | "marcar_usado") => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("codigo-contratante", {
      body: { acao, codigo },
    });
    setLoading(false);
    const erro = (data as { error?: string } | null)?.error;
    if (error || erro) {
      setRegistro(null);
      setPerfil(null);
      toast.error(erro ?? "Não foi possível conferir o código.");
      return;
    }
    const resultado = data as { registro: Registro; perfil: Perfil };
    setRegistro(resultado.registro);
    setPerfil(resultado.perfil);
    if (acao === "marcar_usado") toast.success("Código marcado como usado.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Conferir código de contratante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <Button disabled={loading || codigo.length !== 6} onClick={() => chamar("conferir")}>
            Conferir
          </Button>
        </div>

        {registro && (
          <div className="space-y-1 rounded-xl border bg-muted/40 p-3 text-sm">
            <p className="font-semibold">{perfil?.nome_completo || "Contratante"}</p>
            {perfil?.cidade && (
              <p className="text-muted-foreground">
                {perfil.cidade}
                {perfil.estado ? ` - ${perfil.estado}` : ""}
              </p>
            )}
            <p>Situação: {rotulos[registro.status_codigo] ?? registro.status_codigo}</p>
            <p className="text-muted-foreground">
              Criado em {new Date(registro.created_at).toLocaleString("pt-BR")} · válido até{" "}
              {new Date(registro.expira_em).toLocaleString("pt-BR")}
            </p>
            {registro.usado_em && (
              <p className="text-muted-foreground">
                Usado em {new Date(registro.usado_em).toLocaleString("pt-BR")}
              </p>
            )}
            {registro.status_codigo === "ativo" && (
              <Button
                size="sm"
                className="mt-1"
                disabled={loading}
                onClick={() => chamar("marcar_usado")}
              >
                Confirmar e marcar como usado
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidarCodigoContratante;

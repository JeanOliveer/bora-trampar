import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AppMobileHeader from "@/components/AppMobileHeader";
import BottomTabBar from "@/components/BottomTabBar";
import Header from "@/components/Header";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import {
  formatarDataHora,
  grupoDe,
  metaDe,
  ordemGrupos,
  rotaPadrao,
  type GrupoData,
  type Notificacao,
} from "@/lib/notificacoes";
import { cn } from "@/lib/utils";

const Notificacoes = () => {
  const navigate = useNavigate();
  const {
    itens,
    loading,
    carregandoMais,
    temMais,
    carregarMais,
    marcarComoLida,
    marcarTodasComoLidas,
    excluir,
    excluirTodas,
  } = useNotificacoes();

  const grupos = useMemo(() => {
    const mapa = new Map<GrupoData, Notificacao[]>();
    itens.forEach((n) => {
      const g = grupoDe(n.created_at);
      mapa.set(g, [...(mapa.get(g) ?? []), n]);
    });
    return ordemGrupos.filter((g) => mapa.has(g)).map((g) => ({ grupo: g, lista: mapa.get(g)! }));
  }, [itens]);

  const naoLidas = itens.filter((n) => !n.lida).length;

  const abrir = async (n: Notificacao) => {
    if (!n.lida) await marcarComoLida(n.id);
    navigate(n.rota || rotaPadrao(n.tipo, n.entidade_id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="hidden md:block">
        <Header />
      </div>

      <AppMobileHeader
        title="Notificações"
        eyebrow="UaiTrampo"
        subtitle={naoLidas > 0 ? `${naoLidas} não lida(s)` : "Tudo em dia"}
        backTo="/inicio"
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-5 md:pb-10">
        <h1 className="mb-4 hidden text-2xl font-bold md:block">Notificações</h1>

        {itens.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={marcarTodasComoLidas}
              disabled={naoLidas === 0}
            >
              <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" /> Excluir todas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deseja realmente excluir todas as notificações?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={excluirTodas}>Excluir todas</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : itens.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Você ainda não possui notificações.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {grupos.map(({ grupo, lista }) => (
              <section key={grupo}>
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {grupo}
                </h2>
                <div className="space-y-2">
                  {lista.map((n) => {
                    const meta = metaDe(n.tipo);
                    const Icone = meta.icon;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border p-3 transition-colors",
                          n.lida
                            ? "border-border bg-card"
                            : "border-primary/30 bg-primary/5"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => abrir(n)}
                          className="flex min-w-0 flex-1 items-start gap-3 text-left"
                        >
                          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", meta.tint)}>
                            <Icone className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "truncate text-sm",
                                  n.lida ? "font-medium text-foreground" : "font-bold text-foreground"
                                )}
                              >
                                {n.titulo}
                              </span>
                              {!n.lida && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                            </span>
                            {n.descricao && (
                              <span className="mt-0.5 block break-words text-xs text-muted-foreground">
                                {n.descricao}
                              </span>
                            )}
                            <span className="mt-1 block text-[11px] text-muted-foreground">
                              {formatarDataHora(n.created_at)} · {n.lida ? "Lida" : "Não lida"}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label="Excluir notificação"
                          onClick={() => excluir(n.id)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {temMais && (
              <div className="pt-1 text-center">
                <Button variant="ghost" size="sm" onClick={carregarMais} disabled={carregandoMais}>
                  {carregandoMais ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
};

export default Notificacoes;

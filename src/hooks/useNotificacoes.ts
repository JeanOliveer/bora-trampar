import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Notificacao } from "@/lib/notificacoes";

const PAGINA = 20;

/** Apenas o contador de não lidas (usado no badge do sino). */
export const useNotificacoesNaoLidas = () => {
  const { user } = useAuth();
  const [naoLidas, setNaoLidas] = useState(0);

  const carregar = useCallback(async (userId: string) => {
    const { count } = await supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("lida", false);
    setNaoLidas(count ?? 0);
  }, []);

  useEffect(() => {
    if (!user) {
      setNaoLidas(0);
      return;
    }
    carregar(user.id);

    let timer: ReturnType<typeof setTimeout>;
    const channel = supabase
      .channel(`notificacoes-badge-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes", filter: `user_id=eq.${user.id}` },
        () => {
          clearTimeout(timer);
          timer = setTimeout(() => carregar(user.id), 350);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [user, carregar]);

  return naoLidas;
};

/** Lista paginada + ações. */
export const useNotificacoes = () => {
  const { user } = useAuth();
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const offset = useRef(0);

  const buscar = useCallback(
    async (userId: string, inicio: number) => {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("id, user_id, tipo, titulo, descricao, rota, entidade_id, lida, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(inicio, inicio + PAGINA - 1);
      if (error) return [];
      setTemMais((data?.length ?? 0) === PAGINA);
      return (data ?? []) as Notificacao[];
    },
    []
  );

  const recarregar = useCallback(async () => {
    if (!user) return;
    offset.current = 0;
    const data = await buscar(user.id, 0);
    setItens(data);
    setLoading(false);
  }, [user, buscar]);

  useEffect(() => {
    if (!user) {
      setItens([]);
      setLoading(false);
      return;
    }
    recarregar();

    let timer: ReturnType<typeof setTimeout>;
    const channel = supabase
      .channel(`notificacoes-lista-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes", filter: `user_id=eq.${user.id}` },
        () => {
          clearTimeout(timer);
          timer = setTimeout(recarregar, 350);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [user, recarregar]);

  const carregarMais = useCallback(async () => {
    if (!user || carregandoMais) return;
    setCarregandoMais(true);
    offset.current += PAGINA;
    const data = await buscar(user.id, offset.current);
    setItens((prev) => [...prev, ...data]);
    setCarregandoMais(false);
  }, [user, carregandoMais, buscar]);

  const marcarComoLida = useCallback(
    async (id: string) => {
      setItens((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
      await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    },
    []
  );

  const marcarTodasComoLidas = useCallback(async () => {
    if (!user) return;
    setItens((prev) => prev.map((n) => ({ ...n, lida: true })));
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
  }, [user]);

  const excluir = useCallback(async (id: string) => {
    setItens((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notificacoes").delete().eq("id", id);
  }, []);

  const excluirTodas = useCallback(async () => {
    if (!user) return;
    setItens([]);
    setTemMais(false);
    await supabase.from("notificacoes").delete().eq("user_id", user.id);
  }, [user]);

  return {
    itens,
    loading,
    carregandoMais,
    temMais,
    carregarMais,
    marcarComoLida,
    marcarTodasComoLidas,
    excluir,
    excluirTodas,
    recarregar,
  };
};

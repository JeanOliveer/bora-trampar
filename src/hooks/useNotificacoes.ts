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

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setNaoLidas(0);
      return;
    }
    carregar(userId);

    let timer: ReturnType<typeof setTimeout>;
    const channel = supabase
      .channel(`notificacoes-badge-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes", filter: `user_id=eq.${userId}` },
        () => {
          clearTimeout(timer);
          timer = setTimeout(() => carregar(userId), 250);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [userId, carregar]);


  return naoLidas;
};

/** Lista paginada + ações. */
export const useNotificacoes = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const offset = useRef(0);

  const buscar = useCallback(
    async (uid: string, inicio: number) => {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("id, user_id, tipo, titulo, descricao, rota, entidade_id, lida, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .range(inicio, inicio + PAGINA - 1);
      if (error) return [];
      setTemMais((data?.length ?? 0) === PAGINA);
      return (data ?? []) as Notificacao[];
    },
    []
  );

  const recarregar = useCallback(async () => {
    if (!userId) return;
    offset.current = 0;
    const data = await buscar(userId, 0);
    setItens(data);
    setLoading(false);
  }, [userId, buscar]);

  useEffect(() => {
    if (!userId) {
      setItens([]);
      setLoading(false);
      return;
    }
    recarregar();

    const channel = supabase
      .channel(`notificacoes-lista-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes", filter: `user_id=eq.${userId}` },
        (payload) => {
          const nova = payload.new as Notificacao;
          setItens((prev) => (prev.some((n) => n.id === nova.id) ? prev : [nova, ...prev]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notificacoes", filter: `user_id=eq.${userId}` },
        (payload) => {
          const atual = payload.new as Notificacao;
          setItens((prev) => prev.map((n) => (n.id === atual.id ? { ...n, ...atual } : n)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notificacoes" },
        (payload) => {
          const antigo = payload.old as Partial<Notificacao>;
          if (!antigo?.id) return;
          setItens((prev) => prev.filter((n) => n.id !== antigo.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, recarregar]);

  const carregarMais = useCallback(async () => {
    if (!userId || carregandoMais) return;
    setCarregandoMais(true);
    offset.current += PAGINA;
    const data = await buscar(userId, offset.current);
    setItens((prev) => [...prev, ...data]);
    setCarregandoMais(false);
  }, [userId, carregandoMais, buscar]);

  const marcarComoLida = useCallback(
    async (id: string) => {
      setItens((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
      await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    },
    []
  );

  const marcarTodasComoLidas = useCallback(async () => {
    if (!userId) return;
    setItens((prev) => prev.map((n) => ({ ...n, lida: true })));
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", userId).eq("lida", false);
  }, [userId]);

  const excluir = useCallback(async (id: string) => {
    setItens((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notificacoes").delete().eq("id", id);
  }, []);

  const excluirTodas = useCallback(async () => {
    if (!userId) return;
    setItens([]);
    setTemMais(false);
    await supabase.from("notificacoes").delete().eq("user_id", userId);
  }, [userId]);


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

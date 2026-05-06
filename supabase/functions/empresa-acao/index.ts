import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

type Body =
  | { acao: "aprovar"; token: string; candidatura_id: string }
  | {
      acao: "avaliar";
      token: string;
      candidatura_id: string;
      estrelas: number;
      comentario?: string;
    }
  | { acao: "recontratar"; token: string; candidatura_id: string }
  | { acao: "confirmar_presenca"; token: string; candidatura_id: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const body = (await req.json()) as Body;
    if (!body || !("acao" in body) || !body.token || !body.candidatura_id) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Valida token e busca serviço
    const { data: cand } = await admin
      .from("candidaturas")
      .select("id, user_id, servico_id")
      .eq("id", body.candidatura_id)
      .maybeSingle();
    if (!cand) {
      return new Response(JSON.stringify({ error: "Candidatura não encontrada." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: srv } = await admin
      .from("servicos")
      .select("id, titulo, categoria, descricao, cidade, estado, valor, horario, empresa_nome, empresa_token, created_by")
      .eq("id", cand.servico_id)
      .maybeSingle();
    if (!srv || srv.empresa_token !== body.token) {
      return new Response(JSON.stringify({ error: "Token inválido para este serviço." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.acao === "aprovar") {
      const { error } = await admin
        .from("candidaturas")
        .update({
          aprovada_pela_empresa: true,
          aprovada_em: new Date().toISOString(),
          status: "aprovada",
        })
        .eq("id", cand.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.acao === "confirmar_presenca") {
      const { error } = await admin
        .from("candidaturas")
        .update({ presenca_confirmada_em: new Date().toISOString() })
        .eq("id", cand.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.acao === "avaliar") {
      const estrelas = Number(body.estrelas);
      if (!Number.isInteger(estrelas) || estrelas < 1 || estrelas > 5) {
        return new Response(JSON.stringify({ error: "Estrelas inválidas." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const comentario = (body.comentario ?? "").trim();
      if (estrelas <= 3 && comentario.length < 5) {
        return new Response(
          JSON.stringify({ error: "Comentário obrigatório (mín. 5 caracteres) para notas 1, 2 ou 3." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Marca conclusão
      await admin.from("candidaturas").update({ status: "concluida" }).eq("id", cand.id);
      // Avaliador = created_by do serviço (admin que publicou) como proxy
      const { error } = await admin.from("avaliacoes").insert({
        candidatura_id: cand.id,
        servico_id: srv.id,
        trabalhador_id: cand.user_id,
        avaliador_id: srv.created_by,
        estrelas,
        justificativa: comentario || null,
        tipo: "empresa_para_trabalhador",
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.acao === "recontratar") {
      const { data: novo, error } = await admin
        .from("servicos")
        .insert({
          titulo: srv.titulo,
          categoria: srv.categoria,
          descricao: srv.descricao,
          cidade: srv.cidade,
          estado: srv.estado,
          valor: srv.valor,
          horario: srv.horario,
          empresa_nome: srv.empresa_nome,
          created_by: srv.created_by,
        })
        .select("empresa_token")
        .single();
      if (error || !novo) throw error ?? new Error("Falha ao recontratar.");
      return new Response(JSON.stringify({ ok: true, novo_token: novo.empresa_token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

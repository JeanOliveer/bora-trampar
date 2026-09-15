import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const gerarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

const VALIDADE_MS = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Não autenticado." }, 401);
    }
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData } = await authClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Sessão inválida." }, 401);

    const body = (await req.json().catch(() => null)) as
      | { acao?: string; codigo?: string }
      | null;
    const acao = body?.acao;
    if (!acao) return json({ error: "Ação inválida." }, 400);

    const isAdmin = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => Boolean(data));

    const criarNovo = async () => {
      await admin
        .from("contratante_codigos")
        .update({ status_codigo: "expirado" })
        .eq("user_id", user.id)
        .eq("status_codigo", "ativo");

      const registro = {
        user_id: user.id,
        codigo: gerarCodigo(),
        status_codigo: "ativo",
        expira_em: new Date(Date.now() + VALIDADE_MS).toISOString(),
      };
      const { data, error } = await admin
        .from("contratante_codigos")
        .insert(registro)
        .select("codigo, status_codigo, expira_em, created_at")
        .single();
      if (error) throw error;
      return data;
    };

    // Gera (ou reaproveita) o código ativo do contratante logado
    if (acao === "gerar") {
      const { data: atual } = await admin
        .from("contratante_codigos")
        .select("codigo, status_codigo, expira_em, created_at")
        .eq("user_id", user.id)
        .eq("status_codigo", "ativo")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (atual && new Date(atual.expira_em).getTime() > Date.now()) {
        return json({ ok: true, ...atual });
      }
      return json({ ok: true, ...(await criarNovo()) });
    }

    const codigo = (body?.codigo ?? "").replace(/\D/g, "");

    // Contratante confirma o próprio código -> libera o painel Empresa
    if (acao === "validar") {
      if (codigo.length !== 6) return json({ error: "Informe os 6 dígitos do código." }, 400);

      const { data: registro } = await admin
        .from("contratante_codigos")
        .select("id, status_codigo, expira_em")
        .eq("user_id", user.id)
        .eq("codigo", codigo)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!registro) return json({ error: "Código inválido." }, 400);
      if (registro.status_codigo === "usado") return json({ error: "Este código já foi utilizado." }, 400);
      if (
        registro.status_codigo === "expirado" ||
        new Date(registro.expira_em).getTime() <= Date.now()
      ) {
        await admin
          .from("contratante_codigos")
          .update({ status_codigo: "expirado" })
          .eq("id", registro.id);
        return json({ error: "Código expirado. Solicite um novo no chat do suporte." }, 400);
      }

      await admin
        .from("contratante_codigos")
        .update({ status_codigo: "usado", usado_em: new Date().toISOString() })
        .eq("id", registro.id);

      await admin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "contratante" }, { onConflict: "user_id,role" });
      await admin.from("profiles").update({ user_type: "contratante" }).eq("user_id", user.id);

      return json({ ok: true });
    }

    // Conferência pelo suporte/administração
    if (acao === "conferir" || acao === "marcar_usado") {
      if (!isAdmin) return json({ error: "Acesso restrito." }, 403);
      if (codigo.length !== 6) return json({ error: "Informe os 6 dígitos do código." }, 400);

      const { data: registro } = await admin
        .from("contratante_codigos")
        .select("id, user_id, codigo, status_codigo, expira_em, created_at, usado_em")
        .eq("codigo", codigo)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!registro) return json({ error: "Código não encontrado." }, 404);

      const expirado =
        registro.status_codigo === "expirado" ||
        new Date(registro.expira_em).getTime() <= Date.now();

      const { data: perfil } = await admin
        .from("profiles")
        .select("nome_completo, cidade, estado")
        .eq("user_id", registro.user_id)
        .maybeSingle();

      if (acao === "conferir") {
        return json({
          ok: true,
          registro: {
            ...registro,
            status_codigo: expirado && registro.status_codigo === "ativo" ? "expirado" : registro.status_codigo,
          },
          perfil,
        });
      }

      if (registro.status_codigo === "usado") {
        return json({ error: "Este código já está marcado como usado." }, 400);
      }
      await admin
        .from("contratante_codigos")
        .update({ status_codigo: "usado", usado_em: new Date().toISOString() })
        .eq("id", registro.id);

      await admin
        .from("user_roles")
        .upsert({ user_id: registro.user_id, role: "contratante" }, { onConflict: "user_id,role" });
      await admin.from("profiles").update({ user_type: "contratante" }).eq("user_id", registro.user_id);

      return json({ ok: true, registro: { ...registro, status_codigo: "usado" }, perfil });
    }

    return json({ error: "Ação desconhecida." }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado." }, 500);
  }
});

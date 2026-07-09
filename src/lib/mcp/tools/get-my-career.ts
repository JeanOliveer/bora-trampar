import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_my_career",
  title: "Get my career stats",
  description:
    "Return the signed-in worker's UaiTrampo career summary: pontuação, total applications, approved, completed shifts and last 5 ratings received.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [profileRes, candidaturasRes, avaliacoesRes] = await Promise.all([
      supabase.from("profiles").select("nome_completo, pontuacao").eq("user_id", userId).maybeSingle(),
      supabase.from("candidaturas").select("status, aprovada_pela_empresa, expediente_encerrado_em").eq("user_id", userId),
      supabase
        .from("avaliacoes")
        .select("estrelas, justificativa, tipo, pontos, created_at")
        .eq("trabalhador_id", userId)
        .eq("tipo", "empresa_para_trabalhador")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (profileRes.error) {
      return { content: [{ type: "text", text: profileRes.error.message }], isError: true };
    }

    const candidaturas = candidaturasRes.data ?? [];
    const summary = {
      nome: profileRes.data?.nome_completo ?? null,
      pontuacao: profileRes.data?.pontuacao ?? 0,
      total_candidaturas: candidaturas.length,
      aprovadas: candidaturas.filter((c) => c.aprovada_pela_empresa).length,
      concluidas: candidaturas.filter((c) => c.expediente_encerrado_em).length,
      ultimas_avaliacoes: avaliacoesRes.data ?? [],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});

import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_my_candidaturas",
  title: "List my applications",
  description:
    "List the signed-in worker's UaiTrampo applications (candidaturas), with status, approval and check-in info, plus the linked service title.",
  inputSchema: {
    status: z
      .string()
      .optional()
      .describe("Optional status filter (e.g. pendente, aprovada, recusada)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("candidaturas")
      .select(
        "id, status, aprovada_pela_empresa, aprovada_em, chegada_confirmada_em, checkin_em, expediente_encerrado_em, cidade, bairro, created_at, servico_id, servicos!inner(titulo, categoria, data_servico, horario, valor, empresa_nome)",
      )
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    return {
      content: [
        {
          type: "text",
          text:
            data && data.length
              ? JSON.stringify(data, null, 2)
              : "Você ainda não tem candidaturas.",
        },
      ],
      structuredContent: { candidaturas: data ?? [], count: data?.length ?? 0 },
    };
  },
});

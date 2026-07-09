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
  name: "list_available_services",
  title: "List available services",
  description:
    "List active UaiTrampo services (diárias) the signed-in worker can apply to. Optionally filter by city or category and limit results.",
  inputSchema: {
    cidade: z.string().optional().describe("Filter by city name (case-sensitive match)."),
    categoria: z.string().optional().describe("Filter by service category."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ cidade, categoria, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("servicos")
      .select(
        "id, titulo, descricao, categoria, cidade, estado, data_servico, horario, valor, requisitos, empresa_nome, empresa_pontuacao",
      )
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (cidade) query = query.eq("cidade", cidade);
    if (categoria) query = query.eq("categoria", categoria);

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
              : "Nenhum serviço disponível no momento com esses filtros.",
        },
      ],
      structuredContent: { services: data ?? [], count: data?.length ?? 0 },
    };
  },
});

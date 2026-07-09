import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfileTool from "./tools/get-my-profile";
import listAvailableServicesTool from "./tools/list-available-services";
import listMyCandidaturasTool from "./tools/list-my-candidaturas";
import getMyCareerTool from "./tools/get-my-career";

// Direct Supabase issuer, built from the project ref (Vite inlines this at build).
// Fallback keeps the string well-formed during throwaway manifest extraction.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "uaitrampo-mcp",
  title: "UaiTrampo",
  version: "0.1.0",
  instructions:
    "Ferramentas do UaiTrampo (plataforma de diárias). Use get_my_profile para dados do trabalhador logado, list_available_services para vagas ativas, list_my_candidaturas para acompanhar candidaturas e get_my_career para pontuação e histórico de avaliações. Todas as ações rodam como o usuário conectado, respeitando as permissões do banco.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfileTool, listAvailableServicesTool, listMyCandidaturasTool, getMyCareerTool],
});

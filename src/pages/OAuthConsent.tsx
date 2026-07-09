import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AuthorizationDetails = {
  client?: { name?: string; client_name?: string; redirect_uri?: string } | null;
  scope?: string | null;
  scopes?: string[] | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

// The @supabase/supabase-js `auth.oauth` namespace is in beta; keep a small typed wrapper.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("authorization_id ausente na URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não retornou uma URL de redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "um aplicativo";
  const redirectUri = details?.client?.redirect_uri;
  const scopeList =
    details?.scopes ??
    (details?.scope ? details.scope.split(/\s+/).filter(Boolean) : []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005e91] via-[#004a73] to-[#00314d] px-5 py-10 text-white">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
          <Briefcase className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <div className="w-full rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-lg">
          {error ? (
            <>
              <h1 className="text-lg font-bold">Não foi possível carregar essa autorização</h1>
              <p className="mt-2 break-words text-sm text-white/80">{error}</p>
            </>
          ) : !details ? (
            <p className="text-sm text-white/80">Carregando pedido de autorização…</p>
          ) : (
            <>
              <h1 className="text-xl font-bold leading-tight">
                Conectar {clientName} à sua conta UaiTrampo
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Isto permite que {clientName} use o UaiTrampo agindo como você. As permissões e políticas do
                banco continuam valendo — o app só verá o que a sua conta pode ver.
              </p>

              {redirectUri && (
                <p className="mt-4 break-words rounded-xl bg-white/10 p-3 text-[12px] text-white/70">
                  Redireciona para: <span className="font-mono">{redirectUri}</span>
                </p>
              )}

              {scopeList.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Permissões solicitadas
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {scopeList.map((s) => (
                      <li key={s} className="rounded-lg bg-white/5 px-3 py-1.5 text-white/80">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  disabled={busy}
                  onClick={() => decide(true)}
                  className="h-12 rounded-2xl bg-[#061426] text-sm font-semibold text-white shadow-xl transition active:scale-[0.97] hover:bg-[#0a1d3a] disabled:opacity-60"
                >
                  {busy ? "Processando…" : "Aprovar e conectar"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => decide(false)}
                  className="h-12 rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/20 transition active:scale-[0.97] hover:bg-white/15 disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

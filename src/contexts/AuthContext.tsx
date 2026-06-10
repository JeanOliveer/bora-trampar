import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  id: string;
  user_id: string;
  user_type: "trabalhador";
  nome_completo: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  estado_civil: string | null;
  cidade: string | null;
  estado: string | null;
  chave_pix: string | null;
  pontuacao?: number | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  profileLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const fetchInFlight = useRef<{ userId: string; promise: Promise<void> } | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchInFlight.current?.userId === userId) return fetchInFlight.current.promise;
    setProfileLoading(true);
    const promise = (async () => {
      const [{ data: profileData }, { data: roleData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, user_id, user_type, nome_completo, cpf, data_nascimento, estado_civil, cidade, estado, chave_pix, pontuacao")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
      ]);
      setProfile(profileData as unknown as Profile | null);
      setIsAdmin(!!roleData);
    })();
    fetchInFlight.current = { userId, promise };
    try {
      await promise;
    } catch {
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setProfileLoading(false);
      fetchInFlight.current = null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      const nextUser = newSession?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        // defer to avoid deadlocks with onAuthStateChange
        setTimeout(() => {
          if (mounted) fetchProfile(nextUser.id);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      if (!mounted) return;
      setSession(initial);
      const initialUser = initial?.user ?? null;
      setUser(initialUser);
      if (initialUser) {
        fetchProfile(initialUser.id);
      } else {
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({ user, session, profile, isAdmin, loading, profileLoading, signOut, refreshProfile }),
    [user, session, profile, isAdmin, loading, profileLoading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

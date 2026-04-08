import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SESSION_KEY = "achromis_session_token";
const EMAIL_KEY = "achromis_session_email";

export interface AuthState {
  token: string | null;
  email: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  _setSession: (token: string, email: string) => void;
  _clearSession: () => void;
  _setLoading: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  );
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(EMAIL_KEY),
  );
  const [isLoading, setIsLoading] = useState(
    !!localStorage.getItem(SESSION_KEY),
  );

  const _setSession = useCallback((newToken: string, newEmail: string) => {
    localStorage.setItem(SESSION_KEY, newToken);
    localStorage.setItem(EMAIL_KEY, newEmail);
    setToken(newToken);
    setEmail(newEmail);
  }, []);

  const _clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setEmail(null);
  }, []);

  const _setLoading = useCallback((v: boolean) => setIsLoading(v), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        isLoggedIn: !!token,
        isLoading,
        _setSession,
        _clearSession,
        _setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}

// Public-facing hook — exposes only what consumers need
export function useAuth() {
  const { token, email, isLoggedIn, isLoading, _clearSession } =
    useAuthContext();
  return { token, email, isLoggedIn, isLoading, _clearSession };
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export { SESSION_KEY, EMAIL_KEY };

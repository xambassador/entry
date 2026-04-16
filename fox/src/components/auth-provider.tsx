import { createContext, use, useEffect, useState } from "react";

import { getSession } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";
type State = { isAuthenticated: boolean; status: Status };

const AuthContext = createContext<State | undefined>(undefined);

export function AuthProvider(props: React.PropsWithChildren) {
  const [status, setStatus] = useState<Status>("idle");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function verifySession() {
      setStatus("loading");
      try {
        const res = await getSession({ signal: controller.signal });
        if (res.status === "authenticated") {
          setIsAuthenticated(true);
          setStatus("success");
          return;
        }
        setIsAuthenticated(false);
        setStatus("success");
      } catch {
        setIsAuthenticated(false);
        setStatus("error");
      }
    }

    verifySession();

    return () => {
      controller.abort();
    };
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated, status }}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    // Ideally I need to throw an error here but since write page is not wrapped in AuthProvider but it use shared
    // editor component which read auth status, I just return false as auth status.
    return { isAuthenticated: false, status: "idle" as Status };
  }
  return { isAuthenticated: context.isAuthenticated, status: context.status };
}

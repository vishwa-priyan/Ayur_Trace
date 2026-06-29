import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "lab" | "stakeholder";
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("ayurtrace_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("ayurtrace_token");
          localStorage.removeItem("ayurtrace_user");
          setUser(null);
        }
      } catch (error) {
        console.error("Error verifying authentication token:", error);
        // Fall back to cached user in local storage to handle offline or quick-loads
        const cachedUser = localStorage.getItem("ayurtrace_user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("ayurtrace_token", token);
    localStorage.setItem("ayurtrace_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("ayurtrace_token");
    localStorage.removeItem("ayurtrace_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
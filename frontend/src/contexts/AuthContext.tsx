import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, TokenResponse } from "../types";
import { authApi } from "../api/client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: TokenResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("opentext_wordle_token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("opentext_wordle_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      localStorage.setItem("opentext_wordle_user", JSON.stringify(freshUser));
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = (data: TokenResponse) => {
    setToken(data.access_token);
    localStorage.setItem("opentext_wordle_token", data.access_token);

    const userObj: User = {
      id: data.user_id,
      username: data.username,
      role: data.role,
      created_at: new Date().toISOString(),
    };
    setUser(userObj);
    localStorage.setItem("opentext_wordle_user", JSON.stringify(userObj));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("opentext_wordle_token");
    localStorage.removeItem("opentext_wordle_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "ADMIN",
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

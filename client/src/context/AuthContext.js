import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, parseError } from "../services/api";

const AuthContext = createContext(null);
const HYDRATE_TIMEOUT_MS = 5000;

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Auth request timed out")), timeoutMs);
    }),
  ]);

const normalizeUser = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  return {
    ...rawUser,
    id: rawUser.id || rawUser._id,
    preferences: {
      animationIntensity: "medium",
      soundEnabled: true,
      autoAdvance: false,
      ...(rawUser.preferences || {}),
    },
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem("token");
      setToken("");
    }
    setUser(normalizeUser(nextUser));
  };

  const hydrate = async () => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }

    try {
      const me = await withTimeout(authApi.me(), HYDRATE_TIMEOUT_MS);
      setUser(normalizeUser(me));
    } catch (err) {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const login = async (credentials) => {
    setError("");
    try {
      const data = await authApi.login(credentials);
      setSession(data.token, data.user);
      return data.user;
    } catch (err) {
      const message = parseError(err, "Login failed");
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (payload) => {
    setError("");
    try {
      const data = await authApi.register(payload);
      setSession(data.token, data.user);
      return data.user;
    } catch (err) {
      const message = parseError(err, "Registration failed");
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    setSession("", null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      setUser,
    }),
    [token, user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cf_token");
    if (!token) return setLoading(false);
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("cf_token"))
      .finally(() => setLoading(false));
  }, []);

  const persist = ({ token, user }) => {
    localStorage.setItem("cf_token", token);
    setUser(user);
  };

  const login = async (email, password) => persist((await api.post("/auth/login", { email, password })).data);
  const register = async (payload) => persist((await api.post("/auth/register", payload)).data);
  const logout = () => {
    localStorage.removeItem("cf_token");
    setUser(null);
  };
  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

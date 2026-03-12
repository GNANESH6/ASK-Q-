import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await api.get("/auth/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      }

      setLoading(false);
    };

    checkLoggedin();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.token;

    localStorage.setItem("token", token);

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(res.data.user);
  };

  // REGISTER
  const register = async (userData) => {
    await api.post("/auth/register", userData);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
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

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          const res = await api.get("/auth/profile");
          setUser(res.data);
        } catch (err) {
          console.error(err);
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        }
      }

      setLoading(false);
    };

    checkLoggedin();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);

    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

    setUser(res.data.user);
  };

  const register = async (userData) => {
    await api.post("/auth/register", userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
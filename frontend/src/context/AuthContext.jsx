import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/users/profile");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data.requireOtp) {
      setUser(data);
    }
    return data;
  };

  const verifyLoginOtp = async (email, code) => {
    const { data } = await api.post("/auth/verify-login-otp", { email, code });
    setUser(data);
    return data;
  };

  const resendLoginOtp = async (email) => {
    const { data } = await api.post("/auth/resend-login-otp", { email });
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const { data } = await api.post("/auth/reset-password", { email, code, newPassword });
    return data;
  };

  const register = async (name, email, phone, password, customUserId) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      phone,
      password,
      customUserId,
    });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        verifyLoginOtp,
        resendLoginOtp,
        forgotPassword,
        resetPassword,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

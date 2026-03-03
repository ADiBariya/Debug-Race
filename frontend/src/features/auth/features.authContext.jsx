import { createContext, useContext, useEffect, useState } from "react";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "./features.authAPI";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
  try {
    const res = await getCurrentUser();

    console.log("PROFILE RESPONSE:", res.data);

    // if backend sends { user: {...} }
    setUser(res.data.user || res.data);

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUser();
  }, []);

  const register = async (data) => {
    await registerUser(data);
    await fetchUser();
  };

  const login = async (data) => {
    await loginUser(data);
    await fetchUser();
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const profile = async()=>{
    await getCurrentUser(data);
    await fetchUser();
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout , profile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { createContext, useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  async function checkAuth() {
    try{
      const userData = await axiosInstance.get("/api/auth/get-me")
      setUser(userData.data.user)
    }catch(error) {
      setUser(null)
    } finally {
      setIsLoading(false)
  }
  }

  checkAuth();
}, []);

  function login(userData) {
    setUser(userData)
  }

  async function logout() {
    await axiosInstance.post("/api/auth/logout");
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user, isLoading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}
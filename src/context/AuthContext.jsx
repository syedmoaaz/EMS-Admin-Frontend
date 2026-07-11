import { createContext, useContext, useState, useEffect } from "react";
import { authenticateUser } from "../data/auth";

const AUTH_STORAGE_KEY = "ems_auth_user";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);

  const login = (userId, password) => {
    const authenticatedUser = authenticateUser(userId, password);

    if (!authenticatedUser) {
      return { success: false, message: "Invalid User ID or password." };
    }

    setUser(authenticatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

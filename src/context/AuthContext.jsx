import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const TOKEN_KEY = "ems_auth_token";
const USER_KEY = "ems_auth_user";

const AuthContext = createContext(null);

const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  return error.response?.data?.message || error.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: currentUser } = await authService.getProfile();
        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (userId, password) => {
    try {
      const { token, user: authenticatedUser } = await authService.login(
        userId.trim().toLowerCase(),
        password
      );

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, "Invalid email or password."),
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateUser,
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

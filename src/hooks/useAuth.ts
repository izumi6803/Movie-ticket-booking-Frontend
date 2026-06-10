"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthState, LoginCredentials, RegisterCredentials, UserRole } from "@/types";
import { authApi } from "@/services/api";

// Singleton to prevent multiple auth checks
let globalAuthChecked = false;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: !globalAuthChecked,
  });
  const router = useRouter();
  const isChecking = useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (globalAuthChecked || isChecking.current) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkAuth = async () => {
      isChecking.current = true;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          globalAuthChecked = true;
          return;
        }

        const response = await authApi.me();
        if (response.success) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          localStorage.removeItem("token");
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        localStorage.removeItem("token");
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      } finally {
        globalAuthChecked = true;
        isChecking.current = false;
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        localStorage.setItem("token", response.data.token);
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Redirect based on role
        const redirectPath =
          response.data.user.role === "admin" ? "/admin/dashboard" : "/customer/home";
        router.push(redirectPath);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authApi.register(credentials);
      if (response.success) {
        localStorage.setItem("token", response.data.token);
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        router.push("/customer/home");
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("token");
      globalAuthChecked = false;
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      router.push("/auth/login");
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role;
  };

  const isAdmin = (): boolean => hasRole("admin");
  const isCustomer = (): boolean => hasRole("customer");

  return {
    ...authState,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isCustomer,
  };
}

// src/api/auth.js
import apiClient from "../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Auth API functions
export const authAPI = {
  signup: async (data) => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  googleAuth: async (data) => {
    const response = await apiClient.post("/auth/google", data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },
};

// Auth hooks
export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["user"], data.user);
    },
    onError: (error) => {
      console.error("Signup failed:", error);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["user"], data.user);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.googleAuth,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["user"], data.user);
    },
    onError: (error) => {
      console.error("Google auth failed:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Clear tokens even on error
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      queryClient.clear();
    },
  });
};

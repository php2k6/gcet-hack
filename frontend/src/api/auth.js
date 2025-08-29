// src/api/auth.js
import apiClient from "../libs/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGoogleOneTapLogin } from "@react-oauth/google";

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
    console.log("Google auth successful data from backend:", response.data);
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



export const useGoogleButtonAuth = (type = "login") => {
  const googleAuthMutation = useGoogleAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("🔍 Google button login success:", credentialResponse);

    try {
      await googleAuthMutation.mutateAsync({
        id_token: credentialResponse.credential,
        type: type,
      });
    } catch (error) {
      console.error(`❌ Google button ${type} error:`, error);
    }
  };

  const handleGoogleError = () => {
    console.log("Google button login failed");
    const action = type === "signup" ? "Sign up" : "Sign in";
    alert(`Google ${action} failed. Please try again.`);
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
    isLoading: googleAuthMutation.isPending,
  };
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.googleAuth,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("user_data", JSON.stringify(data.user)); // Additional storage for compatibility
      console.log("Google auth successful:", data.user);
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

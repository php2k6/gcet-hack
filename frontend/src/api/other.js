// src/api/notifications.js
import apiClient from "../lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Notifications API functions
export const notificationsAPI = {
  getNotifications: async () => {
    const response = await apiClient.get("/notification");
    return response.data;
  },

  markAsRead: async () => {
    const response = await apiClient.patch("/notifications/read/");
    return response.data;
  },
};

// Notifications hooks
export const useGetNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsAPI.getNotifications,
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });
};

// src/api/stats.js
// import apiClient from "../lib/axios";
// import { useQuery } from "@tanstack/react-query";

// Stats API functions
export const statsAPI = {
  getIssueStats: async () => {
    const response = await apiClient.get("/stats/issues");
    return response.data;
  },
};

// Stats hooks
export const useGetIssueStats = () => {
  return useQuery({
    queryKey: ["stats", "issues"],
    queryFn: statsAPI.getIssueStats,
  });
};

// src/api/home.js
// import apiClient from "../lib/axios";
// import { useQuery } from "@tanstack/react-query";

// Home API functions
export const homeAPI = {
  getHomeData: async () => {
    const response = await apiClient.get("/home");
    return response.data;
  },
};

// Home hooks
export const useGetHomeData = () => {
  return useQuery({
    queryKey: ["home"],
    queryFn: homeAPI.getHomeData,
  });
};

// src/api/leaderboards.js
// import apiClient from "../lib/axios";
// import { useQuery } from "@tanstack/react-query";

// Leaderboards API functions
export const leaderboardsAPI = {
  getCitizenLeaderboard: async () => {
    const response = await apiClient.get("/leaderboards/citizen");
    return response.data;
  },

  getAuthorityLeaderboard: async () => {
    const response = await apiClient.get("/leaderboards/authority");
    return response.data;
  },
};

// Leaderboards hooks
export const useGetCitizenLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboards", "citizen"],
    queryFn: leaderboardsAPI.getCitizenLeaderboard,
  });
};

export const useGetAuthorityLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboards", "authority"],
    queryFn: leaderboardsAPI.getAuthorityLeaderboard,
  });
};

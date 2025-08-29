
// src/api/user.js
import apiClient from '../libs/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGoogleProfileImage } from '../utils/googleUtils';

// User API functions
export const userAPI = {
  getMe: async () => {
    const response = await apiClient.get('/user/me');
    return response.data;
  },
  
  updateMe: async (data) => {
    const response = await apiClient.patch('/user/me', data);
    return response.data;
  },
  
  deleteMe: async () => {
    const response = await apiClient.delete('/user/me');
    return response.data;
  },
  
  getUserById: async (userId) => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },
  
  updateUserById: async ({ userId, data }) => {
    const response = await apiClient.patch(`/user/${userId}`, data);
    return response.data;
  },
  
  deleteUserById: async (userId) => {
    const response = await apiClient.delete(`/user/${userId}`);
    return response.data;
  },
  
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/user/all', { params });
    return response.data;
  },
  
  getUserIssues: async (userId) => {
    const response = await apiClient.get(`/user/issues/${userId}`);
    return response.data;
  },
};

// User hooks
export const useGetMe = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: userAPI.getMe,
    enabled: !!localStorage.getItem('access_token'),
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userAPI.updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
      localStorage.setItem('user', JSON.stringify(data));
    },
  });
};

export const useDeleteMe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userAPI.deleteMe,
    onSuccess: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
};

export const useGetUserById = (userId) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userAPI.getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserById = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userAPI.updateUserById,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['user', variables.userId], data);
      queryClient.invalidateQueries(['user', 'all']);
    },
  });
};

export const useDeleteUserById = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userAPI.deleteUserById,
    onSuccess: (_, userId) => {
      queryClient.removeQueries(['user', userId]);
      queryClient.invalidateQueries(['user', 'all']);
    },
  });
};

export const useGetAllUsers = (params = {}) => {
  return useQuery({
    queryKey: ['user', 'all', params],
    queryFn: () => userAPI.getAllUsers(params),
    keepPreviousData: true,
  });
};

export const useGetUserIssues = (userId) => {
  return useQuery({
    queryKey: ['user', 'issues', userId],
    queryFn: () => userAPI.getUserIssues(userId),
    enabled: !!userId,
  });
};

// Hook to refresh Google profile image
export const useRefreshGoogleProfileImage = () => {
  return useMutation({
    mutationFn: async () => {
      const googleIdToken = localStorage.getItem('google_id_token');
      if (googleIdToken) {
        return await fetchGoogleProfileImage(googleIdToken);
      }
      return null;
    },
    onSuccess: (profileImageUrl) => {
      if (profileImageUrl) {
        console.log('Google profile image refreshed:', profileImageUrl);
        // Trigger a re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: profileImageUrl }));
      }
    },
    onError: (error) => {
      console.error('Failed to refresh Google profile image:', error);
    },
  });
};
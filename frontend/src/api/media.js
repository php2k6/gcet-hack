
// src/api/media.js
import apiClient from '../libs/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Media API functions
export const mediaAPI = {
  addMedia: async ({ issueId, data }) => {
    const response = await apiClient.post(`/media/${issueId}`, data);
    return response.data;
  },
  
  getMediaByIssue: async (issueId) => {
    const response = await apiClient.get(`/media/${issueId}`);
    return response.data;
  },
  
  deleteMedia: async (mediaId) => {
    const response = await apiClient.delete(`/media/${mediaId}`);
    return response.data;
  },
};

// Media hooks
export const useAddMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mediaAPI.addMedia,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['media', variables.issueId]);
    },
  });
};

export const useGetMediaByIssue = (issueId) => {
  return useQuery({
    queryKey: ['media', issueId],
    queryFn: () => mediaAPI.getMediaByIssue(issueId),
    enabled: !!issueId,
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mediaAPI.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
    },
  });
};

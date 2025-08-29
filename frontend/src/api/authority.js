
// src/api/authority.js
import apiClient from '../libs/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Authority API functions
export const authorityAPI = {
  getAuthorityById: async (authorityId) => {
    const response = await apiClient.get(`/authority/${authorityId}/`);
    return response.data;
  },
  
  updateAuthority: async ({ authorityId, data }) => {
    const response = await apiClient.patch(`/authority/${authorityId}/`, data);
    return response.data;
  },
};

// Authority hooks
export const useGetAuthorityById = (authorityId) => {
  return useQuery({
    queryKey: ['authority', authorityId],
    queryFn: () => authorityAPI.getAuthorityById(authorityId),
    enabled: !!authorityId,
  });
};

export const useUpdateAuthority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authorityAPI.updateAuthority,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['authority', variables.authorityId], data);
    },
  });
};

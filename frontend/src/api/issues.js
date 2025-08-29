
// src/api/issues.js
import apiClient from '../libs/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Issues API functions
export const issuesAPI = {
  createIssue: async (data) => {
    const response = await apiClient.post('/issues', data);
    return response.data;
  },
  
  getAllIssues: async (params = {}) => {
    const response = await apiClient.get('/issues', { params });
    return response.data;
  },
  
  getIssueById: async (issueId) => {
    const response = await apiClient.get(`/issues/${issueId}`);
    return response.data;
  },
  
  updateIssue: async ({ issueId, data }) => {
    const response = await apiClient.patch(`/issues/${issueId}`, data);
    return response.data;
  },
  
  deleteIssue: async (issueId) => {
    const response = await apiClient.delete(`/issues/${issueId}`);
    return response.data;
  },
};

// Issues hooks
export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: issuesAPI.createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
    },
  });
};

export const useGetAllIssues = (params = {}, options = {}) => {
  // Filter out empty values from params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );

  return useQuery({
    queryKey: ['issues', 'all', cleanParams],
    queryFn: () => issuesAPI.getAllIssues(cleanParams),
    keepPreviousData: true,
    ...options,
  });
};

// eg: get all issues /issues


export const useGetIssueById = (issueId) => {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => issuesAPI.getIssueById(issueId),
    enabled: !!issueId,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      console.error('Error fetching issue:', error);
    }
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: issuesAPI.updateIssue,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['issues', variables.issueId], data);
      queryClient.invalidateQueries(['issues', 'all']);
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: issuesAPI.deleteIssue,
    onSuccess: (_, issueId) => {
      queryClient.removeQueries(['issues', issueId]);
      queryClient.invalidateQueries(['issues', 'all']);
    },
  });
};

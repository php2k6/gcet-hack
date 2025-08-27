
// src/api/votes.js
import apiClient from '../lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Votes API functions
export const votesAPI = {
  voteIssue: async (issueId) => {
    const response = await apiClient.post(`/vote/${issueId}`);
    return response.data;
  },
  
  deleteVote: async (issueId) => {
    const response = await apiClient.delete(`/vote/${issueId}`);
    return response.data;
  },
};

// Votes hooks
export const useVoteIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: votesAPI.voteIssue,
    onSuccess: (data, issueId) => {
      queryClient.setQueryData(['issues', issueId], data);
      queryClient.invalidateQueries(['issues', 'all']);
    },
  });
};

export const useDeleteVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: votesAPI.deleteVote,
    onSuccess: (data, issueId) => {
      queryClient.setQueryData(['issues', issueId], data);
      queryClient.invalidateQueries(['issues', 'all']);
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import axios from "axios";
import type { Resume, ParsedResume } from "@shared/schema";

export function useResumes() {
  return useQuery({
    queryKey: ['/api/resumes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/resumes');
      return response.json() as Promise<Resume[]>;
    },
  });
}

export function useResume(id: number | null) {
  return useQuery({
    queryKey: ['/api/resumes', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiRequest('GET', `/api/resumes/${id}`);
      return response.json() as Promise<Resume>;
    },
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resumeData: ParsedResume) => {
      const response = await apiRequest('POST', '/api/resumes/manual', {
        resumeData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Resume Created",
        description: "Your resume has been created successfully.",
      });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      });
    },
  });
}

export function useOptimizeResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resumeId: number) => {
      const response = await apiRequest('POST', `/api/resumes/${resumeId}/optimize`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Optimization Complete",
        description: "Your resume has been optimized for better ATS compatibility.",
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize resume",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resumeId: number) => {
      const response = await apiRequest('DELETE', `/api/resumes/${resumeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Resume Deleted",
        description: "Resume has been permanently deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete resume",
        variant: "destructive",
      });
    },
  });
}

// Mutation for uploading a resume
const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await axios.post('/api/resumes/upload', formData);
  return data;
};

export const useUploadResume = () => {
  return useMutation({ mutationFn: uploadResume });
};

// Query for checking resume status
const fetchResumeStatus = async (resumeId: number) => {
  const { data } = await axios.get(`/api/resumes/${resumeId}/status`);
  return data;
};

export const useResumeStatus = (resumeId: number | null) => {
  return useQuery({
    queryKey: ['resumeStatus', resumeId],
    queryFn: () => fetchResumeStatus(resumeId!),
    enabled: !!resumeId,
    refetchInterval: (query) => {
      return query.state.data?.status === 'processed' || query.state.data?.status === 'error'
        ? false
        : 2000;
    },
  });
};
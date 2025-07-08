import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";

interface DashboardStats {
  resumesCreated: number;
  averageAtsScore: number;
  roleMatches: number;
  tailoredResumes: number;
  exports: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dashboard/stats');
      return response.json() as Promise<DashboardStats>;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/activities');
      return response.json() as Promise<Activity[]>;
    },
  });
}
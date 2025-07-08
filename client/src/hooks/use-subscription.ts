import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  subscriptionStatus: 'free' | 'plus' | 'pro';
  subscriptionExpiry?: string;
  resumeGenerationsUsed: number;
  resumeGenerationsLimit: number;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user');
      return response.json();
    },
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (plan: 'plus' | 'pro') => {
      const response = await apiRequest('POST', '/api/create-subscription', { plan });
      return response.json();
    },
    onSuccess: (data) => {
      // Show demo subscription success message instead of redirecting
      if (data.url) {
        toast({
          title: "Subscription Created!",
          description: `Successfully created ${data.plan?.toUpperCase()} plan subscription for $${data.price}/month. Demo checkout URL generated.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Error", 
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });
}

export function useSubscriptionLimits() {
  const { data: user } = useUser();
  
  const isPlus = user?.subscriptionStatus === 'plus';
  const isPro = user?.subscriptionStatus === 'pro';
  const isPaid = isPlus || isPro;
  
  const canGenerateResume = () => {
    if (!user) return false;
    if (isPaid) return user.resumeGenerationsUsed < user.resumeGenerationsLimit;
    return user.resumeGenerationsUsed < 1; // Free plan limit
  };
  
  return {
    isPaid,
    isPlus,
    isPro,
    subscriptionStatus: user?.subscriptionStatus || 'free',
    canGenerateResume: canGenerateResume(),
    resumeGenerationsUsed: user?.resumeGenerationsUsed || 0,
    resumeGenerationsLimit: user?.resumeGenerationsLimit || 1,
    canViewAllRoles: isPaid,
    maxRoleRecommendations: isPaid ? Infinity : 3,
    canTailorResume: isPaid,
    canExportResume: isPaid,
    canOptimizeResume: isPaid,
    canAccessInterviewSheets: isPro,
  };
}
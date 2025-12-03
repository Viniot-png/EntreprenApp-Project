import { useQuery } from '@tanstack/react-query';
import { userProfileService, UserProfile } from '@/lib/api/services/userProfile.service';

export const useUserProfile = (userId: string | null) => {
  const { data, isLoading, error, isError } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const result = await userProfileService.getUserProfile(userId);
      if (!result) {
        throw new Error('Données du profil invalides');
      }
      return result;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    profile: data,
    isLoading,
    error: error as Error | null,
    isError,
  };
};

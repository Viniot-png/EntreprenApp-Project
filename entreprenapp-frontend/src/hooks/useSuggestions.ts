import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suggestionsService } from '@/lib/api/services/suggestions.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour gérer les suggestions de connexion
 */
export const useSuggestions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer les suggestions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const response = await suggestionsService.getConnectionSuggestions();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Envoyer une demande de connexion
  const sendRequestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return suggestionsService.sendFriendRequest(targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast({
        title: 'Succès',
        description: 'Demande de connexion envoyée avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande de connexion',
        variant: 'destructive',
      });
    },
  });

  return {
    suggestions: data || [],
    isLoading,
    error,
    refetch,
    sendRequest: sendRequestMutation.mutate,
    isSending: sendRequestMutation.isPending,
  };
};

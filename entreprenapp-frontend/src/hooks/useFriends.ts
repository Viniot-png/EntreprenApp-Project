import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendService, type User } from '@/lib/api/services';
import { backendToFrontendUser } from '@/lib/api/utils/userAdapter';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour gérer les amis et connexions
 */
export const useFriends = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupérer la liste des amis
  const { data: friendsData, isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await friendService.getFriends();
      return response.friends.map((friend: any) => backendToFrontendUser(friend));
    },
  });

  // Récupérer tous les utilisateurs avec statut
  const { data: allUsersData, isLoading: isLoadingAllUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const response = await friendService.getAllUsers();
      // Map backend shape to frontend unified shape
      return (response.users || []).map((u: any) => backendToFrontendUser(u));
    },
  });

  // Récupérer les demandes en attente
  const { data: pendingRequestsData, isLoading: isLoadingPending } = useQuery({
    queryKey: ['friends', 'pending'],
    queryFn: async () => {
      const response = await friendService.getPendingRequests();
      return response.pendingRequests.map((request: any) => ({
        ...request,
        sender: request.sender ? backendToFrontendUser(request.sender) : null,
        receiver: request.receiver ? backendToFrontendUser(request.receiver) : null,
      }));
    },
  });

  // Envoyer une demande d'ami
  const sendRequestMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      return friendService.sendFriendRequest({ receiverId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'ami a été envoyée.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande',
        variant: 'destructive',
      });
    },
  });

  // Répondre à une demande
  const respondRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'accepted' | 'rejected' }) => {
      return friendService.respondToFriendRequest(requestId, { action });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast({
        title: variables.action === 'accepted' ? 'Demande acceptée' : 'Demande refusée',
        description: variables.action === 'accepted' 
          ? 'Vous êtes maintenant amis.' 
          : 'La demande a été refusée.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de traiter la demande',
        variant: 'destructive',
      });
    },
  });

  // Supprimer un ami
  const removeRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return friendService.removeFriend(friendId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
      toast({
        title: 'Ami supprimé',
        description: 'La connexion a été supprimée.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la connexion',
        variant: 'destructive',
      });
    },
  });

  return {
    friends: friendsData || [],
    allUsers: allUsersData || [],
    pendingRequests: pendingRequestsData || [],
    isLoading: isLoadingFriends || isLoadingPending || isLoadingAllUsers,
    sendFriendRequest: sendRequestMutation.mutate,
    respondToFriendRequest: respondRequestMutation.mutate,
    removeFriend: removeRequestMutation.mutate,
    isSending: sendRequestMutation.isPending,
    isResponding: respondRequestMutation.isPending,
    isRemoving: removeRequestMutation.isPending,
  };
};


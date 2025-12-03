import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '@/lib/api/services/comment.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook optimisé pour gérer les commentaires avec lazy loading et réponses
 */
export const useComments = (postId: string | undefined, enabled: boolean = false) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Charger les commentaires avec lazy loading
  const { data: comments, isLoading, error, refetch } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!postId) return [];
      const response = await commentService.getCommentsByPost(postId);
      
      // Charger les réponses pour chaque commentaire
      const commentsWithReplies = await Promise.all(
        (response.data || []).map(async (comment) => {
          try {
            const repliesResponse = await commentService.getCommentReplies(comment._id);
            return {
              ...comment,
              replies: repliesResponse.data || [],
            };
          } catch {
            return { ...comment, replies: [] };
          }
        })
      );
      
      return commentsWithReplies;
    },
    enabled: enabled && !!postId,
    staleTime: 30 * 1000, // Cache 30 secondes
    gcTime: 5 * 60 * 1000, // Garbage collect après 5 min
  });

  // Ajouter un commentaire
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!postId) throw new Error('Post ID is required');
      return commentService.addComment(postId, { content });
    },
    onSuccess: () => {
      // Invalider le cache pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast({
        title: 'Succès',
        description: 'Commentaire ajouté avec succès',
      });
    },
    onError: (error: any) => {
      console.error('Erreur ajout commentaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive',
      });
    },
  });

  // Ajouter une réponse
  const addReplyMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      return commentService.addReply(commentId, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast({
        title: 'Succès',
        description: 'Réponse ajoutée avec succès',
      });
    },
    onError: (error: any) => {
      console.error('Erreur ajout réponse:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la réponse',
        variant: 'destructive',
      });
    },
  });

  // Liker un commentaire
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return commentService.likeComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: any) => {
      console.error('Erreur like commentaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de liker le commentaire',
        variant: 'destructive',
      });
    },
  });

  // Supprimer un commentaire
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return commentService.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: any) => {
      console.error('Erreur suppression commentaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    },
  });

  // Mettre à jour un commentaire
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      return commentService.updateComment(commentId, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour commentaire:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le commentaire',
        variant: 'destructive',
      });
    },
  });

  return {
    comments: comments || [],
    isLoading,
    error,
    refetch,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    addReply: (commentId: string, content: string) =>
      addReplyMutation.mutateAsync({ commentId, content }),
    isAddingReply: addReplyMutation.isPending,
    likeComment: (commentId: string) => likeCommentMutation.mutateAsync(commentId),
    isLikingComment: likeCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutate,
    isDeletingComment: deleteCommentMutation.isPending,
    updateComment: updateCommentMutation.mutate,
    isUpdatingComment: updateCommentMutation.isPending,
  };
};

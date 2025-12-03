import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '@/lib/api/services';
import { backendToFrontendPost as adaptPost } from '@/lib/api/utils/dataAdapters';
import type { FrontendPost } from '@/lib/api/utils/dataAdapters';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useMemo } from 'react';

/**
 * Hook pour gérer les posts avec pagination infinie
 */
export const usePosts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Utiliser useInfiniteQuery pour la pagination infinie
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'public'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPublicPosts(pageParam, 10);
      return {
        posts: (response.data || []).map((post: any) => adaptPost(post)),
        pagination: response.pagination,
        pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pageParam + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // If authentication state changes (login/logout), refetch posts so isLiked is recalculated by backend
  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    // Only refetch after auth has finished loading
    if (!authLoading) {
      refetch();
    }
  }, [user?.id, authLoading]);

  // Combiner tous les posts des différentes pages
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts);
  }, [data?.pages]);

  // Créer un nouveau post
  const createPostMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      visibility?: 'public' | 'private' | 'connections';
      media?: File[];
    }) => {
      return postService.createPost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'public'] });
      toast({
        title: 'Post créé',
        description: 'Votre publication a été publiée avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le post',
        variant: 'destructive',
      });
    },
  });

  // Aimer/unliker un post
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return postService.likePost(postId);
    },
    onMutate: async (postId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts', 'public'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['posts', 'public']);

      // Optimistically update to new value
      queryClient.setQueryData(['posts', 'public'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => 
              post.id === postId || post._id === postId
                ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['posts', 'public'], context.previousData);
      }
      console.error('Erreur like:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de liker le post',
        variant: 'destructive',
      });
    },
    onSuccess: (response, postId) => {
      // Mettre à jour le cache avec la réponse du serveur pour assurer la persistence
      queryClient.setQueryData(['posts', 'public'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) => 
              post.id === postId || post._id === postId
                ? { ...post, isLiked: response.isLiked, likesCount: response.likesCount }
                : post
            ),
          })),
        };
      });
    },
  });

  // Supprimer un post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return postService.deletePost(postId);
    },
    onSuccess: (_, deletedPostId) => {
      // Mettre à jour le cache pour supprimer le post
      queryClient.setQueryData(['posts', 'public'], (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((p: FrontendPost) => p.id !== deletedPostId),
          })),
        };
      });
      toast({
        title: 'Post supprimé',
        description: 'Le post a été supprimé avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le post',
        variant: 'destructive',
      });
    },
  });

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return {
    posts,
    isLoading,
    error,
    refetch,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    likePost: likePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isDeleting: deletePostMutation.isPending,
    loadMore,
    hasNextPage: hasNextPage || false,
    isFetchingNextPage: isFetchingNextPage || false,
  };
};

/**
 * Hook pour obtenir un post spécifique
 */
export const usePost = (postId: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await postService.getPostById(postId);
      return adaptPost(response.data);
    },
    enabled: !!postId,
  });

  return {
    post: data,
    isLoading,
    error,
  };
};
import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CommentsSection from './CommentsSection';
import ShareDialog from './ShareDialog';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { commentService } from '@/lib/api/services/comment.service';
import { bookmarkService } from '@/lib/api/services/bookmark.service';
import { useAuth } from '@/hooks/useAuth';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  MoreHorizontal,
  Bookmark,
  BookmarkCheck,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const { likePost, deletePost, isDeleting } = usePosts();
  const { toast } = useToast();
  
  // Utiliser directement post.isLiked au lieu d'un state local
  // Cela garantit que le like persiste après refresh
  const isLiked = post.isLiked;
  const likesCount = post.likesCount;
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  // Plus besoin de synchroniser isLiked - on utilise directement post.isLiked
  // Cela résout le problème de persistence après refresh

  // Charger les commentaires SEULEMENT quand showComments est true
  useEffect(() => {
    if (!showComments || !post.id && !post._id) return;
    
    const loadComments = async () => {
      try {
        setLoadingComments(true);
        const response = await commentService.getCommentsByPost(
          post.id || post._id
        );
        
        // Charger les réponses pour chaque commentaire
        const adaptedComments = await Promise.all((response.data || []).map(async (comment: any) => {
          let replies: any[] = [];
          try {
            const repliesResponse = await commentService.getCommentReplies(comment._id);
            replies = (repliesResponse.data || []).map((reply: any) => ({
              id: reply._id,
              _id: reply._id,
              authorId: reply.author._id,
              author: {
                name: reply.author.fullname || reply.author.name,
                avatar: reply.author.profileImage?.url || '/placeholder.svg',
                role: reply.author.role
              },
              content: reply.content,
              likesCount: reply.likesCount || 0,
              isLiked: false,
              createdAt: reply.createdAt
            }));
          } catch (error) {
            console.error('Erreur chargement réponses:', error);
          }
          
          return {
            id: comment._id,
            _id: comment._id,
            authorId: comment.author._id,
            author: {
              name: comment.author.fullname || comment.author.name,
              avatar: comment.author.profileImage?.url || '/placeholder.svg',
              role: comment.author.role
            },
            content: comment.content,
            likesCount: comment.likesCount || 0,
            isLiked: false,
            replies: replies,
            createdAt: comment.createdAt
          };
        }));
        
        setComments(adaptedComments);
      } catch (error) {
        console.error('Erreur chargement commentaires:', error);
      } finally {
        setLoadingComments(false);
      }
    };
    loadComments();
  }, [showComments, post.id, post._id]);

  const handleLike = async () => {
    // Simplement appeler la mutation - React Query va mettre à jour le cache
    // qui va trigger un rerender du Dashboard qui va passer le nouveau post.isLiked
    likePost(post.id || post._id);
  };

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked);
      await bookmarkService.toggleBookmark(post.id || post._id);
      toast({
        title: isBookmarked ? "Post retiré des favoris" : "Post ajouté aux favoris",
        description: isBookmarked ? "Le post a été retiré de vos favoris." : "Le post a été ajouté à vos favoris.",
      });
    } catch (error) {
      // Rollback on error
      setIsBookmarked(!isBookmarked);
      toast({
        title: "Erreur",
        description: "Impossible de gérer les favoris",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async (postId: string, content: string): Promise<void> => {
    if (!content.trim()) return;
    try {
      const response = await commentService.addComment(postId, { content });
      const newComment = {
        id: response.data._id,
        _id: response.data._id,
        authorId: response.data.author._id,
        author: {
          name: response.data.author.fullname || response.data.author.name,
          avatar: response.data.author.profileImage?.url || '/placeholder.svg',
          role: response.data.author.role
        },
        content: response.data.content,
        likesCount: response.data.likesCount || 0,
        isLiked: false,
        replies: [],
        createdAt: response.data.createdAt
      };
      setComments([...comments, newComment]);
      setCommentsCount(commentsCount + 1);
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès"
      });
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleAddReply = async (commentId: string, content: string): Promise<void> => {
    if (!content.trim()) return;
    try {
      const response = await commentService.addReply(commentId, { content });
      const newReply = {
        id: response.data._id,
        _id: response.data._id,
        authorId: response.data.author._id,
        author: {
          name: response.data.author.fullname || response.data.author.name,
          avatar: response.data.author.profileImage?.url || '/placeholder.svg',
          role: response.data.author.role
        },
        content: response.data.content,
        likesCount: response.data.likesCount || 0,
        isLiked: false,
        createdAt: response.data.createdAt
      };
      
      // Mettre à jour le commentaire parent avec la nouvelle réponse
      setComments(comments.map(comment => 
        comment.id === commentId || comment._id === commentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      
      toast({
        title: "Succès",
        description: "Réponse ajoutée avec succès"
      });
    } catch (error) {
      console.error('Erreur ajout réponse:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la réponse",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await commentService.likeComment(commentId);
      // Mettre à jour le state local
      setComments(comments.map(comment => {
        if (comment.id === commentId || comment._id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1
          };
        }
        // Vérifier aussi dans les réponses
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId || reply._id === commentId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likesCount: reply.isLiked ? reply.likesCount - 1 : reply.likesCount + 1
                  }
                : reply
            )
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Erreur like commentaire:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return;
    try {
      await deletePost(post.id || post._id);
      toast({
        title: "Succès",
        description: "Post supprimé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le post",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 group">
      {/* Header */}
      <CardContent className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="gradient-gold text-white font-semibold">
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/profile/${post.author.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors duration-200 hover:underline"
                >
                  {post.author.name}
                </Link>
                <Badge variant="secondary" className="text-xs capitalize hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                  {post.author.role}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{post.author.company}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-foreground break-words whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* External Link */}
          {post.externalLink && (
            <div className="mt-4 border border-border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted">
                {post.externalLink.image && (
                  <img 
                    src={post.externalLink.image} 
                    alt={post.externalLink.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground line-clamp-1">
                      {post.externalLink.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {post.externalLink.description}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {new URL(post.externalLink.url).hostname}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 hover:bg-primary/10 hover:text-primary transition-all duration-200">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mt-4 space-y-2">
              {post.media.map((media, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  {media.type === 'image' && (
                    <img 
                      src={media.url} 
                      alt={media.title || 'Post image'}
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                  {media.type === 'video' && (
                    <video 
                      src={media.url} 
                      controls
                      className="w-full max-h-96"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-6 pt-4">
        <div className="w-full space-y-3">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{likesCount} likes</span>
            <div className="flex items-center space-x-4">
              <span>{commentsCount} comments</span>
              <span>{post.sharesCount} shares</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex-1 gap-2 transition-all duration-200 hover:scale-105 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950' 
                  : 'hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : ''}`} />
              Like
            </Button>
            <Collapsible open={showComments} onOpenChange={setShowComments}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-1 gap-2 hover:text-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105">
                  <MessageCircle className="h-4 w-4" />
                  Comment
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShareDialogOpen(true)}
              className="flex-1 gap-2 hover:text-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBookmark}
              className={`h-8 w-8 transition-all duration-200 hover:scale-105 ${
                isBookmarked 
                  ? 'text-primary bg-primary/10' 
                  : 'hover:text-primary hover:bg-primary/5'
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 scale-110" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            {user?.id === post.author?.id && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 transition-all duration-200 hover:scale-105 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Comments Section */}
          <Collapsible open={showComments} onOpenChange={setShowComments}>
            <CollapsibleContent className="mt-4 border-t border-border/50 pt-4">
              <CommentsSection
                postId={post.id}
                comments={comments}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                onAddReply={handleAddReply}
                onLikeReply={handleLikeComment}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardFooter>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        postId={post.id}
        postContent={post.content}
      />
    </Card>
  );
};

export default memo(PostCard);
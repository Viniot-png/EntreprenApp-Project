import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  _id?: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[]; // Réponses à ce commentaire
  createdAt: string;
}

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onAddReply?: (commentId: string, content: string) => void;
  onLikeReply?: (commentId: string) => void;
}

const CommentsSection = ({ 
  postId, 
  comments, 
  onAddComment, 
  onLikeComment,
  onAddReply,
  onLikeReply
}: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(postId, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim() || isReplySubmitting || !onAddReply) return;

    setIsReplySubmitting(true);
    try {
      await onAddReply(commentId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Erreur ajout réponse:', error);
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  return (
    <div className="space-y-4 animate-accordion-down">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {comments.map((comment, index) => (
            <div key={comment.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Main Comment */}
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback className="gradient-gold text-white text-sm">
                    {comment.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-accent/30 rounded-lg p-3 hover:bg-accent/50 transition-colors duration-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{comment.author.role}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLikeComment(comment.id)}
                      className={`h-6 px-2 text-xs transition-all duration-200 ${
                        comment.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <Heart className={`h-3 w-3 mr-1 transition-all duration-200 ${
                        comment.isLiked ? 'fill-current scale-110' : ''
                      }`} />
                      {comment.likesCount}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Répondre
                    </Button>
                    {comment.replies && comment.replies.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplies(comment.id)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary transition-all duration-200"
                      >
                        {expandedComments.has(comment.id) ? (
                          <ChevronUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        )}
                        {comment.replies.length}
                      </Button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && onAddReply && (
                    <div className="mt-3 ml-6 flex space-x-2">
                      <Textarea
                        placeholder="Écrire une réponse..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[40px] max-h-20 resize-none text-sm border border-border/50 focus:border-primary/50 transition-colors duration-200"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim() || isReplySubmitting}
                        className="gradient-gold hover:shadow-gold transition-all duration-200"
                      >
                        {isReplySubmitting ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Replies */}
                  {expandedComments.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-3 border-l-2 border-primary/20 pl-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                            <AvatarFallback className="text-xs">{reply.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="bg-accent/20 rounded p-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs text-foreground">{reply.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.createdAt))} ago
                                </span>
                              </div>
                              <p className="text-xs text-foreground break-words whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onLikeReply && onLikeReply(reply.id)}
                                className={`h-5 px-1 text-xs transition-all duration-200 ${
                                  reply.isLiked 
                                    ? 'text-red-500 hover:text-red-600' 
                                    : 'text-muted-foreground hover:text-primary'
                                }`}
                              >
                                <Heart className={`h-2.5 w-2.5 mr-0.5 transition-all duration-200 ${
                                  reply.isLiked ? 'fill-current scale-110' : ''
                                }`} />
                                {reply.likesCount}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border-t border-border/50 pt-4">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
            <AvatarFallback className="gradient-gold text-white text-sm">U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-2">
            <Textarea
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] max-h-24 resize-none text-sm border border-border/50 focus:border-primary/50 transition-colors duration-200"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isSubmitting}
                className="gradient-gold hover:shadow-gold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-2" />
                    Publier
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentsSection;
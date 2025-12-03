import { useParams } from 'react-router-dom';
import { usePost } from '@/hooks/usePosts';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import PostCard from '@/components/dashboard/PostCard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLoading from '@/components/ui/page-loading';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { post, isLoading } = usePost(id);
  const { comments, isLoading: isLoadingComments, addComment, deleteComment, updateComment } = useComments(id, !!id);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const { toast } = useToast();

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez écrire un commentaire',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addComment(commentText);
      setCommentText('');
      toast({
        title: 'Succès',
        description: 'Commentaire ajouté',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingText.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez écrire quelque chose',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateComment(commentId, editingText);
      setEditingCommentId(null);
      setEditingText('');
      toast({
        title: 'Succès',
        description: 'Commentaire modifié',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le commentaire',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast({
        title: 'Succès',
        description: 'Commentaire supprimé',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement du post..." />
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              Le post que vous cherchez n'existe pas ou a été supprimé.
            </p>
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Post</h1>
        </div>

        {/* Main Post */}
        <div className="animate-fade-in">
          <PostCard post={post} />
        </div>

        {/* Comments Section */}
        <Card className="border-t-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle>Commentaires ({comments?.length || 0})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment Form */}
            {user && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={typeof user.profileImage === 'string' ? user.profileImage : user.profileImage?.url} />
                    <AvatarFallback>{user.fullname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      placeholder="Ajouter un commentaire..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className="rounded-full"
                    />
                  </div>
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {isLoadingComments ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </>
              ) : comments && comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div key={comment._id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={typeof comment.userId?.profileImage === 'string' 
                          ? comment.userId?.profileImage 
                          : comment.userId?.profileImage?.url} 
                      />
                      <AvatarFallback>{comment.userId?.fullname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      {editingCommentId === comment._id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            placeholder="Modifier le commentaire..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateComment(comment._id)}
                              className="h-7"
                            >
                              Sauvegarder
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCommentId(null)}
                              className="h-7"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm">{comment.userId?.fullname}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { locale: fr, addSuffix: true })}
                              </p>
                            </div>
                            {user?._id === comment.userId?._id && (
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditingText(comment.content);
                                  }}
                                  className="h-7 w-7"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="h-7 w-7 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1 break-words">{comment.content}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun commentaire pour le moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Post;
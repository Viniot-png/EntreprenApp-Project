import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { bookmarkService } from '@/lib/api/services/bookmark.service';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/dashboard/PostCard';
import PageLoading from '@/components/ui/page-loading';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Bookmarks = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Récupérer les bookmarks - Le backend retourne directement les posts populés
  const { data: bookmarks = [], isLoading, refetch } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      try {
        const response = await bookmarkService.getBookmarks();
        // Backend retourne les posts directement dans data
        return response.data || [];
      } catch (error) {
        console.error('Erreur chargement bookmarks:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  const handleRemoveBookmark = async (postId: string) => {
    setRemovingId(postId);
    try {
      await bookmarkService.removeBookmark(postId);
      toast({
        title: 'Succès',
        description: 'Post retiré des favoris',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de retirer le post',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Mes Favoris</h1>
          </div>
          <p className="text-muted-foreground">
            {bookmarks.length} post{bookmarks.length !== 1 ? 's' : ''} sauvegardé{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48 bg-muted animate-pulse" />
              ))}
            </div>
          ) : bookmarks.length === 0 ? (
            <Card className="text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun post sauvegardé</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les posts que vous marquez comme favoris apparaîtront ici
              </p>
              <Link to="/dashboard" className="mt-4">
                <Button>Découvrir des posts</Button>
              </Link>
            </Card>
          ) : (
            bookmarks.map((post: any) => (
              <div key={post._id} className="relative group">
                <PostCard post={post} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveBookmark(post._id)}
                  disabled={removingId === post._id}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur"
                >
                  <Bookmark className="h-4 w-4 mr-2 fill-current" />
                  Retirer
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bookmarks;

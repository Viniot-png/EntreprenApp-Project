import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/useUserProfile';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Calendar, Users, FileText, AlertCircle } from 'lucide-react';

interface UserProfileDialogProps {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Error Boundary pour UserProfileDialog
 * Capture les erreurs de rendu et affiche une UI fallback
 */
class UserProfileErrorBoundary extends React.Component<
  { children: ReactNode; isOpen: boolean },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; isOpen: boolean }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[UserProfileErrorBoundary] Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open={this.props.isOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Erreur d'affichage du profil</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-sm text-muted-foreground">
                Une erreur est survenue lors du chargement du profil.
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                {this.state.error?.message || 'Erreur inconnue'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Réessayer
              </button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  userId,
  isOpen,
  onOpenChange,
}) => {
  const { profile, isLoading, error } = useUserProfile(userId && isOpen ? userId : null);

  // Error state - affiche un message d'erreur propre
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Erreur de chargement</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <p className="font-medium text-foreground">Impossible de charger le profil</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.message || 'Une erreur est survenue. Veuillez réessayer.'}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
            >
              Fermer
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chargement du profil...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No profile data - fallback UI
  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profil non disponible</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <p className="text-center text-sm text-muted-foreground">
              Les données du profil ne sont pas disponibles pour le moment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  // Render successful profile
  return (
    <UserProfileErrorBoundary isOpen={isOpen}>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Profil Utilisateur</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Header - Info Utilisateur */}
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary">
                    <AvatarImage src={profile?.user?.profileImage || ''} alt={profile?.user?.fullname} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold text-lg">
                      {profile?.user?.fullname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile?.user?.fullname || 'Utilisateur'}
                    </h2>
                    <p className="text-sm text-muted-foreground">@{profile?.user?.username || 'unknown'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {profile?.user?.role || 'Membre'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {profile?.user?.bio && (
                  <p className="text-sm text-foreground/80 italic">
                    "{profile.user.bio}"
                  </p>
                )}

                {profile?.user?.expertise && profile.user.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.user.expertise.map((exp, idx) => (
                      <Badge key={idx} variant="secondary">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  ✉️ {profile?.user?.email || 'N/A'}
                </p>
              </div>

              {/* Tabs pour Événements, Programmes et Publications */}
              <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="events" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Événements ({profile?.events?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Programmes ({profile?.projects?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Publications ({profile?.posts?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Événements Tab */}
                <TabsContent value="events" className="space-y-4 mt-4">
                  {profile?.events && profile.events.length > 0 ? (
                    <div className="space-y-3">
                      {profile.events.map((event) => {
                        try {
                          return (
                            <Card key={event._id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="flex gap-4">
                                  {event.image && (
                                    <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                      <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">
                                      {event.title || 'Événement sans titre'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {event.description || 'Pas de description'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                      {event.startDate && <span>📅 {format(new Date(event.startDate), 'dd MMM yyyy', { locale: fr })}</span>}
                                      {event.location && <span>📍 {event.location}</span>}
                                      {event.participants && <span>👥 {event.participants.length} participants</span>}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } catch (err) {
                          console.error('[UserProfileDialog] Error rendering event:', err);
                          return null;
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun événement pour le moment
                    </p>
                  )}
                </TabsContent>

                {/* Programmes Tab */}
                <TabsContent value="projects" className="space-y-4 mt-4">
                  {profile?.projects && profile.projects.length > 0 ? (
                    <div className="space-y-3">
                      {profile.projects.map((project) => {
                        try {
                          return (
                            <Card key={project._id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="flex gap-4">
                                  {project.image && (
                                    <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                      <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h3 className="font-semibold text-foreground">
                                          {project.title || 'Programme sans titre'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                          {project.description || 'Pas de description'}
                                        </p>
                                      </div>
                                      <Badge variant="outline" className="flex-shrink-0">
                                        {project.status || 'Actif'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                                      {project.category && <span>📂 {project.category}</span>}
                                      {project.members && <span>👥 {project.members.length} membres</span>}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } catch (err) {
                          console.error('[UserProfileDialog] Error rendering project:', err);
                          return null;
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun programme pour le moment
                    </p>
                  )}
                </TabsContent>

                {/* Publications Tab */}
                <TabsContent value="posts" className="space-y-4 mt-4">
                  {profile?.posts && profile.posts.length > 0 ? (
                    <div className="space-y-3">
                      {profile.posts.map((post) => {
                        try {
                          return (
                            <Card key={post._id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <p className="text-sm text-foreground line-clamp-3">{post.content || 'Pas de contenu'}</p>
                                {post.image && (
                                  <div className="mt-3 h-40 rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={post.image}
                                      alt="Post"
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  </div>
                                )}
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                                  <span>❤️ {post.likes?.length || 0} likes</span>
                                  <span>💬 {post.comments || 0} commentaires</span>
                                  {post.createdAt && <span>{format(new Date(post.createdAt), 'dd MMM yyyy', { locale: fr })}</span>}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } catch (err) {
                          console.error('[UserProfileDialog] Error rendering post:', err);
                          return null;
                        }
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune publication pour le moment
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </UserProfileErrorBoundary>
  );
};

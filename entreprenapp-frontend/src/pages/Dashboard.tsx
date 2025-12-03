import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/lib/api/services/event.service';
import { usePosts } from '@/hooks/usePosts';
import { useScreenSize } from '@/hooks/useScreenSize';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Navigate } from 'react-router-dom';
import PostCard from '@/components/dashboard/PostCard';
import CreatePostCard from '@/components/dashboard/CreatePostCard';
import PageLoading from '@/components/ui/page-loading';
import { ResponsiveStats } from '@/components/dashboard/ResponsiveStats';
import { LeftSidebar } from '@/components/dashboard/LeftSidebar';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { Button } from '@/components/ui/button';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
const Dashboard = () => {
  const { user, loading } = useAuth();
  const { posts, isLoading: isLoadingPosts, refetch, likePost, loadMore, hasNextPage, isFetchingNextPage } = usePosts();
  const { suggestions, sendRequest, isSending, refetch: refetchSuggestions } = useSuggestions();
  const { toast } = useToast();
  const { friends } = useFriends();
  const { data: sidebarEvents } = useQuery({
    queryKey: ['sidebarEvents'],
    queryFn: async () => {
      const r = await eventService.getEvents();
      return (r.data || []).slice(0, 3);
    },
  });
  const { isMobile, isTablet } = useScreenSize();
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStates, setConnectionStates] = useState<{[key: string]: 'idle' | 'pending' | 'connected'}>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Flux actualisé",
        description: "Votre flux a été mis à jour avec les dernières publications.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser le flux.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      await loadMore();
      if (!isFetchingNextPage) {
        toast({
          title: "Plus de posts chargés",
          description: "De nouvelles publications ont été chargées.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger plus de posts.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = useCallback((userId: string, personName: string) => {
    setConnectionStates(prev => ({ ...prev, [userId]: 'pending' }));
    sendRequest(userId);
    // Refetch les suggestions après un délai pour enlever l'utilisateur connecté de la liste
    setTimeout(() => {
      refetchSuggestions();
      setConnectionStates(prev => ({ ...prev, [userId]: 'connected' }));
    }, 800);
  }, [sendRequest, refetchSuggestions]);

  const handleOpenUserProfile = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setIsProfileDialogOpen(true);
  }, []);
  const handleNewPost = useCallback(() => {
    // Le post sera automatiquement ajouté via React Query
    refetch();
  }, [refetch]);

  // Optimisation du rendu des posts
  const memoizedPosts = useMemo(() => {
    return posts.map((post, index) => (
      <div 
        key={post.id} 
        className="animate-fade-in" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <PostCard post={post} />
      </div>
    ));
  }, [posts]);
  if (loading) {
    return <DashboardLayout>
        <PageLoading />
      </DashboardLayout>;
  }
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
    <DashboardLayout>
      <div className={`container mx-auto space-y-6 ${isMobile ? 'px-0 max-w-full' : 'px-4 md:px-6 lg:px-8 xl:max-w-7xl'}`}>
        {/* Welcome Banner */}
        <Card className="gradient-gold border-none text-white shadow-gold animate-fade-in">
          <CardContent className={isMobile ? "p-6" : "p-8"}>
            <div className={`flex items-center ${isMobile ? 'flex-col text-center space-y-4' : 'justify-between'}`}>
              <div className={isMobile ? 'order-2' : ''}>
                <h1 className={`font-bold mb-2 ${isMobile ? 'text-xl' : 'responsive-text-2xl'}`}>
                  Bienvenue, {user.name} 👋
                </h1>
                <p className={`text-white/80 ${isMobile ? 'text-sm' : 'responsive-text-base'}`}>
                  Découvrez les dernières opportunités et connectez-vous avec votre réseau
                </p>
              </div>
              {!isMobile && (
                <div className="hidden md:block">
                  <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center animate-float">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-white/20 text-white text-lg">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Now responsive */}
        <ResponsiveStats />

        {/* Main Content Layout - LinkedIn style 3-column grid */}
        <div className={`${isMobile ? 'space-y-6' : isTablet ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]'}`}>
          
          {/* Left Sidebar - Profile & Stats (Desktop only) */}
          {!isMobile && !isTablet && (
            <div className="col-span-3">
              <LeftSidebar />
            </div>
          )}

          {/* Main Feed */}
          <div className={`${isMobile ? 'space-y-6' : isTablet ? 'lg:col-span-1 space-y-6' : 'col-span-6 flex flex-col min-w-0'}`}>
            {/* Header - Fixed for desktop */}
            <div className={`flex items-center justify-between ${!isMobile && !isTablet ? 'pb-4 border-b border-border' : ''}`}>
              <div>
                <h2 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  Actualités
                </h2>
                <p className="text-muted-foreground text-sm">
                  Restez informé des dernières activités
                </p>
              </div>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="gap-2 hover:scale-105 transition-transform"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {!isMobile && "Actualiser"}
              </Button>
            </div>

            {/* Create Post Card - Only show on desktop and tablet */}
            {!isMobile && <CreatePostCard onNewPost={handleNewPost} />}

            {/* Posts Feed - Scrollable area for desktop */}
            <div className={!isMobile && !isTablet ? 'flex-1 overflow-hidden' : 'space-y-6'}>
              <ScrollArea className={!isMobile && !isTablet ? 'h-full pr-4' : 'h-auto'}>
                <div className="space-y-6">
                  {memoizedPosts}

                  {/* Load More - Affiche seulement si hasNextPage */}
                  {hasNextPage && (
                    <div className="text-center py-8">
                      {isFetchingNextPage ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                              <div className="w-full glass-effect shadow-elegant rounded-lg p-6">
                                <div className="flex space-x-4">
                                  <Skeleton className="h-12 w-12 rounded-full" />
                                  <div className="flex-1 space-y-3">
                                    <div className="space-y-2">
                                      <Skeleton className="h-4 w-1/4" />
                                      <Skeleton className="h-3 w-1/6" />
                                    </div>
                                    <div className="space-y-2">
                                      <Skeleton className="h-4 w-full" />
                                      <Skeleton className="h-4 w-5/6" />
                                      <Skeleton className="h-4 w-3/4" />
                                    </div>
                                    <Skeleton className="h-32 w-full rounded-lg" />
                                    <div className="flex justify-between">
                                      <Skeleton className="h-8 w-16" />
                                      <Skeleton className="h-8 w-20" />
                                      <Skeleton className="h-8 w-16" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={handleLoadMore}
                          disabled={isFetchingNextPage}
                          className={`hover:scale-105 transition-transform ${isMobile ? 'w-full' : 'w-full'}`}
                        >
                          {isFetchingNextPage ? "Chargement..." : "Charger plus de posts"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile, fixed height with scroll for desktop */}
          {!isMobile && (
            <div className={`${isTablet ? 'lg:col-span-1 space-y-6' : 'col-span-3 flex flex-col h-full overflow-hidden sticky top-20'}`}>
              <div className={isTablet ? 'space-y-6' : 'space-y-6 flex-1 overflow-hidden'}>
                {/* Suggestions removed per user request - replaced by events above */}

                {/* Événements - Simplified for tablet */}
                <Card className={`glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 animate-fade-in${!isMobile && !isTablet ? ' flex flex-col h-2/3' : ''}`} style={{ animationDelay: '0.1s' }}>
                  <CardHeader className="pb-4">
                    <CardTitle className={`text-foreground flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                      <div className="h-2 w-2 gradient-gold rounded-full animate-pulse"></div>
                      Événements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`${!isMobile && !isTablet ? 'flex-1 overflow-hidden' : 'space-y-3'}`}>
                    <ScrollArea className={!isMobile && !isTablet ? 'h-full' : 'h-auto'}>
                      <div className="space-y-3">
                        {(sidebarEvents || []).map((event: any, index: number) => {
                          const normalizeImg = (img: any) => {
                            if (!img) return null;
                            if (typeof img === 'string') return img;
                            return img.url || img.path || img.secure_url || null;
                          };
                          const thumb = normalizeImg(event?.images?.[0]) || normalizeImg(event?.image) || null;
                          const currencySymbols: any = { USD: '$', EUR: '€', XOF: 'CFA' };
                          return (
                          <div 
                            key={event._id || index} 
                            className="p-4 border border-border/50 rounded-lg hover:bg-accent/30 hover:border-primary/20 hover:shadow-gold/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                          >
                            <div className="flex items-start space-x-3">
                              {thumb ? (
                                <div className="flex-shrink-0">
                                  <img src={thumb} alt={event.title} className="h-16 w-20 object-cover rounded-md" />
                                </div>
                              ) : (
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={event.organizer?.avatar || ''} alt={event.title} />
                                  <AvatarFallback className="bg-muted-foreground text-foreground text-sm">{(event.title || '').charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}

                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                      {event.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{event.participantsCount ?? event.attendees ?? 0} participants</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {event.isPaid && (
                                      <div className="text-xs text-foreground/70 px-2 py-0.5 rounded-md border border-border/50">
                                        {currencySymbols[event.currency] ?? event.currency} {event.price ?? ''}
                                      </div>
                                    )}
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                                    >
                                      {new Date(event.startDate || event.date || '').toLocaleDateString?.() || ''}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center justify-start gap-2">
                                  <RouterLink to={`/events/${event._id}`} className="no-underline">
                                    <Button size="sm" variant="ghost" className="text-xs hover:bg-accent/60">Voir</Button>
                                  </RouterLink>
                                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">{event.location}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Tendances - Only on desktop */}
                {isTablet === false && (
                  <Card className="glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 animate-fade-in flex flex-col h-1/3" style={{ animationDelay: '0.2s' }}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <div className="h-2 w-2 gradient-gold rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        Tendances
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="space-y-2">
                          {["#StartupLife", "#Innovation", "#Fintech", "#AI", "#Sustainability"].map((trend, index) => (
                            <div 
                              key={index} 
                              className="p-3 hover:bg-accent/30 rounded-lg transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-md"
                            >
                              <p className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                                {trend}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
    {/* User Profile Dialog */}
    <UserProfileDialog 
      userId={selectedUserId} 
      isOpen={isProfileDialogOpen} 
      onOpenChange={setIsProfileDialogOpen}
    />
    </>
  );
};
export default Dashboard;
import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useFriends } from '@/hooks/useFriends';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, friendService } from '@/lib/api/services';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PostCard from '@/components/dashboard/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Calendar, 
  Edit, 
  UserPlus, 
  MessageCircle,
  MoreHorizontal,
  Camera,
  ArrowLeft,
  Check,
  X,
  Trash2,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { posts: allPosts } = usePosts();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { allUsers, sendFriendRequest, respondToFriendRequest, removeFriend } = useFriends();
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [uploadingImage, setUploadingImage] = useState<'profile' | 'cover' | null>(null);
  
  // Refs pour les inputs fichier
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Récupérer le profil de l'utilisateur
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (userId && userId !== currentUser?.id) {
        // Récupérer le profil d'un autre utilisateur
        return await authService.getUserProfile(userId);
      }
      // Récupérer le profil actuel
      return await authService.getProfile();
    },
    enabled: !!currentUser,
  });

  // Utiliser le profil récupéré ou l'utilisateur actuel
  const profileUser = profileData?.data || currentUser;
  const isOwnProfile = !userId || userId === currentUser?.id;

  // Trouver les informations de relation avec l'utilisateur
  const userRelation = allUsers.find(u => u.id === userId);

  // Filtrer les posts de l'utilisateur
  const userPosts = allPosts.filter(post => post.authorId === profileUser?.id);

  const handleConnect = async (targetUserId: string) => {
    if (loadingActions[targetUserId]) return;
    setLoadingActions(prev => ({ ...prev, [targetUserId]: true }));
    try {
      sendFriendRequest(targetUserId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleMessage = (targetUserId: string, targetName: string) => {
    navigate('/messages', {
      state: {
        newConversation: true,
        userId: targetUserId,
        userName: targetName
      }
    });
  };

  const handleDelete = async (targetUserId: string) => {
    if (loadingActions[targetUserId]) return;
    setLoadingActions(prev => ({ ...prev, [targetUserId]: false }));
    try {
      removeFriend(targetUserId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Gérer le changement d'image de profil
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage('profile');
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await authService.updateProfile(formData as any);

      if (response.success) {
        toast({
          title: 'Succès',
          description: 'Votre photo de profil a été mise à jour',
        });
        // Invalider la cache et refetch
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast({
          title: 'Erreur',
          description: response.message || 'Erreur lors de la mise à jour',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Profile image upload error:', error);
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Erreur lors du téléchargement',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  // Gérer le changement d'image de couverture
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage('cover');
    try {
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await authService.updateProfile(formData as any);

      if (response.success) {
        toast({
          title: 'Succès',
          description: 'Votre image de couverture a été mise à jour',
        });
        // Invalider la cache et refetch
        queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast({
          title: 'Erreur',
          description: response.message || 'Erreur lors de la mise à jour',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Cover image upload error:', error);
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Erreur lors du téléchargement',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(null);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = '';
      }
    }
  };

  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileUser) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground">User not found</h2>
          <p className="text-muted-foreground mt-2">The profile you're looking for doesn't exist.</p>
          <Link to="/network">
            <Button className="mt-4">Back to Network</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Back Button */}
        {!isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/network')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Network
          </Button>
        )}

        {/* Cover and Profile Section */}
        <Card className="overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary to-primary/80 group cursor-pointer">
            {profileUser?.coverImage ? (
              <img 
                src={typeof profileUser.coverImage === 'string' ? profileUser.coverImage : profileUser.coverImage?.url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80" />
            )}
            
            {/* Overlay au hover */}
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => coverImageInputRef.current?.click()}
                  disabled={uploadingImage === 'cover'}
                  type="button"
                >
                  {uploadingImage === 'cover' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            
            {/* Hidden input */}
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
              disabled={uploadingImage === 'cover'}
            />
          </div>

          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
              {/* Profile Info */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
                <div className="relative mx-auto sm:mx-0 group/avatar">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background">
                    <AvatarImage src={typeof profileUser?.profileImage === 'string' ? profileUser.profileImage : profileUser?.profileImage?.url} alt={profileUser?.fullname || profileUser?.name} />
                    <AvatarFallback className="text-lg sm:text-2xl">{(profileUser?.fullname || profileUser?.name)?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-8 w-8 bg-background border border-border opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200"
                        onClick={() => profileImageInputRef.current?.click()}
                        disabled={uploadingImage === 'profile'}
                        type="button"
                      >
                        {uploadingImage === 'profile' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        ref={profileImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                        disabled={uploadingImage === 'profile'}
                      />
                    </>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{profileUser.fullname || profileUser.name}</h1>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-2 mt-1">
                    <Badge variant="secondary" className="capitalize text-xs sm:text-sm">
                      {profileUser.role}
                    </Badge>
                    {profileUser.company && (
                      <span className="text-sm text-muted-foreground mt-1 sm:mt-0">at {profileUser.company}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                {isOwnProfile ? (
                  <Link to="/profile/edit">
                    <Button variant="outline" className="gap-2 text-sm">
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    {userRelation?.status === 'friend' && (
                      <>
                        <Button 
                          variant="secondary" 
                          className="gap-2 text-sm"
                          disabled
                        >
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Connected</span>
                          <span className="sm:hidden">Connected</span>
                        </Button>
                        <Button 
                          className="gap-2 text-sm"
                          onClick={() => handleMessage(userId!, profileUser.fullname || profileUser.name)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Message</span>
                          <span className="sm:hidden">Message</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleDelete(userId!)}
                          disabled={loadingActions[userId!]}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {userRelation?.status === 'pending' && userRelation?.requestDirection === 'sent' && (
                      <>
                        <Button 
                          variant="outline" 
                          className="gap-2 text-sm"
                          disabled
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Pending</span>
                        </Button>
                        <Button 
                          variant="outline"
                          className="gap-2 text-sm"
                          onClick={() => handleMessage(userId!, profileUser.fullname || profileUser.name)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Message</span>
                        </Button>
                      </>
                    )}
                    {userRelation?.status === 'pending' && userRelation?.requestDirection === 'received' && (
                      <>
                        <Button 
                          className="gap-2 text-sm"
                          onClick={() => {
                            if (userRelation.requestId) {
                              respondToFriendRequest({ requestId: userRelation.requestId, action: 'accepted' });
                            }
                          }}
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </Button>
                        <Button 
                          variant="destructive"
                          className="gap-2 text-sm"
                          onClick={() => {
                            if (userRelation.requestId) {
                              respondToFriendRequest({ requestId: userRelation.requestId, action: 'rejected' });
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </>
                    )}
                    {userRelation?.status === 'none' && (
                      <>
                        <Button 
                          className="gap-2 text-sm"
                          onClick={() => handleConnect(userId!)}
                          disabled={loadingActions[userId!]}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="hidden sm:inline">Connect</span>
                          <span className="sm:hidden">Connect</span>
                        </Button>
                        <Button 
                          variant="outline"
                          className="gap-2 text-sm"
                          onClick={() => handleMessage(userId!, profileUser.fullname || profileUser.name)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Message</span>
                          <span className="sm:hidden">Message</span>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bio and Details */}
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              {/* Bio + Joined on same line */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs sm:text-sm">
                {profileUser.bio && (
                  <span className="italic text-foreground">"{profileUser.bio}"</span>
                )}
                {profileUser.bio && (
                  <span className="text-muted-foreground">•</span>
                )}
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDistanceToNow(new Date(profileUser.createdAt || new Date()))} ago</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                {profileUser.company && (
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{profileUser.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start space-x-6 sm:space-x-8 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{userPosts.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{allUsers.filter(u => u.id === profileUser?.id && u.status === 'friend').length || 0}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Connexions</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{allUsers.filter(u => u.id === profileUser?.id && (u.status === 'friend' || u.status === 'pending')).length || 0}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Réseau</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="text-xs sm:text-sm">Posts</TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm">À propos</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activité</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 sm:space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Aucune publication</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    {isOwnProfile ? "Partagez votre première publication!" : `${profileUser.name} n'a rien publié pour le moment.`}
                  </p>
                  {isOwnProfile && (
                    <Link to="/create-post">
                      <Button className="mt-4 text-sm">Créer une publication</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">À propos</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground">Bio</h4>
                    <p className="text-muted-foreground mt-1">
                      {profileUser.bio || "Aucune bio pour le moment."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Rôle</h4>
                    <p className="text-muted-foreground mt-1 capitalize">{profileUser.role}</p>
                  </div>
                  {profileUser.company && (
                    <div>
                      <h4 className="font-medium text-foreground">Entreprise</h4>
                      <p className="text-muted-foreground mt-1">{profileUser.company}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Activité récente</h3>
                <div className="space-y-4">
                  {userPosts.length > 0 ? (
                    userPosts.slice(0, 5).map((post, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">Publié: {post.title || 'Post'}</p>
                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt || new Date()))} ago</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune activité pour le moment</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
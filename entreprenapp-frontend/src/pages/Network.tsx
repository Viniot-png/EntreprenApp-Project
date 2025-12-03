import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageLoading from '@/components/ui/page-loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Users, Filter, MessageCircle, Building, Check, Clock, X, Trash2 } from 'lucide-react';
// Les suggestions seront récupérées depuis l'API plus tard
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/api/services';

const Network = () => {
  const { user, loading } = useAuth();
  const { allUsers, sendFriendRequest, respondToFriendRequest, removeFriend, isSending, isResponding, isRemoving } = useFriends();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement de votre réseau..." />
      </DashboardLayout>
    );
  }

  if (!user) return null;

  // Filtrer les utilisateurs
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Catégoriser les utilisateurs
  const friends = filteredUsers.filter(u => u.status === 'friend');
  const sentRequests = filteredUsers.filter(u => u.status === 'pending' && u.requestDirection === 'sent');
  const receivedRequests = filteredUsers.filter(u => u.status === 'pending' && u.requestDirection === 'received');
  const suggested = filteredUsers.filter(u => u.status === 'none');

  const handleConnect = async (userId: string) => {
    if (loadingActions[userId] || isSending) return;
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      sendFriendRequest(userId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRespond = async (requestId: string | undefined, action: 'accepted' | 'rejected') => {
    if (!requestId || loadingActions[requestId] || isResponding) return;
    setLoadingActions(prev => ({ ...prev, [requestId]: true }));
    try {
      respondToFriendRequest({ requestId, action });
    } finally {
      setLoadingActions(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleMessage = (userId: string, userName: string) => {
    navigate('/messages', { 
      state: { 
        newConversation: true, 
        userId, 
        userName 
      } 
    });
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleDelete = async (userId: string) => {
    if (loadingActions[userId] || isRemoving) return;
    setLoadingActions(prev => ({ ...prev, [userId]: true }));
    try {
      removeFriend(userId);
    } finally {
      setLoadingActions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const roleColors = {
    entrepreneur: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    investor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    consultant: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    mentor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  };

  const UserCard = ({ person, status, requestId, requestDirection }: any) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewProfile(person.id)}>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
            <AvatarImage src={person.profileImage} />
            <AvatarFallback className="text-base sm:text-lg">{person.fullname.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 w-full">
            <h3 className="font-semibold text-base sm:text-lg">{person.fullname}</h3>
            <Badge 
              variant="secondary" 
              className={`capitalize ${roleColors[person.role as keyof typeof roleColors]}`}
            >
              {person.role}
            </Badge>
            
            {person.company && (
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Building className="h-4 w-4 mr-1" />
                {person.company}
              </div>
            )}
            
            {person.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {person.bio}
              </p>
            )}
          </div>
          
          <div className="flex gap-2 w-full flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
            {status === 'friend' && (
              <>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1"
                  disabled
                >
                  <Check className="h-4 w-4 mr-1" />
                  Connecté
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMessage(person.id, person.fullname)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(person.id)}
                  disabled={loadingActions[person.id]}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {status === 'pending' && requestDirection === 'sent' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  disabled
                >
                  <Clock className="h-4 w-4 mr-1" />
                  En attente
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMessage(person.id, person.fullname)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {status === 'pending' && requestDirection === 'received' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleRespond(requestId, 'accepted')}
                  disabled={loadingActions[requestId]}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {loadingActions[requestId] ? 'Traitement...' : 'Accepter'}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleRespond(requestId, 'rejected')}
                  disabled={loadingActions[requestId]}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {status === 'none' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleConnect(person.id)}
                  disabled={loadingActions[person.id]}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {loadingActions[person.id] ? 'Envoi...' : 'Connecter'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMessage(person.id, person.fullname)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Mon Réseau</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Connectez-vous avec des entrepreneurs, investisseurs et mentors</p>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover" className="text-xs sm:text-sm">
              <Search className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Découvrir</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Connectés ({friends.length})</span>
              <span className="sm:hidden">{friends.length}</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm relative">
              <Clock className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Demandes ({receivedRequests.length})</span>
              <span className="sm:hidden">{receivedRequests.length}</span>
              {receivedRequests.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {receivedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs sm:text-sm">
              <UserPlus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Envoyées ({sentRequests.length})</span>
              <span className="sm:hidden">{sentRequests.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {suggested.map((person) => (
                <UserCard key={person.id} person={person} status={person.status} />
              ))}
            </div>
            {suggested.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aucun utilisateur trouvé pour votre recherche</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {friends.map((person) => (
                <UserCard key={person.id} person={person} status="friend" />
              ))}
            </div>
            {friends.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Vous n'avez pas encore de connexions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {receivedRequests.map((person) => (
                <UserCard 
                  key={person.id} 
                  person={person} 
                  status="pending"
                  requestId={person.requestId}
                  requestDirection={person.requestDirection}
                />
              ))}
            </div>
            {receivedRequests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Vous n'avez aucune demande en attente</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sentRequests.map((person) => (
                <UserCard 
                  key={person.id} 
                  person={person} 
                  status="pending"
                  requestId={person.requestId}
                  requestDirection="sent"
                />
              ))}
            </div>
            {sentRequests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Vous n'avez envoyé aucune demande</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Network;
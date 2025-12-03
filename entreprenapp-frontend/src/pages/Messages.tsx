import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageLoading from '@/components/ui/page-loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Search, MoreVertical, Plus, Circle, Pin, UserPlus } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import NewConversationDialog from '@/components/messages/NewConversationDialog';
import MessageActions from '@/components/messages/MessageActions';
import MessageInput from '@/components/messages/MessageInput';
import type { FrontendUser } from '@/lib/api/services';

const Messages = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { friends } = useFriends();
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState<string[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [filterReadOnly, setFilterReadOnly] = useState(false);
  const [view, setView] = useState<'conversations' | 'all'>('conversations');
  const [usersFilter, setUsersFilter] = useState<'all' | 'unread' | 'pinned'>('all');
  
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    updateMessage,
    startNewConversation,
    markAsUnread,
    markAsRead,
    archiveConversation,
    deleteConversation,
    deleteMessage,
    getConversationMessages,
    onlineUsers,
  } = useMessages();

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement de vos messages..." />
      </DashboardLayout>
    );
  }

  if (!user) return null;

  let filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterOnlineOnly) {
    filteredConversations = filteredConversations.filter(c => onlineUsers.includes(c.participant.id));
  }

  if (filterUnreadOnly) {
    filteredConversations = filteredConversations.filter(c => (c.unreadCount || 0) > 0);
  }

  if (filterPinnedOnly) {
    filteredConversations = filteredConversations.filter(c => pinnedConversations.includes(c.id));
  }

  // Sort pinned conversations at the top
  filteredConversations = filteredConversations.sort((a, b) => {
    const aPinned = pinnedConversations.includes(a.id) ? 0 : 1;
    const bPatched = pinnedConversations.includes(b.id) ? 0 : 1;
    return aPinned - bPatched;
  });

  const handleSendMessage = (content: string, imageBase64?: string | null) => {
    if (!selectedConversation || !user) return;
    sendMessage(selectedConversation.id, content, user.id, imageBase64 || null);
  };

  const handleStartNewConversation = (targetUser: FrontendUser) => {
    if (!user) return;
    const conversation = startNewConversation(targetUser, user.id);
    markAsRead(conversation.id);
    toast({
      title: "Nouvelle conversation",
      description: `Conversation démarrée avec ${targetUser.name}`,
    });
  };

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      markAsRead(conversation.id);
    }
  };

  const conversationMessages = selectedConversation ? getConversationMessages(selectedConversation.id) : [];
  
  // Récupérer tous les messages toutes conversations confondues
  const allMessages = conversations.reduce((acc: any[], conv) => {
    const msgs = getConversationMessages(conv.id);
    return [...acc, ...msgs.map(m => ({ ...m, conversationId: conv.id, participantName: conv.participant.name, participantAvatar: conv.participant.avatar }))];
  }, []);
  
  // Filtrer les messages généraux
  let filteredAllMessages = allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (filterUnreadOnly) {
    filteredAllMessages = filteredAllMessages.filter(m => !m.read);
  }
  
  if (filterPinnedOnly) {
    filteredAllMessages = filteredAllMessages.filter(m => pinnedConversations.includes(m.conversationId));
  }

  // Séparer les amis en ligne et hors ligne
  const onlineFriends = (friends || []).filter(f => onlineUsers.includes(f.id));
  const offlineFriends = (friends || []).filter(f => !onlineUsers.includes(f.id));

  // Récupérer les utilisateurs uniques avec lesquels on a échangé des messages
  let usersWithMessages = Array.from(
    new Map(
      conversations.map(conv => [conv.participant.id, conv.participant])
    ).values()
  );

  // Appliquer les filtres sur les utilisateurs
  if (usersFilter === 'unread') {
    usersWithMessages = usersWithMessages.filter(u => {
      const conv = conversations.find(c => c.participant.id === u.id);
      return conv && (conv.unreadCount || 0) > 0;
    });
  } else if (usersFilter === 'pinned') {
    usersWithMessages = usersWithMessages.filter(u => {
      const conv = conversations.find(c => c.participant.id === u.id);
      return conv && pinnedConversations.includes(conv.id);
    });
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Messages</h1>
        </div>
        
        {/* Layout 2 colonnes : Messages à gauche, Amis à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)]">
          
          {/* COLONNE GAUCHE - Tous les messages */}
          <Card className="lg:col-span-2 flex flex-col h-full">
            <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
              <div className="flex items-center justify-between mb-3">
                <CardTitle className="text-lg">Tous les messages</CardTitle>
                <Button 
                  size="sm"
                  className="h-7 px-3 flex items-center gap-2"
                  onClick={() => setShowNewConversation(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New messages</span>
                  <span className="sm:hidden">Nouveau</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant={usersFilter === 'all' ? 'default' : 'outline'} 
                  size="sm" 
                  className="h-7 px-2" 
                  onClick={() => setUsersFilter('all')}
                >
                  Tout
                </Button>
                <Button 
                  variant={usersFilter === 'unread' ? 'default' : 'outline'} 
                  size="sm" 
                  className="h-7 px-2" 
                  onClick={() => setUsersFilter('unread')}
                >
                  Non lu
                </Button>
                <Button 
                  variant={usersFilter === 'pinned' ? 'default' : 'outline'} 
                  size="sm" 
                  className="h-7 px-2" 
                  onClick={() => setUsersFilter('pinned')}
                >
                  <Pin className="h-4 w-4 mr-1" /> Épinglées
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto px-3 sm:px-6">
              {/* Vue Utilisateurs */}
              <div className="space-y-2">
                  {usersWithMessages.length > 0 ? (
                    usersWithMessages.map((user) => {
                      const conv = conversations.find(c => c.participant.id === user.id);
                      const lastMessageTime = conv?.lastMessageAt ? new Date(conv.lastMessageAt) : null;
                      
                      return (
                        <div
                          key={user.id}
                          className={`group flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            (conv?.unreadCount || 0) > 0 
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900' 
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          <div className="relative cursor-pointer flex-1" onClick={() => {
                            if (conv) handleSelectConversation(conv);
                          }}>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-sm">{(user.name || user.fullname || '').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Circle 
                                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 ${onlineUsers.includes(user.id) ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm font-medium truncate ${(conv?.unreadCount || 0) > 0 ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                                    {user.name || user.fullname}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {(conv?.unreadCount || 0) > 0 && (
                                      <Badge className="bg-blue-600 text-white">{conv!.unreadCount}</Badge>
                                    )}
                                    {lastMessageTime && (
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {lastMessageTime.toLocaleDateString('fr-FR')} {lastMessageTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu d'options */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (conv) {
                                    markAsUnread(conv.id);
                                    toast({
                                      title: "Marqué comme non lu",
                                      description: `Conversation avec ${user.name} marquée comme non lue`,
                                    });
                                  }
                                }}
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Marquer comme non lu
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (conv) {
                                    setPinnedConversations(prev => 
                                      prev.includes(conv.id) 
                                        ? prev.filter(id => id !== conv.id) 
                                        : [conv.id, ...prev]
                                    );
                                    toast({
                                      title: pinnedConversations.includes(conv.id) ? "Dépinglé" : "Épinglé",
                                      description: `Conversation avec ${user.name} ${pinnedConversations.includes(conv.id) ? 'dépinglée' : 'épinglée'}`,
                                    });
                                  }
                                }}
                              >
                                <Pin className={`h-4 w-4 mr-2 ${conv && pinnedConversations.includes(conv.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                {conv && pinnedConversations.includes(conv.id) ? 'Dépingler' : 'Épingler'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (conv) {
                                    deleteConversation(conv.id);
                                    toast({
                                      title: "Supprimé",
                                      description: `Conversation avec ${user.name} supprimée`,
                                    });
                                  }
                                }}
                                className="text-red-600"
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-center text-sm">
                        Aucune conversation.<br />
                        Commencez à échanger des messages !
                      </p>
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>

          {/* COLONNE DROITE - Amis connectés et déconnectés */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="text-lg">Amis</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto px-3 sm:px-6 space-y-4">
              {/* Amis en ligne */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                  En ligne ({onlineFriends.length})
                </h3>
                <div className="space-y-2">
                  {onlineFriends.length > 0 ? (
                    onlineFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => handleStartNewConversation(friend)}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={
                              friend.avatar || 
                              (typeof friend.profileImage === 'string' ? friend.profileImage : friend.profileImage?.url)
                            } />
                            <AvatarFallback className="text-xs">{(friend.name || friend.fullname || '').charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <Circle className="absolute -bottom-0.5 -right-0.5 h-2 w-2 fill-green-500 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate font-medium">{friend.name || friend.fullname}</p>
                          <p className="text-xs text-muted-foreground truncate">{friend.role}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucun ami en ligne</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Amis hors ligne */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                  Hors ligne ({offlineFriends.length})
                </h3>
                <div className="space-y-2">
                  {offlineFriends.length > 0 ? (
                    offlineFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer opacity-75"
                        onClick={() => handleStartNewConversation(friend)}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={
                              friend.avatar || 
                              (typeof friend.profileImage === 'string' ? friend.profileImage : friend.profileImage?.url)
                            } />
                            <AvatarFallback className="text-xs">{(friend.name || friend.fullname || '').charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <Circle className="absolute -bottom-0.5 -right-0.5 h-2 w-2 fill-gray-400 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate font-medium">{friend.name || friend.fullname}</p>
                          <p className="text-xs text-muted-foreground truncate">{friend.role}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Aucun ami hors ligne</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal pour afficher la conversation sélectionnée */}
        {selectedConversation && (
          <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.participant.avatar} />
                    <AvatarFallback>{(selectedConversation.participant.name || selectedConversation.participant.fullname || '').charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedConversation.participant.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 max-h-[calc(80vh-200px)] overflow-y-auto">
                {conversationMessages.length > 0 ? (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`group flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`relative max-w-xs px-3 sm:px-4 py-2 rounded-lg ${
                          message.senderId === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div className="flex flex-col">
                            <textarea
                              className="w-full rounded-md p-2 text-sm resize-none border border-border"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                            />
                            <div className="flex justify-end items-center gap-2 mt-2">
                              <Button size="sm" variant="outline" onClick={() => { setEditingMessageId(null); setEditingText(''); }}>Annuler</Button>
                              <Button size="sm" onClick={() => {
                                if (!editingMessageId) return;
                                updateMessage(editingMessageId, editingText || '', null);
                                setEditingMessageId(null);
                                setEditingText('');
                              }}>Enregistrer</Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {message.image && (
                              <img src={message.image} alt="attachment" className="mb-2 rounded max-w-full h-auto" />
                            )}
                            <p className="text-sm break-words leading-relaxed">{message.content}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <MessageActions
                            messageId={message.id}
                            content={message.content}
                            isOwn={message.senderId === user.id}
                            onEdit={(id) => {
                              if (message.senderId !== user.id) return;
                              setEditingMessageId(id);
                              setEditingText(message.content);
                            }}
                            onReply={(id) => {
                              toast({
                                title: "Répondre",
                                description: "Cette fonctionnalité sera bientôt disponible.",
                                variant: "default",
                              });
                            }}
                            onForward={(id) => {
                              toast({
                                title: "Transférer",
                                description: "Cette fonctionnalité sera bientôt disponible.",
                                variant: "default",
                              });
                            }}
                            onDelete={(id) => {
                              setConfirmDeleteMessageId(id);
                              setShowConfirmDelete(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center text-sm">Aucun message dans cette conversation</p>
                )}
              </div>

              <div className="mt-4">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={!selectedConversation}
                  placeholder="Tapez votre message..."
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        <NewConversationDialog
          open={showNewConversation}
          onOpenChange={setShowNewConversation}
          onStartConversation={handleStartNewConversation}
        />
        {/* Confirm delete modal */}
        <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Supprimer le message ?</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment supprimer ce message ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Annuler</Button>
              <Button variant="destructive" onClick={() => {
                if (confirmDeleteMessageId) deleteMessage(confirmDeleteMessageId);
                setConfirmDeleteMessageId(null);
                setShowConfirmDelete(false);
              }}>
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
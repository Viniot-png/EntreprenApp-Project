import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageLoading from '@/components/ui/page-loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Heart, MessageCircle, UserPlus, Briefcase, CheckCheck, Calendar, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();

  // Determine navigation path based on notification type and related item
  const getNavigationPath = (notification: any): string | null => {
    const { type, relatedItem, actor } = notification;

    switch (type) {
      case 'comment':
      case 'like':
        // Navigate to the post
        if (relatedItem?._id) {
          return `/post/${relatedItem._id}`;
        }
        break;
      case 'friend_request':
      case 'friend_accept':
        // Navigate to the user profile
        if (actor?._id) {
          return `/profile/${actor._id}`;
        }
        break;
      case 'event':
        // Navigate to the event
        if (relatedItem?._id) {
          return `/events/${relatedItem._id}`;
        }
        break;
      case 'message':
        // Navigate to messages with this user
        // relatedItem is now the senderId (actor)
        if (actor?._id) {
          return `/messages?userId=${actor._id}`;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification._id || notification.id);
    }

    // Navigate to the related item
    const path = getNavigationPath(notification);
    if (path) {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement de vos notifications..." />
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'friend_accept':
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'post':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const todayNotifications = notifications.filter(n => {
    const today = new Date().toDateString();
    return new Date(n.createdAt).toDateString() === today;
  });
  const earlierNotifications = notifications.filter(n => {
    const today = new Date().toDateString();
    return new Date(n.createdAt).toDateString() !== today;
  });

  const messageNotifications = notifications.filter(n => n.type === 'message');
  const postNotifications = notifications.filter(n => ['post', 'like', 'comment'].includes(n.type));
  const friendNotifications = notifications.filter(n => ['friend_request', 'friend_accept'].includes(n.type));
  const eventNotifications = notifications.filter(n => n.type === 'event');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
            {notifications.length > 0 && (
              <Button onClick={deleteAllNotifications} variant="outline" size="sm" className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Tout supprimer
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              Toutes
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
            <TabsTrigger value="connections">Connexions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {todayNotifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayNotifications.map((notification) => (
                    <div
                      key={notification._id || notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        !notification.read ? 'bg-accent border-primary/20' : 'bg-background'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.actor?.profileImage?.url || notification.actor?.avatar} />
                        <AvatarFallback>{(notification.actor?.fullname || notification.actor?.name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {getIcon(notification.type)}
                          <p className="text-sm text-foreground font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.content}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification._id || notification.id)}
                                className="text-xs"
                              >
                                Marquer comme lu
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification._id || notification.id)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {earlierNotifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plus tôt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {earlierNotifications.map((notification) => (
                    <div
                      key={notification._id || notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        !notification.read ? 'bg-accent border-primary/20' : 'bg-background'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.actor?.profileImage?.url || notification.actor?.avatar} />
                        <AvatarFallback>{(notification.actor?.fullname || notification.actor?.name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {getIcon(notification.type)}
                          <p className="text-sm text-foreground font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.content}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification._id || notification.id)}
                                className="text-xs"
                              >
                                Marquer comme lu
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification._id || notification.id)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mentions">
            <Card>
              <CardContent className="space-y-4 pt-6">
                {messageNotifications.length > 0 ? (
                  messageNotifications.map((notification) => (
                    <div
                      key={notification._id || notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        !notification.read ? 'bg-accent border-primary/20' : 'bg-background'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.actor?.profileImage?.url || notification.actor?.avatar} />
                        <AvatarFallback>{(notification.actor?.fullname || notification.actor?.name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {getIcon(notification.type)}
                          <p className="text-sm text-foreground font-medium">{notification.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.content}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification._id || notification.id)}
                                className="text-xs"
                              >
                                Marquer comme lu
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification._id || notification.id)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">Aucun message reçu</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections">
            <Card>
              <CardContent className="space-y-4 pt-6">
                {friendNotifications.length > 0 ? (
                  friendNotifications.map((notification) => (
                    <div
                      key={notification._id || notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        !notification.read ? 'bg-accent border-primary/20' : 'bg-background'
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.actor?.profileImage?.url || notification.actor?.avatar} />
                        <AvatarFallback>{(notification.actor?.fullname || notification.actor?.name || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {getIcon(notification.type)}
                          <p className="text-sm text-foreground font-medium">{notification.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.content}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString('fr-FR')}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification._id || notification.id)}
                                className="text-xs"
                              >
                                Marquer comme lu
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification._id || notification.id)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">Aucune demande d'ami</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
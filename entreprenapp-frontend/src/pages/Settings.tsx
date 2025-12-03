import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/services';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageLoading from '@/components/ui/page-loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Camera, Save, Shield, Bell, Eye, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    company: user?.company || '',
    expertise: user?.expertise || []
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    connectionRequests: true,
    postLikes: false,
    postComments: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowMessages: true
  });

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Chargement des paramètres..." />
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'L\'image ne doit pas dépasser 5MB',
          variant: 'destructive',
        });
        return;
      }

      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    // Validations
    if (!profileData.name || profileData.name.trim().length < 2) {
      toast({
        title: "Erreur",
        description: "Le nom doit contenir au moins 2 caractères",
        variant: "destructive"
      });
      return;
    }

    if (profileData.bio && profileData.bio.length > 500) {
      toast({
        title: "Erreur",
        description: "La bio ne peut pas dépasser 500 caractères",
        variant: "destructive"
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('fullname', profileData.name);
      if (profileData.bio) formData.append('bio', profileData.bio);
      if (profileData.location) formData.append('location', profileData.location);
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const response = await authService.updateProfile(formData);

      if (response.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos modifications ont été sauvegardées avec succès.",
        });
        setProfileImageFile(null);
        setProfileImagePreview(null);
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Paramètres de notifications mis à jour",
      description: "Vos préférences de notifications ont été sauvegardées.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Paramètres de confidentialité mis à jour",
      description: "Vos paramètres de confidentialité ont été mis à jour.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo de profil */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImagePreview || user?.profileImage} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Changer la photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG ou GIF. Taille max 5MB.
                    </p>
                  </div>
                </div>

                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expertises</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full md:w-auto gap-2"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  {isSavingProfile ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Paramètres de notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">Recevez des notifications par email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">Recevez des notifications push dans le navigateur</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="message-notifications">Nouveaux messages</Label>
                      <p className="text-sm text-muted-foreground">Notifications pour les nouveaux messages</p>
                    </div>
                    <Switch
                      id="message-notifications"
                      checked={notificationSettings.messageNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, messageNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="connection-requests">Demandes de connexion</Label>
                      <p className="text-sm text-muted-foreground">Notifications pour les nouvelles demandes</p>
                    </div>
                    <Switch
                      id="connection-requests"
                      checked={notificationSettings.connectionRequests}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, connectionRequests: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="post-likes">Likes sur vos publications</Label>
                      <p className="text-sm text-muted-foreground">Notifications quand quelqu'un like vos posts</p>
                    </div>
                    <Switch
                      id="post-likes"
                      checked={notificationSettings.postLikes}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, postLikes: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="post-comments">Commentaires sur vos publications</Label>
                      <p className="text-sm text-muted-foreground">Notifications pour les nouveaux commentaires</p>
                    </div>
                    <Switch
                      id="post-comments"
                      checked={notificationSettings.postComments}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, postComments: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les préférences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Paramètres de confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-email">Afficher l'email publiquement</Label>
                      <p className="text-sm text-muted-foreground">Votre email sera visible sur votre profil</p>
                    </div>
                    <Switch
                      id="show-email"
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-location">Afficher la localisation</Label>
                      <p className="text-sm text-muted-foreground">Votre localisation sera visible sur votre profil</p>
                    </div>
                    <Switch
                      id="show-location"
                      checked={privacySettings.showLocation}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showLocation: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-messages">Autoriser les messages</Label>
                      <p className="text-sm text-muted-foreground">D'autres utilisateurs peuvent vous envoyer des messages</p>
                    </div>
                    <Switch
                      id="allow-messages"
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSavePrivacy} className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Zone de danger</h3>
                    <p className="text-sm text-muted-foreground">
                      Actions irréversibles qui affecteront votre compte de manière permanente.
                    </p>
                  </div>

                  <div className="border border-destructive/20 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-destructive">Supprimer le compte</h4>
                      <p className="text-sm text-muted-foreground">
                        Une fois supprimé, votre compte ne pourra pas être récupéré. Toutes vos données seront perdues.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer le compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
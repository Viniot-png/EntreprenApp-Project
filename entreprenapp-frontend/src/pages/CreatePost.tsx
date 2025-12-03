import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Image, 
  Video, 
  FileText, 
  X,
  Upload,
  ArrowLeft,
  Lock,
  Users,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateFile, getFileLimits } from '@/lib/utils/fileValidator';

const CreatePost = () => {
  const { user } = useAuth();
  const { createPost, isCreating } = usePosts();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'connections'>('public');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez écrire quelque chose avant de publier.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPost({
        content,
        visibility,
        media: attachments.length > 0 ? attachments : undefined,
      });
      
      navigate('/dashboard');
    } catch (error) {
      // L'erreur est déjà gérée dans usePosts
    }
  };

  const addAttachment = (type: string) => {
    // Créer un input file pour sélectionner un fichier réel
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*/*';
    
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        // Valider le fichier
        const validation = validateFile(file, type === 'image' ? 'image' : type === 'video' ? 'video' : 'document');
        if (!validation.isValid) {
          toast({
            title: "Erreur",
            description: validation.message || "Fichier non valide",
            variant: "destructive"
          });
          return;
        }

        setAttachments(prev => [...prev, file]);
        toast({
          title: "Fichier ajouté",
          description: `${file.name} a été ajouté.`,
        });
      }
    };
    
    input.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (!linkUrl.trim()) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer une URL valide.",
        variant: "destructive"
      });
      return;
    }
    
    // Pour les liens, on peut les ajouter au contenu ou les traiter séparément
    setContent(prev => prev + (prev ? '\n\n' : '') + linkUrl);
    setLinkUrl('');
    toast({
      title: "Lien ajouté",
      description: "Le lien a été ajouté au contenu.",
    });
  };

  if (!user) return null;

  const profileImage = typeof user.profileImage === 'string' ? user.profileImage : user.profileImage?.url;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Créer un Post</h1>
            <p className="text-muted-foreground">Partagez vos pensées avec votre réseau</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileImage} alt={user.fullname} />
                <AvatarFallback>{user.fullname?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-base font-semibold">{user.fullname}</span>
                <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Content Input */}
            <div>
              <Textarea
                placeholder="Qu'aimeriez-vous partager ?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] text-base resize-none border-none shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Visibility Selector */}
            <div className="space-y-2">
              <Label>Visibilité du post</Label>
              <Select value={visibility} onValueChange={(val: any) => setVisibility(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="connections">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Mes connexions</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Privé</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {visibility === 'public' && 'Visible pour tous les utilisateurs'}
                {visibility === 'connections' && 'Visible uniquement pour vos connexions'}
                {visibility === 'private' && 'Visible uniquement pour vous'}
              </p>
            </div>

            {/* Link Input */}
            <div className="space-y-2">
              <Label htmlFor="link">Ajouter un lien</Label>
              <div className="flex space-x-2">
                <Input
                  id="link"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLink()}
                />
                <Button onClick={addLink} variant="outline">
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Media Upload Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAttachment('image')}
                className="gap-2"
              >
                <Image className="h-4 w-4" />
                Photo (max {getFileLimits('image')})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAttachment('video')}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                Vidéo (max {getFileLimits('video')})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAttachment('document')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Document (max {getFileLimits('document')})
              </Button>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Pièces jointes ({attachments.length})</h3>
                {attachments.map((attachment, index) => {
                  const isImage = attachment.type?.startsWith('image/');
                  const isVideo = attachment.type?.startsWith('video/');
                  const size = (attachment.size / (1024 * 1024)).toFixed(2);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isImage ? (
                          <Image className="h-4 w-4 flex-shrink-0" />
                        ) : isVideo ? (
                          <Video className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{size} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || !content.trim()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isCreating ? 'Publication...' : 'Publier'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;
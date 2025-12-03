import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Image, 
  Video, 
  FileText, 
  Link as LinkIcon,
  X,
  Plus,
  Sparkles
} from 'lucide-react';

interface Attachment {
  type: 'image' | 'video' | 'document' | 'link';
  file?: File;
  url?: string;
  title: string;
  preview?: string;
}

interface CreatePostCardProps {
  onNewPost?: (post: any) => void;
}

const CreatePostCard = ({ onNewPost }: CreatePostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createPost, isCreating } = usePosts();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      // Extract files from attachments
      const media = attachments
        .filter(a => a.file && a.type !== 'link')
        .map(a => a.file as File);

      // Call createPost mutation with proper data structure
      createPost({
        content,
        visibility: 'public',
        media: media.length > 0 ? media : undefined
      });

      // Reset form
      setContent('');
      setAttachments([]);
      setIsExpanded(false);
      
      // Call callback if provided
      if (onNewPost) {
        onNewPost(null);
      }
    } catch (error) {
      console.error('Erreur publication:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la publication",
        variant: "destructive"
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const attachment: Attachment = {
              type: 'image',
              file,
              title: file.name,
              preview: event.target?.result as string
            };
            setAttachments([...attachments, attachment]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
    // Reset input
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('video/')) {
          const attachment: Attachment = {
            type: 'video',
            file,
            title: file.name
          };
          setAttachments([...attachments, attachment]);
        }
      });
    }
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const attachment: Attachment = {
          type: 'document',
          file,
          title: file.name
        };
        setAttachments([...attachments, attachment]);
      });
    }
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const addAttachment = (type: string) => {
    switch (type) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'video':
        videoInputRef.current?.click();
        break;
      case 'document':
        documentInputRef.current?.click();
        break;
      case 'link':
        // Link handling can be added later if needed
        toast({
          title: "Info",
          description: "Fonctionnalité lien à venir"
        });
        break;
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (!user) return null;

  return (
    <>
      <Card className="w-full glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-start">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="gradient-gold text-white font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 space-y-4">
              <div className="relative overflow-hidden">
                <Textarea
                  placeholder="Partagez vos idées avec votre réseau..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsExpanded(true)}
                  className="w-full min-h-[80px] max-h-48 resize-none border-2 border-border/50 hover:border-primary/30 focus:border-primary/50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70 transition-all duration-200 bg-background/50 break-words"
                />
                {!isExpanded && content.length === 0 && (
                  <div className="absolute top-3 right-3">
                    <Sparkles className="h-5 w-5 text-primary/60 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent/30 border border-border/50 rounded-lg hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 group">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 gradient-gold rounded-lg flex-shrink-0">
                          {attachment.type === 'image' && <Image className="h-4 w-4 text-white" />}
                          {attachment.type === 'video' && <Video className="h-4 w-4 text-white" />}
                          {attachment.type === 'document' && <FileText className="h-4 w-4 text-white" />}
                          {attachment.type === 'link' && <LinkIcon className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block truncate">
                            {attachment.title}
                          </span>
                          {attachment.file && (
                            <span className="text-xs text-muted-foreground">
                              {(attachment.file.size / 1024).toFixed(2)} KB
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(index)}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50 animate-fade-in">
                  {/* Attachment Options */}
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAttachment('image')}
                      className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <Image className="h-4 w-4" />
                      Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAttachment('video')}
                      className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <Video className="h-4 w-4" />
                      Vidéo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAttachment('document')}
                      className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <FileText className="h-4 w-4" />
                      Document
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAttachment('link')}
                      className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Lien
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                        setAttachments([]);
                      }}
                      className="hover:bg-muted transition-all duration-200"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || isCreating}
                      size="sm"
                      className="gradient-gold hover:shadow-gold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isCreating ? 'Publication...' : 'Publier'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        multiple
        onChange={handleDocumentSelect}
        className="hidden"
      />
    </>
  );
};

export default CreatePostCard;
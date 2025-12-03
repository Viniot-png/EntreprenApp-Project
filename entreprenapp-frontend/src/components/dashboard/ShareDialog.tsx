import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { shareService } from '@/lib/api/services/share.service';
import { 
  Copy, 
  Mail, 
  MessageCircle, 
  Share, 
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postContent: string;
}

const ShareDialog = ({ open, onOpenChange, postId, postContent }: ShareDialogProps) => {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [sharing, setSharing] = useState(false);
  
  const shareUrl = `${window.location.origin}/post/${postId}`;
  const shareText = postContent.length > 100 ? 
    `${postContent.substring(0, 100)}...` : postContent;

  const recordShareAction = async () => {
    try {
      setSharing(true);
      await shareService.recordShare(postId);
    } catch (error) {
      console.error('Erreur enregistrement share:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      await recordShareAction();
      toast({
        title: "Lien copié!",
        description: "Le lien vers le post a été copié dans votre presse-papiers.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
    setCopying(false);
    onOpenChange(false);
  };

  const handleSocialShare = async (platform: string) => {
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent('Découvrez ce post intéressant')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      await recordShareAction();
      toast({
        title: "Partagé!",
        description: `Post partagé sur ${platform}.`,
      });
      onOpenChange(false);
    }
  };

  const shareOptions = [
    {
      name: 'Copier le lien',
      icon: Copy,
      action: handleCopyLink,
      color: 'text-muted-foreground hover:text-primary',
      loading: copying
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => handleSocialShare('twitter'),
      color: 'text-muted-foreground hover:text-blue-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => handleSocialShare('linkedin'),
      color: 'text-muted-foreground hover:text-blue-700'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => handleSocialShare('facebook'),
      color: 'text-muted-foreground hover:text-blue-600'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => handleSocialShare('whatsapp'),
      color: 'text-muted-foreground hover:text-green-600'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => handleSocialShare('email'),
      color: 'text-muted-foreground hover:text-orange-600'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5 text-primary" />
            Partager ce post
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Share Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                onClick={option.action}
                disabled={option.loading}
                className={`flex items-center justify-center gap-3 h-12 transition-all duration-200 hover:scale-105 ${option.color} hover:border-primary/30`}
              >
                {option.loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <option.icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{option.name}</span>
              </Button>
            ))}
          </div>

          {/* Direct Link Display */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Lien direct:</p>
            <div className="flex items-center space-x-2 p-3 bg-accent/30 rounded-lg border border-border/50">
              <code className="flex-1 text-xs text-foreground break-all font-mono">
                {shareUrl}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                disabled={copying}
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                {copying ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
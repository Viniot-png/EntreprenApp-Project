import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Reply, Forward, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageActionsProps {
  messageId: string;
  content: string;
  isOwn?: boolean;
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
}

const MessageActions = ({ messageId, content, onReply, onForward, onDelete, onEdit }: MessageActionsProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Message copié",
        description: "Le message a été copié dans le presse-papiers.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le message.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit?.(messageId)}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6L21 11l-6-6-6 6z"/></svg>
            Modifier
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onReply?.(messageId)}>
          <Reply className="h-4 w-4 mr-2" />
          Répondre
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onForward?.(messageId)}>
          <Forward className="h-4 w-4 mr-2" />
          Transférer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copier
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete?.(messageId)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageActions;
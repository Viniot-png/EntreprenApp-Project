import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Archive, Trash2, UserX, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/hooks/useMessages';

interface ConversationActionsProps {
  conversation: Conversation;
  onMarkAsUnread?: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  onBlock?: (conversationId: string) => void;
}

const ConversationActions = ({ 
  conversation, 
  onMarkAsUnread, 
  onArchive, 
  onDelete, 
  onBlock 
}: ConversationActionsProps) => {
  const { toast } = useToast();

  const handleMarkAsUnread = () => {
    onMarkAsUnread?.(conversation.id);
    toast({
      title: "Conversation marquée comme non lue",
      description: `La conversation avec ${conversation.participant.name} a été marquée comme non lue.`,
    });
  };

  const handleArchive = () => {
    onArchive?.(conversation.id);
    toast({
      title: "Conversation archivée",
      description: `La conversation avec ${conversation.participant.name} a été archivée.`,
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette conversation avec ${conversation.participant.name} ?`)) {
      onDelete?.(conversation.id);
      toast({
        title: "Conversation supprimée",
        description: `La conversation avec ${conversation.participant.name} a été supprimée.`,
        variant: "destructive",
      });
    }
  };

  const handleBlock = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir bloquer ${conversation.participant.name} ?`)) {
      onBlock?.(conversation.id);
      toast({
        title: "Utilisateur bloqué",
        description: `${conversation.participant.name} a été bloqué.`,
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
      <DropdownMenuContent align="end" className="w-56">
        {conversation.unreadCount === 0 && (
          <DropdownMenuItem onClick={handleMarkAsUnread}>
            <Mail className="h-4 w-4 mr-2" />
            Marquer comme non lu
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="h-4 w-4 mr-2" />
          Archiver
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer la conversation
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleBlock}
          className="text-destructive focus:text-destructive"
        >
          <UserX className="h-4 w-4 mr-2" />
          Bloquer l'utilisateur
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConversationActions;
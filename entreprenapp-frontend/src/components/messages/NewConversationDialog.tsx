import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import type { FrontendUser } from '@/lib/api/services';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartConversation: (user: FrontendUser) => void;
}

const NewConversationDialog = ({ open, onOpenChange, onStartConversation }: NewConversationDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { allUsers, isLoading } = useFriends();

  const filteredUsers = (allUsers || []).filter(user =>
    (user.fullname || user.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartConversation = (user: FrontendUser) => {
    onStartConversation(user);
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Sélectionnez une personne pour commencer une nouvelle conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-6">Chargement...</div>
            ) : filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleStartConversation(user)}
                className="flex items-center space-x-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      {/* Safe displayName fallback: name -> fullname -> username -> email -> placeholder */}
                      {(() => {
                        const displayName = user.name || user.fullname || user.username || user.email || 'U';
                        return <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>;
                      })()}
                    </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name || user.fullname || user.username || user.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                    {user.company && (
                      <span className="text-xs text-muted-foreground truncate">
                        {user.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {(!isLoading && filteredUsers.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                Aucun utilisateur trouvé
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;
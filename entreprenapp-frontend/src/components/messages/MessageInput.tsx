import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  onSendMessage: (content: string, fileBase64?: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Tapez votre message..." 
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim(), null);
    setMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const readFileAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileUpload = async (file?: File | null) => {
    try {
      if (!file) {
        toast({
          title: "Aucun fichier sélectionné",
          description: "Veuillez sélectionner un fichier à envoyer.",
        });
        return;
      }

      const base64 = await readFileAsBase64(file);
      // Send file together with text if any
      onSendMessage(message.trim() || '', base64 || null);
      setMessage('');
      setIsTyping(false);
    } catch (err) {
      console.error('File read error', err);
      toast({ title: 'Erreur', description: 'Impossible de lire le fichier', variant: 'destructive' });
    }
  };

  const handleEmojiPicker = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "Le sélecteur d'emojis sera bientôt disponible.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Simulate typing indicator
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      // In a real app, you'd send typing status to the server
    } else if (isTyping && !e.target.value) {
      setIsTyping(false);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Input
            placeholder={placeholder}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleEmojiPicker}
              disabled={disabled}
            >
              <Smile className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || disabled}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f);
        }}
      />
    </div>
  );
};

export default MessageInput;
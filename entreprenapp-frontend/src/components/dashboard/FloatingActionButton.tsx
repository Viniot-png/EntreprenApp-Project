import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  return (
    <Link to="/create-post">
      <Button
        size="icon"
        className={cn(
          "fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full gradient-gold shadow-gold hover:shadow-gold/50 transition-all duration-300 hover:scale-110 active:scale-95",
          "text-white border-2 border-white/20 backdrop-blur-sm",
          className
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Link>
  );
}
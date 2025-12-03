import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from 'next-themes';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadCount: unreadNotificationCount } = useNotifications();

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <Logo size="sm" showText={false} />
        
        {/* Center: Search button */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Badge>
              )}
            </Button>
          </Link>
          
          <Link to="/profile">
            <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="gradient-gold text-white text-xs font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
      
      {/* Safe area for devices with notch */}
      <div className="h-safe-area-inset-top" />
    </div>
  );
}
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  User, 
  MessageCircle, 
  Bell, 
  Settings,
  CalendarDays,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { name: 'Accueil', href: '/dashboard', icon: Home },
  { name: 'Réseau', href: '/network', icon: User },
  { name: 'Événements', href: '/events', icon: CalendarDays },
  { name: 'Défis', href: '/challenges', icon: Trophy },
  { name: 'Messages', href: '/messages', icon: MessageCircle, badge: 2 },
  { name: 'Notifications', href: '/notifications', icon: Bell, badge: 3 },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-elegant overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 p-2 min-w-min">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 relative group",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-transform group-active:scale-95",
                  isActive && "animate-scale-in"
                )} />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium leading-none",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 gradient-gold rounded-b-full animate-scale-in" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}
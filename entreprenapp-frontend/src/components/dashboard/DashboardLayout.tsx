import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useMessages } from '@/hooks/useMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { Home, Users, PlusSquare, Bell, MessageCircle, Settings, LogOut, Menu, X, Moon, Sun, CalendarDays, Search, Trophy } from 'lucide-react';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardContent = ({
  children
}: DashboardLayoutProps) => {
  const {
    user,
    logout
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const {
    isMobile,
    isTablet,
    isDesktop
  } = useScreenSize();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { conversations } = useMessages();
  const { unreadCount: unreadNotificationCount } = useNotifications();

  // Calculer les compteurs dynamiquement - stable references
  const unreadMessageCount = useMemo(() => {
    if (!conversations || conversations.length === 0) return 0;
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  }, [conversations]);

  const navigation = useMemo(() => [{
    name: 'Accueil',
    href: '/dashboard',
    icon: Home
  }, {
    name: 'Mon Réseau',
    href: '/network',
    icon: Users
  }, {
    name: 'Événements',
    href: '/events',
    icon: CalendarDays
  }, {
    name: 'Défis',
    href: '/challenges',
    icon: Trophy
  }, {
    name: 'Messages',
    href: '/messages',
    icon: MessageCircle,
    badge: unreadMessageCount > 0 ? unreadMessageCount : undefined
  }, {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined
  }, {
    name: 'Mon Profil',
    href: '/profile',
    icon: Users
  }, {
    name: 'Créer un Post',
    href: '/create-post',
    icon: PlusSquare
  }, {
    name: 'Paramètres',
    href: '/settings',
    icon: Settings
  }], [unreadMessageCount, unreadNotificationCount]);
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  if (!user) return null;

  // Mobile Layout - LinkedIn style
  if (isMobile) {
    return <div className="min-h-screen bg-background">
        {/* Mobile Header - LinkedIn style */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Logo size="sm" showText={false} />
            
            {/* Search bar - LinkedIn style */}
            <div className="flex-1 max-w-xs mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher" className="pl-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
            </div>
            
            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-600 dark:text-gray-400">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 relative">
                  <MessageCircle className="h-5 w-5" />
                  {unreadMessageCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">{unreadMessageCount}</Badge>}
                </Button>
              </Link>
              
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Link to="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="gradient-gold text-white text-xs font-semibold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="pt-16 pb-16 px-4">
          {children}
        </main>

        {/* Bottom Navigation - LinkedIn style */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-border">
          <nav className="flex items-center justify-around py-2">
            {[navigation[0], navigation[1], navigation[2], navigation[3], navigation[4]].map(item => {
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} className={`flex flex-col items-center py-2 px-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                  <div className="relative">
                    <item.icon className="h-6 w-6 mb-1" />
                    {item.badge && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                        {item.badge}
                      </Badge>}
                  </div>
                  <span className="text-[10px]">{item.name.split(' ')[0]}</span>
                </Link>;
          })}
          </nav>
        </div>
      </div>;
  }

  // Tablet Layout - LinkedIn style
  if (isTablet) {
    return <div className="min-h-screen bg-background">
        {/* Tablet Header - LinkedIn style */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-4 flex-1">
              <Logo size="sm" />
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher" className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-600 dark:text-gray-400">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 relative">
                  <MessageCircle className="h-5 w-5" />
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">2</Badge>
                </Button>
              </Link>
              
              <Link to="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="gradient-gold text-white text-xs font-semibold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="pt-16 px-4 pb-6">
          {children}
        </main>

        {/* Bottom Navigation - LinkedIn style for tablet */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-border">
          <nav className="flex items-center justify-around my-0 py-0">
            {[navigation[0], navigation[1], navigation[2], navigation[3], navigation[4], navigation[5]].map(item => {
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                  <div className="relative">
                    <item.icon className="h-6 w-6 mb-1" />
                    {item.badge && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                        {item.badge}
                      </Badge>}
                  </div>
                  <span className="text-xs">{item.name.split(' ')[0]}</span>
                </Link>;
          })}
          </nav>
        </div>
      </div>;
  }

  // Desktop Layout
  return <div className="min-h-screen bg-background">
      {/* Desktop LinkedIn-style Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-border shadow-sm py-0 my-0">
        <div className="max-w-7xl flex items-center px-[25px] py-px my-[10px] mx-[10px]">
          {/* Left Section: Logo + Large Search Bar */}
          <div className="flex items-center gap-6 flex-1 max-w-2xl mx-[70px]">
            <Logo size="sm" className="flex-shrink-0" />
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Rechercher" className="pl-12 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary/50 focus:bg-white dark:focus:bg-gray-900 rounded-lg text-sm font-medium placeholder:text-gray-500" />
            </div>
          </div>
          
          {/* Center Navigation - Compact LinkedIn style */}
          <nav className="flex items-center justify-center">
            <div className="flex items-center space-x-1">
              {navigation.slice(0, 5).map(item => {
              const isActive = location.pathname === item.href;
              return <Link key={item.name} to={item.href} className={`flex flex-col items-center py-3 px-4 transition-all duration-200 relative group hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${isActive ? 'text-primary bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                    <div className="relative">
                      <item.icon className="h-6 w-6 mb-1" />
                      {item.badge && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                          {item.badge}
                        </Badge>}
                    </div>
                    {/* Active indicator */}
                    {isActive && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-12 bg-primary rounded-full" />}
                  </Link>;
            })}
            </div>
            
            {/* Right icons group - Notifications and Settings */}
            <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              {[navigation[5], navigation[8]].map(item => {
                const isActive = location.pathname === item.href;
                return <Link key={item.name} to={item.href} className={`flex flex-col items-center py-3 px-4 transition-all duration-200 relative group hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${isActive ? 'text-primary bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                  <div className="relative">
                    <item.icon className="h-6 w-6 mb-1" />
                    {item.badge && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center">
                      {item.badge}
                    </Badge>}
                  </div>
                  {isActive && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-12 bg-primary rounded-full" />}
                </Link>;
              })}
            </div>
          </nav>

          {/* Right Section: User Actions */}
          <div className="flex items-center gap-3 ml-6">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <LogOut className="h-5 w-5" />
            </Button>
            
            <Link to="/profile">
              <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/30 transition-all">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="gradient-gold text-white text-sm font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>;
};
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  // ThemeProvider is provided at the top-level `App.tsx` so don't re-wrap here.
  return <DashboardContent>{children}</DashboardContent>;
};
export default DashboardLayout;
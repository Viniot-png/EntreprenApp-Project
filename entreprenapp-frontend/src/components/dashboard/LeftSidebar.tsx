import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  BarChart3, 
  Bookmark, 
  Users, 
  Calendar, 
  Hash,
  ChevronRight
} from 'lucide-react';

export const LeftSidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const profileStats = [
    { label: 'Vues du profil', value: '142', trend: '+12%' },
    { label: 'Impressions des posts', value: '1,248', trend: '+5%' }
  ];

  const shortcuts = [
    { icon: Bookmark, label: 'Éléments enregistrés', count: 23 },
    { icon: Users, label: 'Mes groupes', count: 8 },
    { icon: Calendar, label: 'Événements', count: 3 },
    { icon: Hash, label: 'Hashtags suivis', count: 15 }
  ];

  return (
    <div className="space-y-6 sticky top-20">
      {/* Profile Card */}
      <Card className="glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 animate-fade-in overflow-hidden">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-16 bg-gradient-to-r from-primary/20 to-primary/30 relative">
            {user.coverImage && (
              <img 
                src={user.coverImage} 
                alt="Couverture" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          </div>
          
          {/* Avatar overlapping */}
          <div className="absolute -bottom-8 left-4">
            <Avatar className="h-16 w-16 ring-4 ring-background shadow-elegant">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="gradient-gold text-white text-lg font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-10 pb-4">
          <div className="text-center">
            <Link to="/profile" className="story-link">
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                {user.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{user.role}</p>
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-2 italic">"{user.bio}"</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card className="glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-foreground">Statistiques</h4>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {profileStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between group hover:bg-accent/30 p-2 rounded-lg transition-all duration-200">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">{stat.value}</span>
                  <Badge variant="outline" className="text-xs px-1.5 h-5 text-green-600 border-green-200">
                    {stat.trend}
                  </Badge>
                </div>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shortcuts Card */}
      <Card className="glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-3">
          <h4 className="font-medium text-foreground">Raccourcis</h4>
        </CardHeader>
        <CardContent className="space-y-1">
          {shortcuts.map((shortcut, index) => (
            <Link
              key={index}
              to="#"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <shortcut.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {shortcut.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {shortcut.count}
                </Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
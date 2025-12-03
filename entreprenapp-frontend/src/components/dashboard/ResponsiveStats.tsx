import { Card, CardContent } from '@/components/ui/card';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useFriends } from '@/hooks/useFriends';
import { useEffect, useState } from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  subtitle: string;
  className?: string;
  style?: React.CSSProperties;
}

const StatCard = ({ value, label, subtitle, className, style }: StatCardProps) => (
  <Card className={cn("glass-effect shadow-elegant hover:shadow-gold transition-all duration-300 hover:scale-105", className)} style={style}>
    <CardContent className="p-4 text-center">
      <div className="h-10 w-10 gradient-gold rounded-full flex items-center justify-center mx-auto mb-2">
        <span className="text-white font-bold text-sm">{value}</span>
      </div>
      <h3 className="font-semibold text-foreground text-sm">{label}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

export function ResponsiveStats() {
  const { isMobile, isTablet } = useScreenSize();
  const { user } = useAuth();
  const { posts } = usePosts();
  const { friends } = useFriends();
  const [stats, setStats] = useState([
    { value: 0, label: 'Connexions', subtitle: '+12 cette semaine' },
    { value: 0, label: 'Posts', subtitle: '+3 ce mois' },
    { value: 0, label: 'Vues', subtitle: '+23% ce mois' },
  ]);

  useEffect(() => {
    // Calculer les statistiques dynamiques
    const userPosts = posts.filter(post => post.authorId === user?.id).length;
    const totalViews = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
    
    setStats([
      { value: friends.length, label: 'Connexions', subtitle: `${Math.max(0, friends.length - 5)} cette semaine` },
      { value: userPosts, label: 'Posts', subtitle: `+${Math.max(0, userPosts - 2)} ce mois` },
      { value: totalViews, label: 'Vues', subtitle: `+${Math.max(0, Math.round((totalViews / posts.length || 0)))  }% ce mois` },
    ]);
  }, [posts, friends, user?.id]);

  if (isMobile) {
    return (
      <div className="relative">
        {/* Mobile: Horizontal scrollable cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              label={stat.label}
              subtitle={stat.subtitle}
              className="min-w-[120px] snap-center"
            />
          ))}
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center gap-1 mt-3">
          {stats.map((_, index) => (
            <div key={index} className="h-1 w-6 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            value={stat.value}
            label={stat.label}
            subtitle={stat.subtitle}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  // Desktop: Original grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
}
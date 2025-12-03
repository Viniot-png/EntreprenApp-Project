import { cn } from "@/lib/utils";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeVariants = {
  sm: {
    icon: 'h-8 w-8',
    text: 'text-sm',
    container: 'gap-2'
  },
  md: {
    icon: 'h-10 w-10',
    text: 'text-base',
    container: 'gap-2.5'
  },
  lg: {
    icon: 'h-12 w-12',
    text: 'text-lg',
    container: 'gap-3'
  },
  xl: {
    icon: 'h-16 w-16',
    text: 'text-xl',
    container: 'gap-4'
  }
};

export function Logo({ size = 'md', showText = true, className, textClassName }: LogoProps) {
  const variant = sizeVariants[size];

  return (
    <div className={cn("flex items-center", variant.container, className)}>
      {/* Logo Icon - Using favicon */}
      <div className={cn(
        "rounded-xl flex items-center justify-center shadow-gold animate-float overflow-hidden border-2 border-primary/20",
        variant.icon
      )}>
        <img 
          src="/lovable-uploads/a08a9764-dc5c-46ad-bc00-d7ddc061222a.png" 
          alt="EntreprenApp Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-poppins font-bold text-foreground leading-tight",
            variant.text,
            textClassName
          )}>
            ENTREPRENAPP
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Networking Platform
          </span>
        </div>
      )}
    </div>
  );
}
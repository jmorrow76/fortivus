import { HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrayerButtonProps {
  praying: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export function PrayerButton({ praying, count, onClick, disabled, size = 'default' }: PrayerButtonProps) {
  const isSmall = size === 'sm';
  
  return (
    <Button
      variant="ghost"
      size={isSmall ? 'sm' : 'default'}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={cn(
        "gap-1.5 transition-colors",
        isSmall ? "h-7 px-2" : "h-8 px-3",
        praying 
          ? "text-accent hover:text-accent/80 hover:bg-accent/10" 
          : "text-muted-foreground hover:text-accent hover:bg-accent/10"
      )}
      title={praying ? "You're praying for this" : "Pray for this request"}
    >
      <HandHeart 
        className={cn(
          isSmall ? "h-3.5 w-3.5" : "h-4 w-4",
          praying && "fill-current"
        )} 
      />
      <span className={cn("font-medium", isSmall ? "text-xs" : "text-sm")}>
        {count > 0 ? count : ''} {isSmall ? '' : 'Praying'}
      </span>
    </Button>
  );
}
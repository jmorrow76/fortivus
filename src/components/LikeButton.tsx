import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export function LikeButton({ liked, count, onClick, disabled, size = 'default' }: LikeButtonProps) {
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
        liked 
          ? "text-red-500 hover:text-red-600 hover:bg-red-500/10" 
          : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
      )}
    >
      <Heart 
        className={cn(
          isSmall ? "h-3.5 w-3.5" : "h-4 w-4",
          liked && "fill-current"
        )} 
      />
      {count > 0 && (
        <span className={cn("font-medium", isSmall ? "text-xs" : "text-sm")}>
          {count}
        </span>
      )}
    </Button>
  );
}

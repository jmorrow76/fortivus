import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RestTimerOverlayProps {
  isVisible: boolean;
  initialSeconds: number;
  onClose: () => void;
  onTimerEnd: () => void;
}

export function RestTimerOverlay({ 
  isVisible, 
  initialSeconds, 
  onClose, 
  onTimerEnd 
}: RestTimerOverlayProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!isVisible) {
      setSeconds(initialSeconds);
      return;
    }

    if (seconds <= 0) {
      onTimerEnd();
      return;
    }

    const interval = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, seconds, initialSeconds, onTimerEnd]);

  useEffect(() => {
    if (isVisible) {
      setSeconds(initialSeconds);
    }
  }, [isVisible, initialSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const addTime = (amount: number) => {
    setSeconds(prev => Math.max(0, prev + amount));
  };

  const progress = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Title */}
          <p className="text-muted-foreground text-lg uppercase tracking-wider mb-8">
            Rest Timer
          </p>

          {/* Circular progress */}
          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className="stroke-secondary"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className="stroke-accent"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            {/* Time display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-mono font-bold text-foreground">
                {formatTime(seconds)}
              </span>
            </div>
          </div>

          {/* Time adjustment buttons */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="lg"
              className="bg-secondary border-border text-foreground hover:bg-secondary/80 gap-2"
              onClick={() => addTime(-15)}
            >
              <Minus className="h-4 w-4" />
              15s
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-secondary border-border text-foreground hover:bg-secondary/80 gap-2"
              onClick={() => addTime(15)}
            >
              <Plus className="h-4 w-4" />
              15s
            </Button>
          </div>

          {/* Skip button */}
          <Button
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-foreground gap-2"
            onClick={onClose}
          >
            <SkipForward className="h-5 w-5" />
            Skip Rest
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
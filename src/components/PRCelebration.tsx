import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface PRCelebrationProps {
  isVisible: boolean;
  exerciseName: string;
  weight: number;
  reps: number;
  onComplete: () => void;
}

export default function PRCelebration({ 
  isVisible, 
  exerciseName, 
  weight, 
  reps, 
  onComplete 
}: PRCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && !show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1.5 + Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Main celebration content */}
      <div className={`relative flex flex-col items-center gap-4 transition-all duration-500 ${
        show ? 'scale-100 translate-y-0' : 'scale-75 translate-y-8'
      }`}>
        {/* Trophy icon with pulse */}
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/30 rounded-full animate-ping" />
          <div className="relative p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-2xl animate-bounce-slow">
            <Trophy className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 animate-pulse">
            NEW PR!
          </h2>
          <p className="text-xl font-semibold text-foreground">
            {exerciseName}
          </p>
          <div className="flex items-center justify-center gap-3 text-2xl font-bold">
            <span className="text-primary">{weight} lbs</span>
            <span className="text-muted-foreground">×</span>
            <span className="text-primary">{reps} reps</span>
          </div>
        </div>

        {/* Stars burst */}
        <div className="absolute -z-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full animate-star-burst"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-60px)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

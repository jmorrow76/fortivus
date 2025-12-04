import { useEffect, useState, useRef } from "react";
import { Users, Dumbbell, TrendingUp, Award } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}

const stats: Stat[] = [
  {
    label: "Active Members",
    value: 2500,
    suffix: "+",
    icon: <Users className="h-6 w-6" />,
  },
  {
    label: "Workouts Completed",
    value: 50000,
    suffix: "+",
    icon: <Dumbbell className="h-6 w-6" />,
  },
  {
    label: "Lbs Lost Combined",
    value: 15000,
    suffix: "+",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    label: "Transformations",
    value: 850,
    suffix: "+",
    icon: <Award className="h-6 w-6" />,
  },
];

const useCountUp = (end: number, duration: number = 2000, shouldStart: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
};

const StatItem = ({ stat, isVisible }: { stat: Stat; isVisible: boolean }) => {
  const count = useCountUp(stat.value, 2000, isVisible);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col items-center text-center p-6 group">
      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
        {stat.icon}
      </div>
      <div className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
        {formatNumber(count)}
        <span className="text-accent">{stat.suffix}</span>
      </div>
      <p className="text-muted-foreground text-sm uppercase tracking-wider">
        {stat.label}
      </p>
    </div>
  );
};

const StatsCounter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;

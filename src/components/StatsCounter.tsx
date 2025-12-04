import { useEffect, useState, useRef } from "react";

interface Stat {
  label: string;
  value: number;
  suffix: string;
}

const stats: Stat[] = [
  { label: "Active Members", value: 2500, suffix: "+" },
  { label: "Workouts Completed", value: 50000, suffix: "+" },
  { label: "Lbs Lost Combined", value: 15000, suffix: "+" },
  { label: "Transformations", value: 850, suffix: "+" },
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
    <div className="flex flex-col items-center text-center py-8">
      <div className="text-4xl md:text-5xl font-medium text-foreground mb-3 tracking-tight">
        {formatNumber(count)}{stat.suffix}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
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
    <section ref={sectionRef} className="py-20 bg-secondary border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;

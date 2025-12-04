import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-fitness.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mature man training with weights"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Fitness Optimized for Men 40+
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up">
            Your Best Years
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Are Ahead
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 animate-fade-in-up delay-100">
            Science-backed programs, AI-powered body analysis, and curated
            supplements designed specifically for men over 40. Transform your
            physique and reclaim your vitality.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
            <Button variant="hero" size="xl" className="group">
              Start Your Transformation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl" className="group">
              <Play className="w-5 h-5" />
              Watch Success Stories
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/30 animate-fade-in-up delay-300">
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                50K+
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Active Members
              </div>
            </div>
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                92%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Success Rate
              </div>
            </div>
            <div>
              <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                4.9★
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Member Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

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
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/75 to-foreground/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-background/20 mb-8 animate-fade-in">
            <span className="text-sm font-medium text-background/90">
              Elite Performance for Men Who Refuse to Settle
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-background animate-fade-in-up">
            Strength Has
            <br />
            <span className="text-accent">No Expiration</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-background/80 max-w-xl mb-10 animate-fade-in-up delay-100 leading-relaxed">
            Built for men who dominate. AI-powered training, precision nutrition, 
            and elite protocols engineered for peak masculine performance at any age.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
            <Button variant="hero" size="xl" className="group bg-accent hover:bg-accent/90">
              Forge Your Legacy
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl" className="group bg-background/10 text-background border-background/20 hover:bg-background/20">
              <Play className="w-5 h-5" />
              See Transformations
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-background/20 animate-fade-in-up delay-300">
            <div>
              <div className="font-heading text-2xl md:text-3xl font-bold text-background">
                50K+
              </div>
              <div className="text-sm text-background/70 mt-1">
                Elite Members
              </div>
            </div>
            <div>
              <div className="font-heading text-2xl md:text-3xl font-bold text-background">
                92%
              </div>
              <div className="text-sm text-background/70 mt-1">
                Hit Their Goals
              </div>
            </div>
            <div>
              <div className="font-heading text-2xl md:text-3xl font-bold text-background">
                4.9★
              </div>
              <div className="text-sm text-background/70 mt-1">
                Member Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-background/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-background/60" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

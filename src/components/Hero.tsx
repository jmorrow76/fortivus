import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/30 mb-10 animate-fade-in">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-white/90">
              Performance for Men 40+
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-8 text-white animate-fade-in-up tracking-tight">
            Strength Has
            <br />
            No Expiration
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-12 animate-fade-in-up delay-100 leading-relaxed">
            AI-powered training and precision nutrition engineered for peak performance at any age.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Button variant="hero" size="xl" className="group">
              Start Your Journey
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl">
              View Programs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-white/20 animate-fade-in-up delay-300 max-w-lg mx-auto">
            <div>
              <div className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                50K+
              </div>
              <div className="text-xs text-white/60 mt-2 uppercase tracking-[0.15em]">
                Members
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                92%
              </div>
              <div className="text-xs text-white/60 mt-2 uppercase tracking-[0.15em]">
                Success Rate
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-medium text-white tracking-tight">
                4.9★
              </div>
              <div className="text-xs text-white/60 mt-2 uppercase tracking-[0.15em]">
                Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border border-white/30 flex items-start justify-center p-2">
          <div className="w-0.5 h-2 bg-white/60" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

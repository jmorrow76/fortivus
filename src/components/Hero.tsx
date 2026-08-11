import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-brotherhood-dawn.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Christian men standing together at dawn on a misty pine ridge"
          width={1920}
          height={1280}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/15 to-primary/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-accent/50 mb-10 animate-fade-in">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent">
              A Christian Brotherhood for Men 40+
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-8 text-primary-foreground animate-fade-in-up tracking-tight">
            Brothers in
            <br />
            Iron &amp; Spirit
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/75 max-w-xl mx-auto mb-6 animate-fade-in-up delay-100 leading-relaxed">
            More than fitness. A lifestyle platform where Christian men grow in faith, lead their
            families, sharpen their calling, and steward their strength—together.
          </p>

          {/* Scripture */}
          <p className="text-sm text-primary-foreground/50 italic mb-12 animate-fade-in-up delay-150">
            "As iron sharpens iron, so one man sharpens another." — Proverbs 27:17
          </p>

          {/* CTAs */}
          <div className="flex justify-center animate-fade-in-up delay-200">
            <a href="#pricing">
              <Button variant="hero" size="xl" className="group">
                Join the Brotherhood
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-primary-foreground/20 animate-fade-in-up delay-300 max-w-lg mx-auto">
            <div>
              <div className="text-2xl md:text-3xl font-medium text-primary-foreground tracking-tight">
                50K+
              </div>
              <div className="text-xs text-primary-foreground/60 mt-2 uppercase tracking-[0.15em]">
                Brothers
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-medium text-primary-foreground tracking-tight">
                4
              </div>
              <div className="text-xs text-primary-foreground/60 mt-2 uppercase tracking-[0.15em]">
                Life Pillars
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-medium text-primary-foreground tracking-tight">
                4.9★
              </div>
              <div className="text-xs text-primary-foreground/60 mt-2 uppercase tracking-[0.15em]">
                Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-0.5 h-2 bg-accent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
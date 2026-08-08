import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Battery,
  Brain,
  Briefcase,
  Calendar,
  Camera,
  Dumbbell,
  Heart,
  MapPin,
  Medal,
  Moon,
  RotateCcw,
  Salad,
  Shield,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const eliteFeatures = [
  {
    icon: Camera,
    title: "AI Body Analysis",
    description: "Upload a photo and get instant body composition insights. Track changes over time.",
    highlight: "Most Popular",
    link: "/body-analysis",
  },
  {
    icon: Brain,
    title: "AI Personal Plan",
    description: "Get a fully customized workout program based on your unique goals and training experience.",
    link: "/personal-plan",
  },
  {
    icon: Heart,
    title: "Wearable Integration",
    description: "Sync Apple Health or Google Fit to import steps, heart rate, and sleep data for holistic health tracking.",
    link: "/profile",
  },
  {
    icon: BarChart3,
    title: "AI Progress Analysis",
    description: "Build a visual timeline of your transformation. AI compares your photos to quantify muscle gains, fat loss, and overall progress.",
    highlight: "New",
    link: "/progress",
  },
  {
    icon: Activity,
    title: "Daily AI Check-ins",
    description: "Log your mood, energy, and sleep. Get adaptive workout recommendations based on how you feel today.",
    link: "/daily-checkin",
  },
];

const freeFeatures = [
  {
    icon: Users,
    title: "Community Forum",
    description: "Connect with thousands of men on the same journey. Ask questions, share wins, and stay motivated.",
    link: "/forum",
  },
  {
    icon: Trophy,
    title: "Gamification & Badges",
    description: "Earn XP, unlock badges, and climb the leaderboard. Make fitness fun with friendly competition.",
    link: "/gamification",
  },
  {
    icon: Target,
    title: "Weekly Challenges",
    description: "Join community challenges to push your limits and earn bonus rewards for completing goals.",
    link: "/gamification",
  },
  {
    icon: Calendar,
    title: "Knowledge Hub",
    description: "Access expert articles on training, recovery, and mindset tailored for men over 40.",
    link: "/knowledge-hub",
  },
];

const FeaturesShowcase = () => {
  return (
    <section id="features" className="section-padding bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Platform Features</span>
          <h2 className="section-title">
            Everything You Need to <span className="text-accent">Steward Well</span>
          </h2>
          <p className="section-description">
            Fortivus combines AI-powered personalization with proven training principles—all grounded in the calling to honor God with your body.
          </p>
        </div>

        {/* Elite Features */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold">Elite Features</h3>
              <p className="text-sm text-muted-foreground">Unlock with membership</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {eliteFeatures.map((feature) => (
              <Card key={feature.title} className="group p-5 hover:border-accent/30 transition-all hover:shadow-card relative overflow-hidden">
                {feature.highlight && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    {feature.highlight}
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <Link 
                  to={feature.link} 
                  className="text-sm text-accent font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Free Features */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Medal className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold">Free Features</h3>
              <p className="text-sm text-muted-foreground">Available to everyone</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {freeFeatures.map((feature) => (
              <Card key={feature.title} className="group p-5 hover:border-border/80 transition-all bg-card/50">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <Link 
                  to={feature.link} 
                  className="text-sm text-muted-foreground font-medium inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Explore <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button variant="default" size="lg" className="group" asChild>
              <a href="#pricing">
                Unlock All Features
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Link to="/auth">
              <Button variant="outline" size="lg">Start Free</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Join 50,000+ Christian men stewarding their strength for God's glory
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
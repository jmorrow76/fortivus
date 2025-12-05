import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, TrendingUp, FileText, ArrowRight, Shield, Zap, Target, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Camera,
    title: "Precision Body Scanning",
    description: "Upload a single photo and our AI delivers body fat estimates within 2% of DEXA scan accuracy. No calipers, no guesswork.",
  },
  {
    icon: TrendingUp,
    title: "Adaptive Goal Planning",
    description: "Set your target—whether it's 15% body fat or adding 10 lbs of muscle. Our AI calculates your realistic timeline and milestones.",
  },
  {
    icon: FileText,
    title: "Personalized Protocols",
    description: "Receive custom workout splits, meal plans, and supplement stacks tailored to your metabolism, schedule, and goals.",
  },
  {
    icon: Sparkles,
    title: "Visual Progress Tracking",
    description: "Side-by-side photo comparisons with AI-detected changes. Watch your transformation unfold week by week.",
  },
];

const benefits = [
  "Clinically-validated AI algorithms",
  "Results in under 60 seconds",
  "Private & secure photo processing",
  "Unlimited analyses with Elite",
];

const AIAnalysis = () => {
  return (
    <section id="ai-analysis" className="section-padding bg-background relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="section-header mb-16">
          <span className="section-label">AI-Powered Transformation</span>
          <h2 className="section-title">
            Know Your Body. <span className="text-accent">Transform It.</span>
          </h2>
          <p className="section-description max-w-2xl">
            Most men over 40 train blind—guessing their body fat, hoping their diet works. 
            Fortivus Elite members get AI-powered precision that eliminates guesswork and accelerates results.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Content */}
          <div>
            {/* Features */}
            <div className="space-y-6 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4 p-4 rounded-lg bg-card border border-border hover:border-accent/30 transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="default" size="lg" className="group" asChild>
                <Link to="/body-analysis">
                  Try AI Body Analysis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#pricing">View Elite Benefits</a>
              </Button>
            </div>
          </div>

          {/* Visual Demo */}
          <div className="relative">
            <Card className="relative overflow-hidden bg-gradient-to-br from-card to-secondary/30 border-border">
              {/* Demo Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">AI Body Analysis</div>
                    <div className="text-xs text-muted-foreground">Elite Feature</div>
                  </div>
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-6 space-y-6">
                {/* Simulated Analysis Results */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Body Fat</div>
                    <div className="font-heading text-2xl font-bold text-accent">18.5%</div>
                    <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> -2.3% from start
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Lean Mass</div>
                    <div className="font-heading text-2xl font-bold">156 lbs</div>
                    <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +4 lbs gained
                    </div>
                  </div>
                </div>

                {/* Goal Progress */}
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">Goal: 15% Body Fat</div>
                    <div className="text-sm text-accent">67% Complete</div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: "67%" }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Est. completion: 8 weeks at current pace
                  </div>
                </div>

                {/* AI Recommendations Preview */}
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <div className="text-sm font-medium">AI Recommendation</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Based on your progress, increase protein to 180g/day and add a 4th training day for faster results."
                  </p>
                </div>
              </div>

              {/* Demo Footer */}
              <div className="p-4 bg-secondary/50 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Your data is private & encrypted</span>
                  </div>
                  <span>Elite Members Only</span>
                </div>
              </div>
            </Card>

            {/* Floating Testimonial */}
            <div className="absolute -bottom-4 -left-4 max-w-xs p-4 rounded-lg bg-card border border-border shadow-card">
              <p className="text-sm italic text-muted-foreground mb-2">
                "Finally, I know exactly where I stand and what to do next. No more guessing."
              </p>
              <div className="text-xs font-medium">— James, 47</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAnalysis;
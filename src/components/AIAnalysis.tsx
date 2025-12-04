import { Button } from "@/components/ui/button";
import { Camera, Sparkles, TrendingUp, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Photo Analysis",
    description: "Upload your photos and our AI estimates body fat percentage with clinical accuracy.",
  },
  {
    icon: TrendingUp,
    title: "Goal Setting",
    description: "Tell us your goals and timeline. We'll create a realistic transformation plan.",
  },
  {
    icon: FileText,
    title: "Custom Protocol",
    description: "Receive a personalized workout and nutrition plan tailored to your body type.",
  },
  {
    icon: Sparkles,
    title: "Progress Tracking",
    description: "Track your transformation with AI-powered progress photos and metrics.",
  },
];

const AIAnalysis = () => {
  return (
    <section id="ai-analysis" className="section-padding bg-background relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="section-label">AI Body Analysis</span>
            <h2 className="section-title text-left max-w-none">
              Your Personal <span className="text-accent">AI Coach</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Stop guessing. Our proprietary AI analyzes your physique and creates
              a science-backed transformation plan. Available exclusively for
              Prime Forge members.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="lg" className="group">
                Try AI Analysis Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                See Sample Report
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-border animate-[spin_30s_linear_infinite]" />
              
              {/* Inner Ring */}
              <div className="absolute inset-8 rounded-full border border-border" />
              
              {/* Center Card */}
              <div className="absolute inset-16 rounded-2xl bg-card border border-border overflow-hidden shadow-card">
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">AI Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to begin
                  </p>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute top-4 right-4 px-4 py-3 rounded-lg bg-card border border-border shadow-subtle">
                <div className="text-xs text-muted-foreground">Body Fat</div>
                <div className="font-heading text-lg font-bold text-accent">18.5%</div>
              </div>
              
              <div className="absolute bottom-4 left-4 px-4 py-3 rounded-lg bg-card border border-border shadow-subtle">
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="font-heading text-lg font-bold text-accent">67%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAnalysis;

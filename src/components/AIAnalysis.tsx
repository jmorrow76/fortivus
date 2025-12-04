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
    <section id="ai-analysis" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
              AI Body Analysis
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Your Personal{" "}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                AI Coach
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Stop guessing. Our proprietary AI analyzes your physique and creates
              a science-backed transformation plan. Available exclusively for
              PrimeFit members.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
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
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_20s_linear_infinite]" />
              
              {/* Inner Ring */}
              <div className="absolute inset-8 rounded-full border border-primary/30" />
              
              {/* Center Card */}
              <div className="absolute inset-16 rounded-3xl bg-gradient-to-br from-card to-secondary border border-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="flex flex-col items-center justify-center h-full p-6 text-center relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center mb-6 shadow-[0_0_40px_hsla(38,92%,50%,0.3)]">
                    <Sparkles className="w-10 h-10 text-background" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">AI Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to begin your analysis
                  </p>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute top-4 right-4 px-4 py-3 rounded-xl bg-card/90 backdrop-blur border border-border shadow-lg">
                <div className="text-xs text-muted-foreground">Body Fat</div>
                <div className="font-heading text-xl font-bold text-primary">18.5%</div>
              </div>
              
              <div className="absolute bottom-4 left-4 px-4 py-3 rounded-xl bg-card/90 backdrop-blur border border-border shadow-lg">
                <div className="text-xs text-muted-foreground">Goal Progress</div>
                <div className="font-heading text-xl font-bold text-primary">67%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAnalysis;

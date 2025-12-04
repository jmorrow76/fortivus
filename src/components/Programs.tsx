import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Dumbbell, Target, ArrowRight } from "lucide-react";

const programs = [
  {
    title: "Foundation Builder",
    description: "Perfect for beginners or returning to fitness. Build strength and mobility safely.",
    duration: "12 weeks",
    intensity: "Moderate",
    workoutsPerWeek: 3,
    focus: "Strength & Mobility",
    featured: false,
  },
  {
    title: "Prime Strength",
    description: "Our flagship program. Maximize muscle retention and build lean mass with proven protocols.",
    duration: "16 weeks",
    intensity: "High",
    workoutsPerWeek: 4,
    focus: "Hypertrophy & Power",
    featured: true,
  },
  {
    title: "Metabolic Reset",
    description: "Torch body fat while preserving muscle. Optimized for men with busy schedules.",
    duration: "8 weeks",
    intensity: "High",
    workoutsPerWeek: 5,
    focus: "Fat Loss & Conditioning",
    featured: false,
  },
];

const Programs = () => {
  return (
    <section id="programs" className="py-24 bg-gradient-to-b from-background to-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-4 block">
            Training Programs
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Programs Built for{" "}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Your Stage of Life
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Each program is designed with recovery, joint health, and hormonal
            optimization in mind. No more generic workouts.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <Card
              key={program.title}
              variant={program.featured ? "premium" : "interactive"}
              className={`relative overflow-hidden ${
                program.featured ? "md:-mt-4 md:mb-4 scale-[1.02]" : ""
              }`}
            >
              {program.featured && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
              )}
              {program.featured && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{program.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {program.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="font-semibold">{program.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Flame className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Intensity</div>
                      <div className="font-semibold">{program.intensity}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Weekly</div>
                      <div className="font-semibold">{program.workoutsPerWeek}x</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Focus</div>
                      <div className="font-semibold text-sm">{program.focus}</div>
                    </div>
                  </div>
                </div>
                <Button
                  variant={program.featured ? "gold" : "outline"}
                  className="w-full group"
                >
                  Start Program
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;

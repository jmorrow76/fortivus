import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, ArrowRight, Phone } from "lucide-react";

const PodsPromo = () => {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="max-w-xl">
            <span className="inline-block text-xs font-medium tracking-[0.2em] uppercase text-accent mb-4">
              Accountability Pods
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] mb-6">
              Three to five men. <br />
              One shared commitment.
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
              Join a small band of brothers who check in daily, keep honest streaks, and pray for
              each other. When you need backup, one button calls your brother.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Daily check-ins with a simple yes/no on your commitment",
                "Honest streaks so you can see who’s showing up",
                "Prayer requests shared only with your pod",
                "One-tap message or call to any brother",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-primary-foreground/90">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" asChild>
                <Link to="/pods">
                  Find Your Pod
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/accountability-partners">
                  <Phone className="w-4 h-4 mr-2" />
                  Accountability Partners
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: pod card preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/10 rounded-lg blur-3xl" />
            <div className="relative bg-card/5 border border-primary-foreground/10 rounded-lg p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-primary-foreground">
                    Morning Brotherhood Pod
                  </h3>
                  <p className="text-sm text-primary-foreground/60">
                    5 brothers • Daily prayer & movement
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { name: "Michael", streak: 12, today: true },
                  { name: "David", streak: 8, today: true },
                  { name: "James", streak: 21, today: false },
                  { name: "Daniel", streak: 5, today: true },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between p-3 rounded bg-primary-foreground/5 border border-primary-foreground/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent-foreground">
                        {member.name[0]}
                      </div>
                      <span className="text-sm font-medium text-primary-foreground">
                        {member.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-primary-foreground/60">
                        {member.streak}-day streak
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          member.today ? "bg-accent" : "bg-primary-foreground/20"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-primary-foreground/70 italic border-t border-primary-foreground/10 pt-4">
                "As iron sharpens iron, so one man sharpens another." — Proverbs 27:17
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PodsPromo;

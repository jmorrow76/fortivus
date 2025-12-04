import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      toast({
        title: "Welcome to Fortivus!",
        description: "Check your inbox for your first newsletter.",
      });
    }
  };

  return (
    <section className="section-padding bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-8 rounded-xl bg-accent flex items-center justify-center">
            <Mail className="w-8 h-8 text-accent-foreground" />
          </div>

          {/* Content */}
          <h2 className="section-title">
            Get Weekly <span className="text-accent">Prime Insights</span>
          </h2>
          <p className="section-description mb-10">
            Join 50,000+ men receiving our weekly newsletter with training tips,
            supplement research, and exclusive deals.
          </p>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-card"
              />
              <Button type="submit" variant="default" size="lg" className="group">
                Subscribe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 text-accent">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-semibold">You're in! Check your inbox.</span>
            </div>
          )}

          {/* Trust */}
          <p className="text-xs text-muted-foreground mt-6">
            No spam. Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

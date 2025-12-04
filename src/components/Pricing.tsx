import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { useAuth, FORTIVUS_ELITE } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user, session, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (!user || !session) {
      navigate("/auth");
      return;
    }

    if (planName === "Free") {
      return;
    }

    setLoading(planName);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    setLoading("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open portal",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      description: "Get started with essential content",
      price: "$0",
      period: "forever",
      icon: Zap,
      features: [
        "Access to free articles",
        "Basic workout guides",
        "Community forum access",
        "Weekly newsletter",
      ],
      cta: user ? "Current Plan" : "Get Started",
      variant: "outline" as const,
      popular: false,
      disabled: !!user,
    },
    {
      name: "Elite",
      description: "Full access to transform your fitness",
      price: `$${FORTIVUS_ELITE.price}`,
      period: "per month",
      icon: Sparkles,
      features: [
        "Everything in Free",
        "AI Body Analysis (unlimited)",
        "Progress photo tracking",
        "Personalized training plans",
        "Premium workout programs",
        "Exclusive supplement discounts",
        "Priority support",
      ],
      cta: subscription.subscribed ? "Your Plan" : "Start Elite Membership",
      variant: "default" as const,
      popular: true,
      disabled: subscription.subscribed,
      isCurrentPlan: subscription.subscribed,
    },
    {
      name: "Lifetime",
      description: "One payment, forever access",
      price: "$299",
      period: "one-time",
      icon: Crown,
      features: [
        "Everything in Elite",
        "Lifetime access guaranteed",
        "Early access to new features",
        "VIP community access",
        "Annual gear giveaways",
        "1-on-1 coaching session",
      ],
      cta: "Coming Soon",
      variant: "outline" as const,
      popular: false,
      disabled: true,
    },
  ];

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Membership</span>
          <h2 className="section-title">
            Invest in Your <span className="text-accent">Legacy</span>
          </h2>
          <p className="section-description">
            Choose the plan that matches your commitment. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              variant={plan.popular ? "premium" : "default"}
              className={`relative overflow-hidden ${
                plan.popular ? "md:-mt-4 md:mb-4 ring-1 ring-accent/20" : ""
              } ${plan.isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
              )}
              {plan.isCurrentPlan ? (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                  Your Plan
                </div>
              ) : plan.popular ? (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  Most Popular
                </div>
              ) : null}
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-secondary flex items-center justify-center">
                  <plan.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-8">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2 text-sm">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.isCurrentPlan ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleManageSubscription}
                    disabled={loading === "manage"}
                  >
                    {loading === "manage" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    size="lg"
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={plan.disabled || loading === plan.name}
                  >
                    {loading === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guarantee */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

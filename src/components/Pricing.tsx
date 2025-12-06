import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Loader2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth, FORTIVUS_ELITE } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user, session, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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
      const priceId = billingCycle === "yearly" 
        ? FORTIVUS_ELITE.yearly.price_id 
        : FORTIVUS_ELITE.monthly.price_id;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { priceId },
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

  const currentPrice = billingCycle === "yearly" 
    ? FORTIVUS_ELITE.yearly.price 
    : FORTIVUS_ELITE.monthly.price;
  
  const savingsPercent = Math.round(
    ((FORTIVUS_ELITE.monthly.price * 12 - FORTIVUS_ELITE.yearly.price) / 
    (FORTIVUS_ELITE.monthly.price * 12)) * 100
  );

  const isOnFreePlan = user && !subscription.subscribed;
  
  const plans = [
    {
      name: "Free",
      description: "Explore the fundamentals",
      price: "$0",
      period: "forever",
      icon: Zap,
      features: [
        "Community forum access",
        "Knowledge Hub articles",
        "Gamification & badges",
        "Community leaderboard",
        "Partner product recommendations",
      ],
      cta: isOnFreePlan ? "Current Plan" : "Get Started",
      variant: "outline" as const,
      popular: false,
      disabled: isOnFreePlan,
      isCurrentPlan: isOnFreePlan,
      authLink: !user,
    },
    {
      name: "Elite",
      description: "Full access to transform your fitness",
      price: `$${currentPrice}`,
      period: billingCycle === "yearly" ? "per year" : "per month",
      icon: Sparkles,
      features: [
        "Everything in Free",
        "AI workout recommendations",
        "AI nutrition & meal planning",
        "Calorie & macro tracking",
        "Advanced workout tracker",
        "Running GPS tracker with goals",
        "Wearable sync (Apple Health / Google Fit)",
        "Unlimited AI Body Analysis",
        "Progress photo tracking & comparison",
        "Daily check-in with AI coaching",
        "Hormonal cycle optimization",
        "Predictive joint health analytics",
        "Sleep-adaptive auto-programming",
        "Comeback protocol system",
        "Executive performance mode",
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
      description: "One payment, forever Elite access",
      price: "$499",
      period: "one-time",
      icon: Crown,
      features: [
        "All Elite features included",
        "Lifetime access guaranteed",
        "No monthly payments ever",
        "Lock in current pricing forever",
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
            Invest in Your <span className="text-accent">Stewardship</span>
          </h2>
          <p className="section-description">
            Choose the plan that matches your commitment to honoring God with your body. Cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-4 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full">
                Save {savingsPercent}%
              </span>
            </button>
          </div>
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
                ) : plan.authLink ? (
                  <Button
                    variant={plan.variant}
                    className="w-full"
                    size="lg"
                    onClick={() => navigate("/auth")}
                  >
                    {plan.cta}
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

        {/* Quick Start vs AI Personal Plan Comparison */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="font-heading text-2xl font-bold text-center mb-3">
            Planning Tools Comparison
          </h3>
          <p className="text-muted-foreground text-center mb-8">
            See the difference between our free guidance and premium AI-powered planning
          </p>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-heading font-semibold w-[40%]">Feature</TableHead>
                  <TableHead className="text-center font-heading font-semibold">
                    <div className="flex flex-col items-center gap-1">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>Quick Start Guide</span>
                      <span className="text-xs font-normal text-muted-foreground">Free</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-heading font-semibold bg-accent/10">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>AI Personal Plan</span>
                      <span className="text-xs font-normal text-accent">Elite</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { feature: "Personalized workout suggestions", quickStart: "Basic", aiPlan: "Advanced AI" },
                  { feature: "Nutrition guidance", quickStart: "General tips", aiPlan: "Full meal plans with macros" },
                  { feature: "Weekly schedule", quickStart: "Template-based", aiPlan: "Custom AI-generated" },
                  { feature: "Supplement recommendations", quickStart: "Basic list", aiPlan: "Personalized with dosages" },
                  { feature: "Based on your assessment", quickStart: true, aiPlan: true },
                  { feature: "Considers injuries/limitations", quickStart: "Limited", aiPlan: "Full consideration" },
                  { feature: "Save multiple plans", quickStart: false, aiPlan: true },
                  { feature: "Convert to workout templates", quickStart: false, aiPlan: true },
                  { feature: "Detailed exercise instructions", quickStart: false, aiPlan: true },
                  { feature: "Calorie targets calculated", quickStart: false, aiPlan: true },
                  { feature: "Progress timeline", quickStart: false, aiPlan: true },
                  { feature: "Key priorities breakdown", quickStart: false, aiPlan: true },
                ].map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium text-sm">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {row.quickStart === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : row.quickStart === false ? (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{row.quickStart}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center bg-accent/5">
                      {row.aiPlan === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : row.aiPlan === false ? (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      ) : (
                        <span className="text-sm font-medium text-accent">{row.aiPlan}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="font-heading text-2xl font-bold text-center mb-8">
            Full Feature Comparison
          </h3>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-heading font-semibold w-[40%]">Feature</TableHead>
                  <TableHead className="text-center font-heading font-semibold">Free</TableHead>
                  <TableHead className="text-center font-heading font-semibold bg-accent/10">
                    <span className="flex items-center justify-center gap-1">
                      <Crown className="h-4 w-4 text-accent" />
                      Elite
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-heading font-semibold">Lifetime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { feature: "Community forum access", free: true, elite: true, lifetime: true },
                  { feature: "Knowledge Hub articles", free: true, elite: true, lifetime: true },
                  { feature: "Gamification & badges", free: true, elite: true, lifetime: true },
                  { feature: "Community leaderboard", free: true, elite: true, lifetime: true },
                  { feature: "Partner recommendations", free: true, elite: true, lifetime: true },
                  { feature: "Quick Start Guide", free: true, elite: true, lifetime: true },
                  { feature: "AI Personal Plan", free: false, elite: true, lifetime: true },
                  { feature: "AI workout recommendations", free: false, elite: true, lifetime: true },
                  { feature: "AI nutrition & meal planning", free: false, elite: true, lifetime: true },
                  { feature: "Calorie & macro tracking", free: false, elite: true, lifetime: true },
                  { feature: "Advanced workout tracker", free: false, elite: true, lifetime: true },
                  { feature: "Running GPS tracker", free: false, elite: true, lifetime: true },
                  { feature: "Wearable integration", free: false, elite: true, lifetime: true },
                  { feature: "Unlimited AI Body Analysis", free: false, elite: true, lifetime: true },
                  { feature: "Progress photo tracking", free: false, elite: true, lifetime: true },
                  { feature: "1-on-1 AI Coaching", free: false, elite: true, lifetime: true },
                  { feature: "Hormonal cycle optimization", free: false, elite: true, lifetime: true },
                  { feature: "Predictive joint health analytics", free: false, elite: true, lifetime: true },
                  { feature: "Sleep-adaptive auto-programming", free: false, elite: true, lifetime: true },
                  { feature: "Comeback protocol system", free: false, elite: true, lifetime: true },
                  { feature: "Executive performance mode", free: false, elite: true, lifetime: true },
                  { feature: "Priority support", free: false, elite: true, lifetime: true },
                ].map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {row.free ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center bg-accent/5">
                      {row.elite ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.lifetime ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
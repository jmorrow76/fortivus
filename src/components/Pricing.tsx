import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

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
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium",
    description: "Full access to transform your fitness",
    price: "$29",
    period: "per month",
    icon: Sparkles,
    features: [
      "Everything in Free",
      "AI Body Analysis (unlimited)",
      "Personalized training plans",
      "Premium workout programs",
      "Exclusive supplement discounts",
      "Priority community support",
      "Monthly coaching calls",
    ],
    cta: "Start 7-Day Trial",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Lifetime",
    description: "One payment, forever access",
    price: "$299",
    period: "one-time",
    icon: Crown,
    features: [
      "Everything in Premium",
      "Lifetime access guaranteed",
      "Early access to new features",
      "VIP Discord channel",
      "Annual gear giveaways",
      "Personalized nutrition plan",
    ],
    cta: "Get Lifetime Access",
    variant: "outline" as const,
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Membership</span>
          <h2 className="section-title">
            Invest in Your <span className="text-accent">Prime Years</span>
          </h2>
          <p className="section-description">
            Choose the plan that fits your commitment level. Cancel anytime.
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
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
              )}
              {plan.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}
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
                <Button variant={plan.variant} className="w-full" size="lg">
                  {plan.cta}
                </Button>
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

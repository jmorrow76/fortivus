import { useState } from "react";
import { Gift, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PromoCodeRedemption = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const { toast } = useToast();
  const { checkSubscription } = useAuth();

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter your promo code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-promo-code", {
        body: { code: code.trim() },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIsRedeemed(true);
      toast({
        title: "Success!",
        description: data.message || "Your Elite membership has been activated!",
      });

      // Refresh subscription status
      await checkSubscription();
    } catch (error: any) {
      toast({
        title: "Redemption failed",
        description: error.message || "Failed to redeem promo code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedeemed) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-primary">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Elite Membership Activated!</p>
              <p className="text-sm text-muted-foreground">Enjoy your lifetime access to all premium features.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5" />
          Have a Promo Code?
        </CardTitle>
        <CardDescription>
          Enter your code to unlock lifetime Elite membership
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="uppercase"
            disabled={isLoading}
          />
          <Button onClick={handleRedeem} disabled={isLoading || !code.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Redeem"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeRedemption;

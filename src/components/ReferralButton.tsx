import { useState } from "react";
import { Users, X, Send, Loader2, Copy, Check, Mail, Twitter, Facebook, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ReferralButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendName, setFriendName] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const referralLink = `${window.location.origin}?ref=${user?.id?.slice(0, 8) || 'friend'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with your friends.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!friendEmail || !friendName) {
      toast({
        title: "Missing fields",
        description: "Please enter your friend's name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-referral-email", {
        body: {
          friendName,
          friendEmail,
          referrerName: user?.user_metadata?.display_name || "A friend",
          referralLink,
        },
      });

      if (error) throw error;

      toast({
        title: "Invite sent!",
        description: `We've sent an invitation to ${friendName}.`,
      });

      setFriendEmail("");
      setFriendName("");
    } catch (error: any) {
      console.error("Error sending referral:", error);
      toast({
        title: "Failed to send invite",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent("Check out Fortivus - AI-powered fitness for men over 40! 💪");
    const url = encodeURIComponent(referralLink);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    // Use location.href as fallback if window.open is blocked
    const newWindow = window.open(shareUrl, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = shareUrl;
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(referralLink);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    const newWindow = window.open(shareUrl, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = shareUrl;
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out Fortivus - AI-powered fitness for men over 40! 💪 ${referralLink}`);
    const shareUrl = `https://wa.me/?text=${text}`;
    const newWindow = window.open(shareUrl, "_blank", "noopener,noreferrer");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = shareUrl;
    }
  };

  const shareOnInstagram = async () => {
    // Instagram doesn't have a direct share URL, so we copy and prompt user
    try {
      await navigator.clipboard.writeText(`Check out Fortivus - AI-powered fitness for men over 40! 💪 ${referralLink}`);
      toast({
        title: "Copied to clipboard!",
        description: "Open Instagram and paste in your story or DM.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the referral link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-lg z-50 bg-background hover:bg-muted"
        >
          <Users className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Refer a Friend</DialogTitle>
          <DialogDescription>
            Share Fortivus with your friends and help them transform their fitness.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Your referral link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralLink}
                  className="text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline" size="icon">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with friends to invite them to Fortivus.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="mt-4">
            <form onSubmit={handleEmailInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="friendName">Friend's name</Label>
                <Input
                  id="friendName"
                  placeholder="John"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="friendEmail">Friend's email</Label>
                <Input
                  id="friendEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="social" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Share Fortivus on your favorite social platform.
              </p>
              <Button
                onClick={shareOnTwitter}
                variant="outline"
                className="w-full justify-start"
              >
                <Twitter className="h-4 w-4 mr-3" />
                Share on X (Twitter)
              </Button>
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                className="w-full justify-start"
              >
                <Facebook className="h-4 w-4 mr-3" />
                Share on Facebook
              </Button>
              <Button
                onClick={shareOnWhatsApp}
                variant="outline"
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                Share on WhatsApp
              </Button>
              <Button
                onClick={shareOnInstagram}
                variant="outline"
                className="w-full justify-start"
              >
                <Instagram className="h-4 w-4 mr-3" />
                Share on Instagram
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralButton;

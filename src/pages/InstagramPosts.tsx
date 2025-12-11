import { useState } from "react";
import { Copy, Check, Instagram, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import post1Brand from "@/assets/instagram/post-1-brand.jpg";
import post2App from "@/assets/instagram/post-2-app.jpg";
import post3Community from "@/assets/instagram/post-3-community.jpg";
import post4Transformation from "@/assets/instagram/post-4-transformation.jpg";
import post5Faith from "@/assets/instagram/post-5-faith.jpg";

interface InstagramPost {
  id: number;
  image: string;
  caption: string;
  hashtags: string;
}

const instagramPosts: InstagramPost[] = [
  {
    id: 1,
    image: post1Brand,
    caption: `Steward Your Strength. 💪

Your body is a temple. How are you honoring it?

Fortivus is the faith-based fitness platform built specifically for Christian men over 40. We believe physical discipline and spiritual growth go hand in hand.

🙏 Daily Scripture to fuel your workouts
🏋️ AI-powered training designed for your body
👥 Brotherhood accountability partners
📊 Track progress that matters

Join a community of men who are serious about stewarding the strength God gave them.

Link in bio. 10% of all proceeds support local churches.`,
    hashtags: "#Fortivus #ChristianFitness #FaithAndFitness #MenOver40 #StewardYourStrength #FitnessFaith #ChristianMen #WorkoutMotivation #BodyIsATemple #FaithBasedFitness"
  },
  {
    id: 2,
    image: post2App,
    caption: `Your personal AI fitness coach is here. 📱

Introducing the Fortivus app — everything you need to transform your health in one place:

✅ AI Coaching that adapts to YOUR goals
✅ Workout tracking with personal records
✅ Calorie & macro logging made simple
✅ GPS run tracking with route mapping
✅ Progress photos to see your transformation
✅ Daily check-ins with Scripture

Built for men over 40 who are done with generic programs that don't account for our unique needs.

This isn't just another fitness app. It's a complete system for body AND spirit.

Download now — link in bio.`,
    hashtags: "#FitnessApp #AICoaching #WorkoutTracker #ChristianFitness #MenOver40 #FitnessOver40 #HealthTech #PersonalTraining #FitnessGoals #TransformYourLife"
  },
  {
    id: 3,
    image: post3Community,
    caption: `Iron sharpens iron. 🤝

You weren't meant to do this alone, brother.

Fortivus connects you with accountability partners who:
• Pray for you weekly
• Check in on your progress
• Encourage you when motivation fades
• Celebrate your wins

"Two are better than one... If either of them falls down, one can help the other up." — Ecclesiastes 4:9-10

Find your accountability partner today. Join a community of Christian men who are serious about growth — physically AND spiritually.

Link in bio.`,
    hashtags: "#IronSharpensIron #AccountabilityPartner #ChristianBrotherhood #MensMinistry #FaithAndFitness #Fortivus #StrongerTogether #ChristianCommunity #FitnessCommunity #MenSupportingMen"
  },
  {
    id: 4,
    image: post4Transformation,
    caption: `Your transformation story starts today. 📸

40+ doesn't mean settling. It means KNOWING what works.

At Fortivus, we've helped hundreds of men:
→ Build lean muscle naturally
→ Optimize hormones through lifestyle
→ Lose stubborn fat for good
→ Feel stronger than they did at 30

Our AI analyzes YOUR body and creates personalized:
• Workout programs
• Nutrition plans
• Supplement recommendations
• Recovery protocols

Stop following programs designed for 25-year-olds.

Start training smarter. Link in bio.`,
    hashtags: "#TransformationTuesday #FitnessTransformation #Over40Fitness #MensHealth #BodyTransformation #FitnessJourney #ChristianFitness #Fortivus #NeverTooLate #FitAt40"
  },
  {
    id: 5,
    image: post5Faith,
    caption: `Word + Weights = Wisdom 📖💪

How you start your morning matters.

At Fortivus, every day begins with Scripture. Because we know that true strength comes from Him.

"Do you not know that your bodies are temples of the Holy Spirit?" — 1 Corinthians 6:19

Your fitness journey isn't separate from your faith journey. They're the same journey.

Feed your spirit. Fuel your body. Honor the temple.

Join thousands of Christian men building both. Link in bio.

10% of all proceeds support local churches and ministries. 🙏`,
    hashtags: "#MorningRoutine #FaithAndFitness #ChristianLiving #BibleAndGym #BodyIsATemple #Fortivus #ChristianMen #SpiritualGrowth #FitnessMotivation #HolySpirit"
  }
];

const InstagramPosts = () => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (post: InstagramPost) => {
    const fullCaption = `${post.caption}\n\n${post.hashtags}`;
    await navigator.clipboard.writeText(fullCaption);
    setCopiedId(post.id);
    toast({ title: "Copied!", description: "Caption and hashtags copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = (image: string, id: number) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `fortivus-instagram-post-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded!", description: "Image saved to your device" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 md:pt-28 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full mb-4">
            <Instagram className="h-5 w-5" />
            <span className="font-medium">Instagram Content</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Ready-to-Post Content
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            5 Instagram posts for Fortivus advertising. Click to copy captions and download images.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-8 max-w-4xl mx-auto">
          {instagramPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="aspect-square bg-muted overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={`Instagram Post ${post.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Caption */}
                <CardContent className="p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Post {post.id} of 5
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadImage(post.image, post.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Image
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(post)}
                      >
                        {copiedId === post.id ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Caption
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto max-h-80">
                    <p className="text-sm whitespace-pre-line mb-4">
                      {post.caption}
                    </p>
                    <p className="text-xs text-primary break-words">
                      {post.hashtags}
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-16 p-6 bg-muted/50 rounded-lg max-w-4xl mx-auto">
          <h3 className="font-semibold mb-3">📱 Posting Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Best times to post: 6-9 AM, 12-2 PM, or 7-9 PM (your audience's timezone)</li>
            <li>• Space posts 1-2 days apart for best engagement</li>
            <li>• Add to your Story after posting for extra visibility</li>
            <li>• Engage with comments in the first hour to boost algorithm</li>
            <li>• Consider adding a call-to-action in your bio link</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstagramPosts;

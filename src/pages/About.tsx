import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Heart, Users, Award, Cross, BookOpen } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="section-label">Our Mission</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
                Steward Your Body for <span className="text-accent">God's Glory</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fortivus exists to help Christian men over 40 honor God by treating their bodies 
                as temples of the Holy Spirit—through science-backed training, biblical wisdom, 
                and a brotherhood of accountability.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 text-center">
                The Origin
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p>
                  In 2020, our founder hit a wall. At 45, despite years of fitness experience, 
                  he found that the programs designed for younger men no longer worked. 
                  Recovery took longer. Energy fluctuated. The generic advice felt hollow.
                </p>
                <p>
                  But more than that, he realized something deeper was missing: purpose. 
                  Why was he training? For vanity? For ego? He began studying Scripture's 
                  perspective on the body—and everything changed.
                </p>
                <p>
                  "Your body is a temple of the Holy Spirit" (1 Corinthians 6:19) became 
                  his foundation. He realized that physical stewardship wasn't optional for 
                  the Christian man—it was a calling. To serve his family. To have energy 
                  for ministry. To be strong enough to help others.
                </p>
                <p>
                  Working with Christian fitness experts, nutritionists, and coaches who 
                  specialize in men's health after 40, Fortivus emerged as the platform 
                  for men who understand that honoring God includes honoring the body He gave us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scripture Foundation */}
        <section className="section-padding bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
                Rooted in Scripture
              </h2>
              <div className="space-y-8">
                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-accent pl-6 text-left">
                  "Do you not know that your bodies are temples of the Holy Spirit, who is in you, 
                  whom you have received from God? You are not your own; you were bought at a price. 
                  Therefore honor God with your bodies."
                  <footer className="mt-2 text-sm font-medium text-foreground not-italic">
                    — 1 Corinthians 6:19-20
                  </footer>
                </blockquote>
                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-accent pl-6 text-left">
                  "For physical training is of some value, but godliness has value for all things, 
                  holding promise for both the present life and the life to come."
                  <footer className="mt-2 text-sm font-medium text-foreground not-italic">
                    — 1 Timothy 4:8
                  </footer>
                </blockquote>
                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-accent pl-6 text-left">
                  "I discipline my body and keep it under control, lest after preaching to others 
                  I myself should be disqualified."
                  <footer className="mt-2 text-sm font-medium text-foreground not-italic">
                    — 1 Corinthians 9:27
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="section-header">
              <span className="section-label">Our Values</span>
              <h2 className="section-title">
                Guiding Principles
              </h2>
              <p className="section-description">
                These values shape everything we do at Fortivus.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Cross,
                  title: "Faith First",
                  description: "Everything we do is grounded in biblical truth. We train for God's glory, not our own."
                },
                {
                  icon: Heart,
                  title: "Stewardship",
                  description: "Your body is a gift. We help you care for it wisely—for longevity, not vanity."
                },
                {
                  icon: Users,
                  title: "Brotherhood",
                  description: "Iron sharpens iron. Join thousands of Christian men pursuing strength together."
                },
                {
                  icon: Award,
                  title: "Excellence",
                  description: "Whatever you do, work at it with all your heart, as working for the Lord."
                }
              ].map((value, index) => (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 text-center">
                Our Philosophy
              </h2>
              <div className="space-y-8">
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-lg font-semibold mb-2">Train Wisely, Not Just Harder</h3>
                  <p className="text-muted-foreground">
                    Intensity matters, but so does wisdom. Our programs account for 
                    recovery needs, joint health, and hormonal optimization unique to men 
                    over 40. We train smart to serve long.
                  </p>
                </div>
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-lg font-semibold mb-2">Purpose Over Performance</h3>
                  <p className="text-muted-foreground">
                    We're not training to impress others. We're training to have energy 
                    for our families, strength for ministry, and vitality to serve God's 
                    purposes for our lives.
                  </p>
                </div>
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-lg font-semibold mb-2">Technology as a Tool</h3>
                  <p className="text-muted-foreground">
                    Our AI-powered analysis and tracking tools give you insights that were 
                    previously available only to elite athletes—all in service of your 
                    stewardship calling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-foreground text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
              Ready to Begin?
            </h2>
            <p className="text-background/70 mb-8 max-w-xl mx-auto">
              Join a brotherhood of Christian men stewarding their strength for God's glory.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/auth">Start Your Journey</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
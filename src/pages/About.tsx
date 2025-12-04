import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Heart, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="section-label">Our Story</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-6">
                Built for Men Who <span className="text-accent">Refuse to Settle</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fortivus was born from a simple belief: age is not a barrier to peak performance. 
                We exist to help men over 40 unlock their full potential through science-backed 
                training, precision nutrition, and cutting-edge technology.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Story */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-8 text-center">
                The Origin
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p>
                  In 2020, our founder hit a wall. At 45, despite years of fitness experience, 
                  he found that the programs designed for 20-somethings no longer worked. 
                  Recovery took longer. Energy fluctuated. The generic advice felt hollow.
                </p>
                <p>
                  He searched for a solution tailored to men navigating the unique challenges 
                  of midlife fitness—hormonal changes, busy schedules, accumulated wear on 
                  joints—and found nothing comprehensive.
                </p>
                <p>
                  So he built it. Working with endocrinologists, strength coaches, and 
                  nutritionists who specialize in male health after 40, Fortivus emerged 
                  as the definitive platform for men who understand that strength has no 
                  expiration date.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="section-padding bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="section-header">
              <span className="section-label">Our Mission</span>
              <h2 className="section-title">
                Redefining What's Possible
              </h2>
              <p className="section-description">
                We're on a mission to prove that your 40s, 50s, and beyond can be your 
                strongest, most vital decades.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Target,
                  title: "Precision",
                  description: "Every recommendation is backed by science and tailored to your unique physiology."
                },
                {
                  icon: Heart,
                  title: "Longevity",
                  description: "We optimize for sustainable health, not quick fixes that damage long-term potential."
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Join thousands of like-minded men supporting each other on this journey."
                },
                {
                  icon: Award,
                  title: "Excellence",
                  description: "We hold ourselves to the highest standards in everything we create."
                }
              ].map((value, index) => (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-8 text-center">
                Our Philosophy
              </h2>
              <div className="space-y-8">
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-lg font-medium mb-2">Train Smarter, Not Just Harder</h3>
                  <p className="text-muted-foreground">
                    Intensity matters, but so does intelligence. Our programs account for 
                    recovery needs, joint health, and hormonal optimization unique to men 
                    over 40.
                  </p>
                </div>
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-lg font-medium mb-2">Nutrition as Medicine</h3>
                  <p className="text-muted-foreground">
                    What you eat directly impacts testosterone, energy, and body composition. 
                    We provide evidence-based nutrition protocols that work with your biology, 
                    not against it.
                  </p>
                </div>
                <div className="border-l-2 border-accent pl-6">
                  <h3 className="text-lg font-medium mb-2">Technology as a Tool</h3>
                  <p className="text-muted-foreground">
                    Our AI-powered analysis and tracking tools give you insights that were 
                    previously available only to elite athletes with personal teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-foreground text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">
              Ready to Transform?
            </h2>
            <p className="text-background/70 mb-8 max-w-xl mx-auto">
              Join the Fortivus community and discover what you're truly capable of.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/auth">Get Started Today</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

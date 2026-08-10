import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Pillars from "@/components/Pillars";
import StatsCounter from "@/components/StatsCounter";
import AIAnalysis from "@/components/AIAnalysis";
import FeaturesShowcase from "@/components/FeaturesShowcase";
import SuccessStories from "@/components/SuccessStories";
import Pricing from "@/components/Pricing";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import TestimonySpotlight from "@/components/TestimonySpotlight";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Pillars />
        <StatsCounter />
        <AIAnalysis />

        <FeaturesShowcase />
        <Pricing />
        <TestimonySpotlight />
        <SuccessStories />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

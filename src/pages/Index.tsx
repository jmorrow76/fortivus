import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import AIAnalysis from "@/components/AIAnalysis";
import FeaturesShowcase from "@/components/FeaturesShowcase";
import SuccessStories from "@/components/SuccessStories";
import Pricing from "@/components/Pricing";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <StatsCounter />
        <AIAnalysis />
        <FeaturesShowcase />
        <Pricing />
        <SuccessStories />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

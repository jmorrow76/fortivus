import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import AIAnalysis from "@/components/AIAnalysis";
import SuccessStories from "@/components/SuccessStories";
import Articles from "@/components/Articles";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
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
        <Pricing />
        <SuccessStories />
        <Articles />
        <Newsletter />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

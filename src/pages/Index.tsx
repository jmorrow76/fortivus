import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";

import Supplements from "@/components/Supplements";
import AIAnalysis from "@/components/AIAnalysis";
import BodyAnalysis from "@/components/BodyAnalysis";
import SuccessStories from "@/components/SuccessStories";

import Gear from "@/components/Gear";
import Articles from "@/components/Articles";
import TestimonialCarousel from "@/components/TestimonialCarousel";
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
        <BodyAnalysis />
        <SuccessStories />
        <Articles />
        <TestimonialCarousel />
        
        {/* Partner Products Section */}
        <div className="bg-secondary/20">
          <div className="container mx-auto px-4 pt-16 md:pt-24">
            <div className="section-header">
              <span className="section-label">Curated For You</span>
              <h2 className="section-title">Partner Products</h2>
              <p className="section-description">
                Handpicked supplements and gear from brands we trust, designed specifically for men over 40.
              </p>
            </div>
          </div>
          <Supplements />
          <Gear />
        </div>
        <Pricing />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

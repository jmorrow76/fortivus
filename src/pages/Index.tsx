import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import Programs from "@/components/Programs";
import Supplements from "@/components/Supplements";
import AIAnalysis from "@/components/AIAnalysis";
import BodyAnalysis from "@/components/BodyAnalysis";
import SuccessStories from "@/components/SuccessStories";
import TransformationGallery from "@/components/TransformationGallery";
import Gear from "@/components/Gear";
import Articles from "@/components/Articles";
import TestimonialCarousel from "@/components/TestimonialCarousel";
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
        <Programs />
        <Supplements />
        <AIAnalysis />
        <BodyAnalysis />
        <SuccessStories />
        <TransformationGallery />
        <Gear />
        <Articles />
        <TestimonialCarousel />
        <Pricing />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

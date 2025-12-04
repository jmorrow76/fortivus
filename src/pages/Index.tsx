import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import Supplements from "@/components/Supplements";
import AIAnalysis from "@/components/AIAnalysis";
import BodyAnalysis from "@/components/BodyAnalysis";
import Gear from "@/components/Gear";
import Articles from "@/components/Articles";
import Pricing from "@/components/Pricing";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Programs />
        <Supplements />
        <AIAnalysis />
        <BodyAnalysis />
        <Gear />
        <Articles />
        <Pricing />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

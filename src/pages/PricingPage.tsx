import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;

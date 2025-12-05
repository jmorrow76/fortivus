import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GearComponent from "@/components/Gear";

const Gear = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Page Header */}
        <section className="py-8 md:py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Gear & Apparel</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Curated selection of premium performance apparel and training equipment from brands we trust.
            </p>
          </div>
        </section>
        
        <GearComponent />
      </main>
      <Footer />
    </div>
  );
};

export default Gear;

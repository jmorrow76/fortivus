import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Articles from "@/components/Articles";

const KnowledgeHub = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-44 md:pt-28">
        <Articles />
      </main>
      <Footer />
    </div>
  );
};

export default KnowledgeHub;

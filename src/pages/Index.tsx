import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import PredictionMarkets from "@/components/PredictionMarkets";
import NodesSection from "@/components/NodesSection";

import WhyAckinax from "@/components/WhyAckinax";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services />
      <PredictionMarkets />
      <NodesSection />
      <NetworkStats />
      <WhyAckinax />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;

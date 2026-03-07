import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { PricingSection } from '../components/PricingSection';
import { Footer } from '../components/Footer';
import { MarketingNav } from '../components/MarketingNav';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="home" />

      <HeroSection />

      <div id="features">
        <FeaturesSection />
      </div>

      <PricingSection />

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of clinics already using ClinicPro to streamline their operations
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => navigate('/signup')}
          >
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

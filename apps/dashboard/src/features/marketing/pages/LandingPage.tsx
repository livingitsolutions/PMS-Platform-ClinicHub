import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { PricingSection } from '../components/PricingSection';
import { Footer } from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">ClinicPro</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </a>
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Pricing
              </button>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

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

import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { PricingSection } from '../components/PricingSection';
import { TargetClinicsSection } from '../components/TargetClinicsSection';
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

      <TargetClinicsSection />

      <PricingSection />

      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white/10 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            Get Started Today
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            Start Managing Your Clinic<br />the Smart Way
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
            Join hundreds of clinics already using ClinicHub to deliver better patient care and run a more efficient practice.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 text-base font-semibold px-10 py-6 rounded-xl shadow-xl shadow-blue-900/30 transition-all duration-200"
            onClick={() => navigate('/signup')}
          >
            Create Your Clinic Account
          </Button>
          <p className="mt-5 text-sm text-blue-200">
            No credit card required &bull; Free 14-day trial &bull; Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

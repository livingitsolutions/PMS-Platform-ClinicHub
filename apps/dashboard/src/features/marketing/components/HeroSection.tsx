import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Modern Practice Management
            <span className="block text-blue-600 mt-2">Built for Healthcare</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your clinic operations with intelligent scheduling,
            automated billing, and comprehensive patient management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl transform rotate-1 opacity-20"></div>
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
                <div className="text-gray-600">Appointments Scheduled</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Clinics Managed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { PricingSection } from '../components/PricingSection';
import { Footer } from '../components/Footer';
import { MarketingNav } from '../components/MarketingNav';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav activePage="pricing" />

      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>

      <PricingSection />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards including Visa, MasterCard, and American Express.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Is there a setup fee?</h3>
              <p className="text-gray-600">
                No, there are no setup fees or hidden charges. You only pay the monthly subscription fee.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time with no penalties or cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    name: 'Starter',
    price: '$49',
    description: 'Perfect for small practices just getting started.',
    cta: 'Start Free Trial',
    features: [
      'Up to 2 providers',
      '500 appointments/month',
      'Basic reporting',
      'Email support',
      'Mobile access',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$149',
    description: 'The complete toolkit for growing clinics.',
    cta: 'Start Free Trial',
    features: [
      'Up to 10 providers',
      'Unlimited appointments',
      'Advanced analytics',
      'Priority support',
      'AI-powered notes',
      'Custom branding',
      'API access',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for large organizations.',
    cta: 'Contact Sales',
    features: [
      'Unlimited providers',
      'Unlimited appointments',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Training & onboarding',
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
            Pricing
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Choose the plan that fits your practice. Upgrade or downgrade anytime with no lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-200 ${
                plan.highlighted
                  ? 'border-blue-500 shadow-2xl shadow-blue-100 bg-white ring-1 ring-blue-500'
                  : 'border-gray-100 bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase shadow-sm">
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-blue-600' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-gray-900 leading-none">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-400 text-sm mb-1">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <svg
                        className={`w-3 h-3 ${plan.highlighted ? 'text-blue-600' : 'text-gray-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-xl py-5 text-sm font-semibold transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
                size="lg"
                onClick={() => navigate('/signup')}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          All plans include a 14-day free trial &bull; No credit card required &bull; Cancel anytime
        </p>
      </div>
    </section>
  );
}

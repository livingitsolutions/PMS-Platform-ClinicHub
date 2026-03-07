import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function PricingSection() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      description: 'Perfect for small practices',
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
      description: 'For growing clinics',
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
      description: 'For large organizations',
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your practice. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? 'border-blue-500 border-2 shadow-xl scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600 ml-2">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                  onClick={() => navigate('/signup')}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            All plans include 14-day free trial • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Check, Loader as Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClinicStore } from '@/store/clinic-store';
import { createCheckoutSession } from '../api/subscriptionApi';

interface Plan {
  id: string;
  name: string;
  price: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49',
    interval: 'month',
    features: [
      'Up to 100 patients',
      'Basic appointment scheduling',
      'Invoice management',
      'Email support',
      '1 clinic location',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '99',
    interval: 'month',
    popular: true,
    features: [
      'Unlimited patients',
      'Advanced scheduling',
      'Invoice & payment tracking',
      'Visit notes with AI',
      'Priority support',
      'Up to 3 clinic locations',
      'Custom procedures',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '199',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Unlimited clinic locations',
      'Multi-provider scheduling',
      'Advanced analytics',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
];

export function SelectPlanPage() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (!clinicId) {
      setError('No clinic selected');
      return;
    }

    setLoadingPlan(planId);
    setError(null);

    try {
      const { url } = await createCheckoutSession({
        clinicId,
        plan: planId,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/select-plan?subscription=canceled`,
      });

      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your clinic. Upgrade or downgrade at any time.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-blue-500 shadow-xl scale-105'
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="size-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-2">
                  Billed monthly
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={!!loadingPlan}
                  className={`w-full h-11 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}

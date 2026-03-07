export function FeaturesSection() {
  const features = [
    {
      title: 'Smart Scheduling',
      description: 'Intelligent appointment booking with automated conflict detection and provider availability management.',
      icon: '📅',
    },
    {
      title: 'Patient Management',
      description: 'Complete patient records with visit history, procedures, and secure document storage.',
      icon: '👥',
    },
    {
      title: 'Automated Billing',
      description: 'Generate invoices automatically, track payments, and manage outstanding balances effortlessly.',
      icon: '💳',
    },
    {
      title: 'AI-Powered Notes',
      description: 'Generate comprehensive visit notes using AI to save time and improve documentation quality.',
      icon: '🤖',
    },
    {
      title: 'Real-time Notifications',
      description: 'Keep your team informed with instant notifications for appointments, payments, and updates.',
      icon: '🔔',
    },
    {
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with role-based access control and comprehensive audit logging.',
      icon: '🔒',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Clinic
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for modern healthcare practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

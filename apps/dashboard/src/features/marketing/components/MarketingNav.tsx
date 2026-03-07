import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type Props = {
  activePage?: 'home' | 'pricing' | 'demo' | 'docs';
};

export function MarketingNav({ activePage }: Props) {
  const navigate = useNavigate();

  const links: { label: string; page: Props['activePage']; path: string }[] = [
    { label: 'Features', page: 'home', path: '/#features' },
    { label: 'Demo', page: 'demo', path: '/demo' },
    { label: 'Docs', page: 'docs', path: '/docs' },
    { label: 'Pricing', page: 'pricing', path: '/pricing' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            ClinicPro
          </button>

          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium transition-colors ${
                  activePage === link.page
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/signup')}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

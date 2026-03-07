import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-2xl font-bold mb-4">ClinicPro</h3>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              Modern practice management software designed to help healthcare
              providers focus on what matters most - patient care.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/demo')}
                  className="hover:text-white transition-colors"
                >
                  Demo
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/docs')}
                  className="hover:text-white transition-colors"
                >
                  Docs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pricing')}
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/signup')}
                  className="hover:text-white transition-colors"
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} ClinicPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

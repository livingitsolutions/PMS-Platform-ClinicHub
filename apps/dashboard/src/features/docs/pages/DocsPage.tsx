import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Footer } from '@/features/marketing/components/Footer';
import { MarketingNav } from '@/features/marketing/components/MarketingNav';
import { DOCS } from '../data/docsContent';
import { BookOpen, ChevronRight, Search } from 'lucide-react';

export function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(DOCS[0].id);
  const [activeArticle, setActiveArticle] = useState(DOCS[0].articles[0].id);
  const [search, setSearch] = useState('');

  const section = DOCS.find((s) => s.id === activeSection)!;
  const article = section.articles.find((a) => a.id === activeArticle) ?? section.articles[0];

  const filteredDocs = search
    ? DOCS.flatMap((s) =>
        s.articles
          .filter(
            (a) =>
              a.title.toLowerCase().includes(search.toLowerCase()) ||
              s.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((a) => ({ section: s, article: a }))
      )
    : [];

  function handleSearchSelect(sectionId: string, articleId: string) {
    setActiveSection(sectionId);
    setActiveArticle(articleId);
    setSearch('');
  }

  function handleSectionClick(sectionId: string) {
    const s = DOCS.find((d) => d.id === sectionId)!;
    setActiveSection(sectionId);
    setActiveArticle(s.articles[0].id);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MarketingNav activePage="docs" />

      <div className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <BookOpen className="size-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">ClinicHub Docs</h1>
          <p className="text-gray-400 text-lg mb-6">
            Everything you need to get the most out of ClinicHub.
          </p>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            {search && filteredDocs.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                {filteredDocs.map(({ section: s, article: a }) => (
                  <button
                    key={`${s.id}-${a.id}`}
                    onClick={() => handleSearchSelect(s.id, a.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="text-xs text-gray-400 mb-0.5">{s.title}</div>
                    <div className="text-sm font-medium text-gray-900">{a.title}</div>
                  </button>
                ))}
              </div>
            )}
            {search && filteredDocs.length === 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 px-4 py-3 text-sm text-gray-500">
                No results for "{search}"
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-60 flex-shrink-0">
            <nav className="space-y-1 lg:sticky lg:top-24">
              {DOCS.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => handleSectionClick(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="size-4 flex-shrink-0" />
                      {s.title}
                    </button>
                    {isActive && (
                      <div className="ml-6 mt-1 space-y-0.5 pb-1">
                        {s.articles.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setActiveArticle(a.id)}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                              activeArticle === a.id
                                ? 'text-blue-700 font-semibold bg-blue-50/60'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            {a.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
              <span>{section.title}</span>
              <ChevronRight className="size-3" />
              <span className="text-gray-600 font-medium">{article.title}</span>
            </div>

            <Card className="p-8 shadow-sm border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h2>
              <div className="h-1 w-10 bg-blue-600 rounded mb-7" />
              <div>{article.content}</div>
            </Card>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Was this helpful?{' '}
                <button className="text-blue-600 hover:underline ml-1">Yes</button>
                {' / '}
                <button className="text-blue-600 hover:underline">No</button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.articles
                .filter((a) => a.id !== article.id)
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveArticle(a.id)}
                    className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="text-xs text-gray-400 mb-1">{section.title}</div>
                    <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700 flex items-center gap-1">
                      {a.title}
                      <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

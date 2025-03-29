import React, { useState, useEffect } from 'react';
import {
  Search,
  Smartphone,
  Gamepad2,
  Download,
  Star,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { searchApps } from './lib/api';
import type { AppDetails } from './types/app';

// Define the content locker window interface
interface ContentLockerWindow extends Window {
  contentlocker?: {
    show: () => void;
  };
}

const categories = [
  "All",
  "Games",
  "Social",
  "Entertainment",
  "Productivity",
  "Tools",
  "Education",
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [apps, setApps] = useState<AppDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const appsPerPage = 12;

  // Content Locker Integration with proper typing
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://installchecker.com/cl/i/5kqem1';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await searchApps({
          query: searchQuery,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          page: currentPage,
          perPage: appsPerPage,
        });
        setApps(response.apps);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching apps:', error);
        setError('Failed to load apps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [searchQuery, selectedCategory, currentPage]);

  const handleInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    const contentLocker = (window as ContentLockerWindow).contentlocker;
    if (contentLocker) {
      contentLocker.show();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Smartphone className="text-blue-600" size={24} aria-hidden="true" />
              <h1 className="text-2xl font-bold text-gray-900">APK Heaven</h1>
            </div>
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search apps and games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search apps and games"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" aria-hidden="true" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select category"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64" role="status" aria-label="Loading apps">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <>
            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {apps.map(app => (
                <div
                  key={app.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={handleInteraction}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleInteraction(e as any)}
                  aria-label={`View details for ${app.name}`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={app.icon}
                        alt={`${app.name} icon`}
                        className="w-16 h-16 rounded-2xl object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          {app.name}
                        </h2>
                        <p className="text-sm text-gray-500">{app.developer.name}</p>
                        <div className="flex items-center mt-1">
                          <Star className="text-yellow-400" size={16} aria-hidden="true" />
                          <span className="ml-1 text-sm text-gray-600">{app.rating.toFixed(1)}</span>
                          <span className="mx-1 text-gray-400" aria-hidden="true">•</span>
                          <span className="text-sm text-gray-600">{app.reviews.toLocaleString()} reviews</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {app.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {app.category}
                      </span>
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleInteraction}
                        aria-label={`Install ${app.name}`}
                      >
                        <Download size={16} className="mr-2" aria-hidden="true" />
                        Install
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{app.size}</span>
                      <span>{app.installs} installs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2" role="navigation" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-400">
            <p>© 2024 APK Heaven. All rights reserved.</p>
            <p className="mt-2">
              All app data and images are property of their respective owners.
              This platform is for informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
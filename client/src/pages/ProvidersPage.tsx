import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Filter, Sparkles, CheckCircle2, SlidersHorizontal, 
  Star, Shield, Briefcase, RefreshCw, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProviderCard } from '../components/ProviderCard';
import { rankProvidersWithAI } from '../utils/aiRecommendationEngine';
import { parseNaturalLanguageQuery } from '../utils/nlpParser';

export const ProvidersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { providers, categories, setIsAiModalOpen } = useApp();
  const marketplaceProviders = useMemo(
    () => providers.filter((provider) => provider.verificationStatus === 'VERIFIED' && !provider.isDemo),
    [providers]
  );

  const queryQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialService = searchParams.get('service') || '';
  const [searchQuery, setSearchQuery] = useState(queryQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedService, setSelectedService] = useState(initialService);
  const [maxBudget, setMaxBudget] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [availableTodayOnly, setAvailableTodayOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_low' | 'price_high' | 'experience'>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse natural language if present
  const parsed = useMemo(() => {
    if (searchQuery.trim().length > 3) {
      return parseNaturalLanguageQuery(searchQuery);
    }
    return null;
  }, [searchQuery]);

  // Rank with AI
  const rankedResults = useMemo(() => {
    const catToUse = selectedCategory || parsed?.category || '';
    const srvToUse = selectedService || parsed?.service || '';

    let ranked = rankProvidersWithAI(marketplaceProviders, catToUse, srvToUse, '', maxBudget, availableTodayOnly);

    // Apply manual filters
    ranked = ranked.filter(({ provider }) => {
      if (catToUse && !provider.category.toLowerCase().includes(catToUse.toLowerCase())) return false;
      if (srvToUse) {
        const serviceQuery = srvToUse.toLowerCase();
        const offersService = [...provider.servicesOffered, ...provider.skills]
          .some((service) => service.toLowerCase().includes(serviceQuery));
        if (!offersService) return false;
      }
      if (verifiedOnly && provider.verificationStatus !== 'VERIFIED') return false;
      if (provider.rating < minRating) return false;
      if (maxBudget && provider.startingPrice > maxBudget) return false;
      return true;
    });

    // Apply sorting
    if (sortBy === 'rating') {
      ranked.sort((a, b) => b.provider.rating - a.provider.rating);
    } else if (sortBy === 'price_low') {
      ranked.sort((a, b) => a.provider.startingPrice - b.provider.startingPrice);
    } else if (sortBy === 'price_high') {
      ranked.sort((a, b) => b.provider.startingPrice - a.provider.startingPrice);
    } else if (sortBy === 'experience') {
      ranked.sort((a, b) => b.provider.experienceYears - a.provider.experienceYears);
    }

    return ranked;
  }, [marketplaceProviders, selectedCategory, selectedService, maxBudget, minRating, verifiedOnly, availableTodayOnly, sortBy, parsed]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedService('');
    setMaxBudget(100000);
    setMinRating(0);
    setVerifiedOnly(false);
    setAvailableTodayOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              AI Smart Search Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Verified Professional Marketplace
            </h1>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-purple-600/20 transition self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Use Vistara AI Voice / Text Assistant</span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a service or describe what you need (e.g. 'Class 10 maths tutor' or 'My AC is not cooling')..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        {/* NLP Parsing Chip Banner */}
        {parsed && (parsed.category || parsed.service) && (
          <div className="bg-blue-950/80 border border-blue-700/60 p-3 rounded-xl flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                AI Intent Detected: <b>{parsed.service || parsed.category}</b>
              </span>
            </div>
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS SIDEBAR */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Search Filters</span>
            </div>
            <button onClick={handleResetFilters} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Primary Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Primary Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedService('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">All 5 Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Max Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Max Budget</span>
              <span className="font-extrabold text-blue-600">₹{maxBudget}</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Minimum Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Min Rating</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[4.0, 4.5, 4.8].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                    minRating === r ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ★ {r}+
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Professionals Only
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={availableTodayOnly}
                onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
              <span>Available Today</span>
            </label>
          </div>

        </div>

        {/* RESULTS GRID & CONTROLS */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="font-semibold text-slate-700">
              Showing <span className="font-extrabold text-slate-900">{rankedResults.length}</span> professionals
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="recommended">AI Recommendation Match</option>
                <option value="rating">Highest Rated ★</option>
                <option value="price_low">Lowest Price ₹</option>
                <option value="price_high">Highest Price ₹</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {rankedResults.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">No Professionals Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {selectedService
                  ? `There are currently no approved professionals listed for ${selectedService}. Send a request and our team can follow up.`
                  : 'Try loosening your filters or budget range to view available service experts.'}
              </p>
              {selectedService && (
                <Link
                  to={`/contact?request=professional&service=${encodeURIComponent(selectedService)}`}
                  className="inline-flex rounded-xl bg-emerald-800 px-5 py-3 text-xs font-bold text-white shadow hover:bg-emerald-900"
                >
                  Request this service
                </Link>
              )}
              <button
                onClick={handleResetFilters}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rankedResults.map(({ provider, recommendation }) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  recommendation={recommendation}
                  selectedService={selectedService || parsed?.service || ''}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

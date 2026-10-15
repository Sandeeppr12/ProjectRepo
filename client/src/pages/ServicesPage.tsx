import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, Activity, Code, Wrench, PartyPopper, 
  Clock, CheckCircle2, ArrowRight, HeartPulse, Shield 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProviderCard } from '../components/ProviderCard';

const CATEGORY_ICONS: Record<string, any> = {
  education: GraduationCap,
  healthcare: Activity,
  'digital-marketing-it': Code,
  'home-services': Wrench,
  'event-management': PartyPopper
};

export const ServicesPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { categories, services, providers } = useApp();

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(categorySlug || 'education');

  useEffect(() => {
    if (categorySlug) {
      setActiveCategorySlug(categorySlug);
    }
  }, [categorySlug]);

  const activeCategory = categories.find(c => c.slug === activeCategorySlug) || categories[0];
  const marketplaceProviders = useMemo(
    () => providers.filter((provider) => provider.verificationStatus === 'VERIFIED' && !provider.isDemo),
    [providers]
  );
  if (!activeCategory) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Services are being set up</h1>
        <p className="mt-3 text-sm text-slate-600">
          The service catalog is temporarily unavailable. Please try again shortly.
        </p>
        <Link to="/" className="inline-flex mt-6 text-sm font-semibold text-blue-700 hover:text-blue-800">
          Return to home
        </Link>
      </div>
    );
  }

  const categoryServices = services.filter(s => s.categoryName.toUpperCase() === activeCategory.name.toUpperCase());
  const categoryProviders = marketplaceProviders.filter(p => p.category.toUpperCase() === activeCategory.name.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          Marketplace Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Services Catalog
        </h1>
        <p className="text-sm text-slate-600">
          Browse specialized services across our 5 primary sectors and explore professional listings.
        </p>
      </div>

      {/* 5 Primary Category Navigation Tabs */}
      <div className="flex justify-center border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
        {categories.map((cat) => {
          const IconComp = CATEGORY_ICONS[cat.slug] || GraduationCap;
          const isActive = cat.slug === activeCategorySlug;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategorySlug(cat.slug);
                navigate(`/services/${cat.slug}`, { replace: true });
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition shrink-0 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-600/40 border border-blue-400/40 text-blue-200 px-3 py-1 rounded-lg text-xs font-semibold">
            <span>Primary Category 0{categories.findIndex(c => c.slug === activeCategorySlug) + 1}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">{activeCategory.name}</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {activeCategory.description}
          </p>
          <div className="pt-2 flex items-center space-x-4 text-xs font-medium text-slate-300">
            <span>✓ {categoryServices.length} Services Listed</span>
            <span>•</span>
            <span>✓ {categoryProviders.length} Professionals Listed</span>
          </div>
        </div>
      </div>

      {/* HEALTHCARE SPECIAL DISCLAIMER BANNER (Mandatory) */}
      {activeCategory.name === 'HEALTHCARE' && (
        <div className="bg-emerald-950/80 border-2 border-emerald-600/40 rounded-2xl p-5 text-emerald-100 flex items-start space-x-4 shadow-md">
          <HeartPulse className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-sm text-emerald-300 block">Professional Healthcare Disclaimer:</span>
            <p className="leading-relaxed">
              Healthcare services on DIGITAL VISTARA (home nursing, physiotherapy, patient care, and lab sample collection) are provided by independent certified healthcare professionals for home assistance. DIGITAL VISTARA is not a hospital and does not replace emergency medical diagnosis or hospital critical care. For life-threatening emergencies, please immediately contact emergency services (108/112) or visit the nearest hospital.
            </p>
          </div>
        </div>
      )}

      {/* Services List Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
          <span>Available {activeCategory.name} Services</span>
          <span className="text-xs text-slate-500 font-normal">{categoryServices.length} total services</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryServices.map((srv) => (
            <div 
              key={srv.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
                {srv.popular && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Popular
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{srv.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{srv.description}</p>

                  <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {srv.estimatedDuration}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      Starting ₹{srv.priceStartingFrom} <span className="text-[10px] text-slate-400 font-normal">/{srv.unit}</span>
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1 text-[11px] text-slate-600">
                    {srv.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={`/providers?category=${encodeURIComponent(activeCategory.name)}&service=${encodeURIComponent(srv.name)}`}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow"
                >
                  <span>Choose an expert &amp; book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Professionals in this Category */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">
          Professionals Listed in {activeCategory.name}
        </h3>

        {categoryProviders.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-100 p-4 rounded-xl text-center">
            No specific providers listed in this filter view yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProviders.map(p => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

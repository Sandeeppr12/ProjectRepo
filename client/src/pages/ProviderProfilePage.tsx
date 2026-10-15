import React, { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Star, MapPin, Briefcase, Clock, Calendar, 
  MessageSquare, ShieldCheck, Award, Image as ImageIcon, Heart, ArrowRight, BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';

export const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { providers, services, reviews, favorites, toggleFavorite } = useApp();
  const marketplaceProviders = useMemo(
    () => providers.filter((provider) => provider.verificationStatus === 'VERIFIED' && !provider.isDemo),
    [providers]
  );

  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'portfolio' | 'reviews' | 'availability'>('about');

  const provider = marketplaceProviders.find(p => p.id === id);
  if (!provider) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Professional unavailable</h1>
        <p className="mt-3 text-sm text-slate-600">This profile is not currently approved for the marketplace.</p>
        <Link to="/providers" className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white">
          Browse approved professionals
        </Link>
      </div>
    );
  }
  const providerReviews = reviews.filter(r => r.providerId === provider.id);
  const isFav = favorites.includes(provider.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="relative">
              <UserAvatar src={provider.avatar} name={provider.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-slate-100 shadow-md" />
              {provider.availableToday && (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{provider.name}</h1>
                {provider.verificationStatus === 'VERIFIED' && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Professional</span>
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-blue-600">{provider.category}</p>

              {/* Rating & Reviews Bar */}
              <div className="flex items-center space-x-3 text-xs sm:text-sm pt-1">
                <div className="flex items-center font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-500">({provider.reviewCount} Reviews)</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-medium">{provider.completedJobs}+ Jobs Completed</span>
              </div>

              {/* Meta Tags */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{provider.experienceYears} Years Exp.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{provider.city} ({provider.serviceArea})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Avg Response: {provider.responseTimeMinutes} Mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Actions */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shrink-0 md:w-64">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Starting Rate</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                ₹{provider.startingPrice} <span className="text-xs text-slate-500 font-normal">/ {services.find((service) => service.name === provider.servicesOffered[0])?.unit || 'service'}</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium block mt-1">✓ Upfront transparent pricing</span>
            </div>

            <div className="space-y-2">
              {provider.isDemo ? (
                <Link
                  to={`/contact?${new URLSearchParams({
                    request: 'professional',
                    service: provider.servicesOffered[0] || '',
                    profile: provider.name
                  }).toString()}`}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-700 bg-blue-700 px-4 py-3 text-center text-sm font-extrabold !text-white shadow-lg shadow-blue-600/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-800 hover:bg-blue-800 hover:shadow-xl active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                  style={{ color: '#fff' }}
                >
                  <span>Request Booking</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              ) : (
                <button
                  onClick={() => navigate(`/book/${provider.id}?service=${encodeURIComponent(provider.servicesOffered[0] || '')}`)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-1.5"
                >
                  <span>Book Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {!provider.isDemo && <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/customer/messages`)}
                  className="flex-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => toggleFavorite(provider.id)}
                  className={`p-2 rounded-xl border transition ${isFav ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-300 text-slate-400 hover:text-rose-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>
              </div>}
            </div>
          </div>

        </div>

      </div>

      {/* Profile Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 sm:gap-6 text-sm font-semibold">
        {(['about', 'services', 'portfolio', 'reviews', 'availability'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 transition capitalize ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'about' ? 'About & Bio' :
             tab === 'services' ? 'Services & Rates' :
             tab === 'portfolio' ? `Portfolio (${provider.portfolio.length})` :
             tab === 'reviews' ? `Reviews (${provider.reviewCount})` : 'Availability'}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Professional Bio</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{provider.bio}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Qualification & Degree</h4>
                <p className="text-sm font-semibold text-slate-800">{provider.qualification}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Radius</h4>
                <p className="text-sm font-semibold text-slate-800">Up to {provider.maxRadiusKm} km in {provider.city}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Skills & Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((sk, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-lg">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 mb-4">Offered Services & Pricing</h3>
            <div className="divide-y divide-slate-100">
              {provider.servicesOffered.map((srv, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{srv}</h4>
                    <p className="text-xs text-slate-500">Provided by {provider.name} in {provider.city}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 text-sm">Starting ₹{provider.startingPrice}</span>
                    {provider.isDemo ? (
                      <span className="mt-1 block text-[10px] font-semibold text-amber-800">Sample rate · booking disabled</span>
                    ) : (
                      <button
                        onClick={() => navigate(`/book/${provider.id}?service=${encodeURIComponent(srv)}`)}
                        className="block mt-1 text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Book Now →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900">Work Portfolio & Projects</h3>
            {provider.portfolio.length === 0 ? (
              <p className="text-xs text-slate-500">No portfolio images uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {provider.portfolio.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="p-4 space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Verified Customer Reviews</h3>
              <div className="text-xs text-slate-500">
                Only customers with completed bookings can submit reviews.
              </div>
            </div>

            {providerReviews.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl text-center">
                No reviews recorded for this professional yet.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {providerReviews.map(r => (
                  <div key={r.id} className="pt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{r.customerName}</span>
                        <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold">★ {r.rating}</span>
                      </div>
                      <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AVAILABILITY TAB */}
        {activeTab === 'availability' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Weekly Schedule & Working Days</h3>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const isAvail = provider.availabilityDays.includes(day);
                return (
                  <div 
                    key={day} 
                    className={`p-3 rounded-xl border font-bold ${
                      isAvail ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <div>{day}</div>
                    <div className="text-[10px] mt-1 font-normal">{isAvail ? 'Available' : 'Off'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

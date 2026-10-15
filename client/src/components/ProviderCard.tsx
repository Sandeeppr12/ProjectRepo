import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Star, MapPin, Briefcase, Clock, Heart, 
  Sparkles, Calendar, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Provider, AIRecommendationReason } from '../types';
import { useApp } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';

interface ProviderCardProps {
  provider: Provider;
  recommendation?: AIRecommendationReason;
  selectedService?: string;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, recommendation, selectedService = '' }) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(provider.id);

  return (
    <div className="market-provider-card bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between group">
      
      {/* Top Header: Avatar, Name, Verification, Favorite */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex space-x-3.5">
            <div className="relative">
              <UserAvatar src={provider.avatar} name={provider.name} className="w-16 h-16 rounded-2xl border-2 border-slate-100 shadow" />
              {provider.availableToday && (
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full title='Available Today'"></span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {provider.name}
                </h3>
                {provider.verificationStatus === 'VERIFIED' && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {provider.category}
              </p>

              {/* Rating & Reviews */}
              {provider.isDemo ? (
                <p className="mt-1.5 text-[11px] font-semibold text-amber-800">
                      Fictional sample · Not verified or available for hire
                </p>
              ) : (
                <div className="flex items-center space-x-2 mt-1.5 text-xs">
                <div className="flex items-center text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-400">({provider.reviewCount} reviews)</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{provider.completedJobs}+ jobs</span>
                </div>
              )}
            </div>
          </div>

          {!provider.isDemo && (
            <button
              onClick={() => toggleFavorite(provider.id)}
              className={`p-2 rounded-xl transition ${isFav ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400 hover:text-rose-500'}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* AI Recommendation Reason Badges */}
        {recommendation && recommendation.reasons.length > 0 && (
            <div className="mt-3 bg-emerald-50/80 border border-emerald-100 rounded-xl p-2.5">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Suggested match: {recommendation.score}%</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recommendation.reasons.map((r, i) => (
                <span key={i} className="text-[10px] bg-white text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{provider.experienceYears} Years Exp.</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{provider.city}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{provider.availableToday ? 'Available Today' : 'Scheduled Booking'}</span>
          </div>
          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
            <span>Starting ₹{provider.startingPrice}</span>
          </div>
        </div>

        {/* Services Chips */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {provider.servicesOffered.slice(0, 3).map((srv, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                {srv}
              </span>
            ))}
            {provider.servicesOffered.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium self-center">
                +{provider.servicesOffered.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-5 pt-3 border-t border-slate-100">
        <Link
          to={`/provider/${provider.id}${selectedService ? `?service=${encodeURIComponent(selectedService)}` : ''}`}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs text-center transition"
        >
          View Profile
        </Link>
        {provider.isDemo ? (
          <Link
            to={`/contact?${new URLSearchParams({
              request: 'professional',
              service: selectedService || provider.servicesOffered[0] || '',
              profile: provider.name
            }).toString()}`}
            className="group flex w-full items-center justify-center gap-1 rounded-xl border-2 border-emerald-800 bg-emerald-800 px-3 py-2 text-center text-xs font-bold !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-900 hover:bg-emerald-900 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
            style={{ color: '#fff' }}
          >
            <span>Request Booking</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        ) : (
          <button
            onClick={() => navigate(`/book/${provider.id}?service=${encodeURIComponent(selectedService)}`)}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center shadow transition flex items-center justify-center space-x-1"
          >
            <span>Book Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};

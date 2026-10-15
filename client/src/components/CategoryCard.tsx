import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Activity, Code, Wrench, PartyPopper, ArrowRight, ShieldCheck, Users 
} from 'lucide-react';
import { ServiceCategory } from '../types';

const ICON_MAP: Record<string, any> = {
  GraduationCap,
  Activity,
  Code,
  Wrench,
  PartyPopper
};

interface CategoryCardProps {
  category: ServiceCategory;
  providerCount?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, providerCount = 6 }) => {
  const IconComponent = ICON_MAP[category.iconName] || GraduationCap;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Image Accent */}
      <div className="h-32 w-full relative overflow-hidden bg-slate-900">
        <img 
          src={category.bannerImage} 
          alt={category.name}
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>
        
        {/* Icon Badge */}
        <div className="absolute bottom-3 left-4 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:bg-purple-600 transition-colors">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {category.name}
            </h3>
            <span className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
              <Users className="w-3 h-3" /> {providerCount}+ Verified Professionals
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {category.description}
        </p>

        {/* Popular sub-services tags */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Popular Services:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {category.popularServices.slice(0, 4).map((srv, idx) => (
              <span 
                key={idx}
                className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium group-hover:bg-blue-50 group-hover:text-blue-700 transition"
              >
                {srv}
              </span>
            ))}
          </div>
        </div>

        {/* Footer CTA Button */}
        <Link
          to={`/services/${category.slug}`}
          className="w-full mt-2 bg-slate-900 group-hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow"
        >
          <span>Explore {category.name}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

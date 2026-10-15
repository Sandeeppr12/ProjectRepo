import React from 'react';
import { HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-xs sm:text-sm">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Platform Help & FAQs</h1>
        <p className="text-slate-500">Comprehensive answers about DIGITAL VISTARA marketplace.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>What are the 5 primary service categories supported?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed pl-6">
            DIGITAL VISTARA is engineered exclusively around five primary sectors: 1. Education, 2. Healthcare, 3. Digital Marketing & IT, 4. Home Services, and 5. Event Management.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>How does the AI Recommendation Engine calculate provider ranks?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed pl-6">
            The AI engine evaluates 6 parameters: Service Match (25%), Rating Score (25%), Proximity & Distance (20%), Field Experience (15%), Pricing Alignment (10%), and Today's Availability (5%).
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>What is the Healthcare disclaimer policy?</span>
          </h3>
          <p className="text-slate-600 leading-relaxed pl-6">
            Healthcare services (home nursing, physiotherapy, patient care) are intended for non-emergency home assistance. The platform is not a hospital and does not replace emergency medical diagnosis or hospital critical care.
          </p>
        </div>
      </div>
    </div>
  );
};

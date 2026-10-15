import React from 'react';
import { X, Sparkles, Server, Database, Brain, ShieldCheck, CreditCard, Cpu, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VivaExplanationModal: React.FC = () => {
  const { isVivaModalOpen, setIsVivaModalOpen } = useApp();

  if (!isVivaModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                B.Tech CSE Major Project Architecture & AI Systems
              </h2>
              <p className="text-xs text-slate-300">Technical Breakdown for Viva Examination & Project Defense</p>
            </div>
          </div>

          <button 
            onClick={() => setIsVivaModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* Section 1: AI Recommendation Formula */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-base">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>1. AI Recommendation System Formula</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              The AI Recommendation Engine ranks professionals using a transparent 6-factor weighted multi-criteria decision model:
            </p>
            
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 font-mono text-xs text-emerald-400">
              Score = (0.25 × ServiceMatch) + (0.25 × RatingScore) + (0.20 × DistanceScore) + (0.15 × ExperienceScore) + (0.10 × PricingScore) + (0.05 × AvailabilityScore)
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="font-semibold text-blue-400">Service Match (25%)</span>
                <p className="text-[11px] text-slate-400">Semantic & skill tag matching</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="font-semibold text-emerald-400">Rating (25%)</span>
                <p className="text-[11px] text-slate-400">Normalized weighted average</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="font-semibold text-purple-400">Distance (20%)</span>
                <p className="text-[11px] text-slate-400">City & GPS proximity check</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="font-semibold text-amber-400">Experience (15%)</span>
                <p className="text-[11px] text-slate-400">Years in field & completed jobs</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="font-semibold text-rose-400">Pricing (10%)</span>
                <p className="text-[11px] text-slate-400">Budget alignment ratio</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="font-semibold text-cyan-400">Availability (5%)</span>
                <p className="text-[11px] text-slate-400">Available Today status</p>
              </div>
            </div>
          </div>

          {/* Section 2: Vistara AI Assistant (RAG & NLP) */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-base">
              <Brain className="w-5 h-5" />
              <span>2. Vistara AI Natural Language Assistant (RAG Pipeline)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              When a user asks questions like <i>"My AC is not cooling"</i> or <i>"Class 10 maths teacher"</i>, Vistara AI tokenizes the input, extracts domain keywords, maps intent to one of the 5 primary categories (Education, Healthcare, Digital Marketing & IT, Home Services, Event Management), and retrieves matched professionals with direct actionable chips.
            </p>
          </div>

          {/* Section 3: Tech Stack & System Architecture */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-base">
              <Layers className="w-5 h-5" />
              <span>3. Full-Stack Technology Stack</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                  <Server className="w-4 h-4 text-blue-400" /> Frontend Layer
                </div>
                <p className="text-slate-400">React.js 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6.</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                  <Database className="w-4 h-4 text-emerald-400" /> Backend & Database Layer
                </div>
                <p className="text-slate-400">Node.js, Express REST API, MongoDB Schemas, JWT Auth, Socket.io Real-time engine.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Security & Payment Architecture */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-base">
              <ShieldCheck className="w-5 h-5" />
              <span>4. Security, Verification & Payment Gateway Architecture</span>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li><b>Verification Workflow:</b> Provider documents (Aadhaar/License) undergo Admin audit before receiving <b>✓ Verified Professional</b> status. Verification documents are strictly protected from public API endpoints.</li>
              <li><b>Payment Ready Integration:</b> Razorpay Test Mode integration with transaction tracking (Booking ID, Payment ID, Platform Commission e.g. 10%, Provider Net Payout).</li>
              <li><b>Healthcare Safety Disclaimer:</b> Strict disclaimers preventing emergency medical claims in healthcare category.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">DIGITAL VISTARA • CSE Major Project Viva Defense Document</span>
          <button
            onClick={() => setIsVivaModalOpen(false)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold transition"
          >
            Close Viva Document
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Calendar, CreditCard, Star, ArrowRight, Sparkles } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          User Guide & Workflow
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How DIGITAL VISTARA Works</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Our two-sided marketplace seamlessly connects customer demand with verified Indian service professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customer Journey */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
            <span>Customer Booking Journey</span>
          </h2>
          <ol className="space-y-4 text-xs text-slate-700 list-decimal list-inside font-medium leading-relaxed">
            <li><b>Natural Language Search:</b> Query Vistara AI or type plain language requests like <i>"AC not cooling"</i>.</li>
            <li><b>AI Recommended Rankings:</b> Compare professionals based on rating, distance, experience, and pricing.</li>
            <li><b>Transparent Booking Wizard:</b> Select preferred date/time slot and delivery address in your city.</li>
            <li><b>Razorpay Payment:</b> Complete payment via UPI, Card or NetBanking with zero hidden charges.</li>
            <li><b>Live Timeline & Chat:</b> Track status updates (PENDING → ACCEPTED → ON THE WAY → COMPLETED) and chat in real-time.</li>
            <li><b>Rating & Review:</b> Submit verified feedback to maintain high marketplace standards.</li>
          </ol>
        </div>

        {/* Provider Journey */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-purple-600 border-b pb-2 flex items-center gap-2">
            <span>Service Provider Journey</span>
          </h2>
          <ol className="space-y-4 text-xs text-slate-700 list-decimal list-inside font-medium leading-relaxed">
            <li><b>Provider Registration:</b> Create professional profile with qualification, skills, and service radius.</li>
            <li><b>Verification Audit:</b> Upload ID proof & certifications for Admin approval to earn the <b>✓ Verified Professional</b> badge.</li>
            <li><b>Manage Pricing & Schedule:</b> Set starting prices, package details, and working days availability.</li>
            <li><b>Receive & Accept Bookings:</b> Get instant notification of new service requests and accept with 1-click.</li>
            <li><b>Perform Service & Chat:</b> Coordinate via direct messaging and update booking progress timeline.</li>
            <li><b>Direct Earnings Payout:</b> Receive net earnings directly (gross minus platform commission rate).</li>
          </ol>
        </div>

      </div>

    </div>
  );
};

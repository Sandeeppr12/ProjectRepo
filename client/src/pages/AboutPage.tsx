import React from 'react';
import { Building2, Shield, HeartPulse, Award, Users, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto text-white shadow-xl">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">About DIGITAL VISTARA</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto italic font-semibold">
          "One Platform. Every Essential Service."
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">Our Vision & Mission</h2>
        <p>
          DIGITAL VISTARA was built as a 4th-Year B.Tech CSE Major Project to demonstrate production-grade full-stack engineering, database scalability, multi-role access control, AI recommendation logic, real-time communication, and payment gateway integration.
        </p>
        <p>
          Unlike unorganized local directory platforms, DIGITAL VISTARA organizes essential services into strictly five core categories (Education, Healthcare, Digital Marketing & IT, Home Services, and Event Management), backed by background verification audit workflows and intelligent matching algorithms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <Shield className="w-6 h-6 text-blue-600 mb-1" />
            <div className="font-bold text-slate-900 text-sm">100% Verified</div>
            <p className="text-xs text-slate-500">Document audits for every professional.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <Award className="w-6 h-6 text-purple-600 mb-1" />
            <div className="font-bold text-slate-900 text-sm">AI Powered</div>
            <p className="text-xs text-slate-500">Natural language NLP + Multi-criteria scoring.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <HeartPulse className="w-6 h-6 text-emerald-600 mb-1" />
            <div className="font-bold text-slate-900 text-sm">Trusted Quality</div>
            <p className="text-xs text-slate-500">End-to-end booking timeline & complaint resolution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

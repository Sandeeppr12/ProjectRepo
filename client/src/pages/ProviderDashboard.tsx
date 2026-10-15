import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, DollarSign, Calendar, CheckCircle2, Clock, 
  Briefcase, Star, MessageSquare, ArrowRight, Upload, Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';

export const ProviderDashboard: React.FC = () => {
  const { currentUser, providers, bookings, updateBookingStatus, reviews } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'earnings' | 'services' | 'availability'>('bookings');

  // Match provider profile
  const provider = providers.find(p => p.email === currentUser?.email) || providers[0];
  const providerBookings = bookings.filter(b => b.providerId === provider.id || true);
  const activeBookings = providerBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const totalEarnings = providerBookings
    .filter(b => b.status === 'COMPLETED' || b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.providerEarnings, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <UserAvatar src={provider.avatar} name={provider.name} className="w-16 h-16 rounded-2xl border-2 border-emerald-500" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">{provider.name}</h1>
              {provider.verificationStatus === 'VERIFIED' ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Professional</span>
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Under Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">{provider.category} • {provider.city}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/provider/${provider.id}`}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition"
          >
            Preview Public Profile
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Net Earnings</span>
          <div className="text-2xl font-extrabold text-emerald-600">₹{totalEarnings.toFixed(0)}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Jobs</span>
          <div className="text-2xl font-extrabold text-blue-600">{activeBookings.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rating Score</span>
          <div className="text-2xl font-extrabold text-amber-500">★ {provider.rating.toFixed(1)}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
          <div className="text-2xl font-extrabold text-slate-900">{provider.completedJobs}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition ${activeTab === 'bookings' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Bookings Queue ({providerBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-3 border-b-2 transition ${activeTab === 'earnings' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Earnings & Commission
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition ${activeTab === 'services' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          My Services & Pricing
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`pb-3 border-b-2 transition ${activeTab === 'availability' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Availability Schedule
        </button>
      </div>

      {/* TAB 1: BOOKINGS QUEUE */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {providerBookings.map(b => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-base">{b.serviceName}</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Customer: <b>{b.customerName}</b> ({b.customerMobile})</div>
                  <div className="text-xs text-slate-400 mt-1">📍 Address: {b.address}, {b.city}</div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-emerald-600 text-base">Payout: ₹{b.providerEarnings}</div>
                  <div className="text-[10px] text-slate-400">Fee 10% deducted</div>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                {b.status === 'PENDING' && (
                  <button
                    onClick={() => updateBookingStatus(b.id, 'ACCEPTED', 'Accepted by provider')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg"
                  >
                    Accept Booking
                  </button>
                )}
                {b.status === 'ACCEPTED' && (
                  <button
                    onClick={() => updateBookingStatus(b.id, 'ON_THE_WAY', 'Provider is on the way')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg"
                  >
                    Mark On The Way
                  </button>
                )}
                {b.status === 'ON_THE_WAY' && (
                  <button
                    onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS', 'Service started')}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-3 rounded-lg"
                  >
                    Start Service
                  </button>
                )}
                {b.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateBookingStatus(b.id, 'COMPLETED', 'Service finished')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg"
                  >
                    Mark Completed
                  </button>
                )}

                <Link
                  to={`/provider/booking/${b.id}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Chat & Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: EARNINGS */}
      {activeTab === 'earnings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Net Payouts Ledger</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {providerBookings.map(b => (
              <div key={b.id} className="py-3 flex justify-between">
                <div>
                  <div className="font-bold text-slate-900">{b.serviceName} ({b.bookingCode})</div>
                  <div className="text-slate-400">{b.date} • Paid via {b.paymentMethod}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-extrabold text-emerald-600">+₹{b.providerEarnings}</div>
                  <div className="text-[10px] text-slate-400">Service ₹{b.totalAmount} - 10% Fee</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES & PRICING */}
      {activeTab === 'services' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Services Offered</h3>
          <div className="space-y-2">
            {provider.servicesOffered.map((s, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
                <span className="font-bold text-slate-800">{s}</span>
                <span className="font-bold text-blue-600">Starting ₹{provider.startingPrice}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AVAILABILITY */}
      {activeTab === 'availability' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Weekly Working Days</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className={`p-3 rounded-xl border font-bold ${
                provider.availabilityDays.includes(day) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 text-slate-400'
              }`}>
                {day}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

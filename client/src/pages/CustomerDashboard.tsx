import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Clock, CheckCircle2, Heart, 
  MapPin, MessageSquare, AlertCircle, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';

export const CustomerDashboard: React.FC = () => {
  const { currentUser, bookings, favorites, providers, complaints } = useApp();
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'complaints' | 'addresses'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const customerBookings = bookings.filter(b => b.customerId === currentUser?.id || true);
  const activeBookings = customerBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedBookings = customerBookings.filter(b => b.status === 'COMPLETED');
  const favProviders = providers.filter(p => favorites.includes(p.id)
    && p.verificationStatus === 'VERIFIED'
    && !p.isDemo);

  const filteredBookings = customerBookings.filter(b => {
    if (bookingFilter === 'ACTIVE') return b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
    if (bookingFilter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <UserAvatar src={currentUser?.avatar} name={currentUser?.name} className="w-16 h-16 rounded-2xl border-2 border-blue-500" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">Welcome back, {currentUser?.name}!</h1>
              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Customer</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{currentUser?.email} • {currentUser?.city}</p>
          </div>
        </div>

        <Link
          to="/services"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-lg shadow-blue-600/20 transition flex items-center space-x-1"
        >
          <span>Book New Service</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
          <div className="text-2xl font-extrabold text-slate-900">{customerBookings.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Services</span>
          <div className="text-2xl font-extrabold text-blue-600">{activeBookings.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-600">{completedBookings.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Favorites</span>
          <div className="text-2xl font-extrabold text-purple-600">{favProviders.length}</div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition ${activeTab === 'bookings' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          My Bookings ({customerBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 border-b-2 transition ${activeTab === 'favorites' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Saved Favorites ({favProviders.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 border-b-2 transition ${activeTab === 'complaints' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Support Tickets ({complaints.length})
        </button>
      </div>

      {/* TAB 1: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    bookingFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <UserAvatar src={b.providerAvatar} name={b.providerName} className="w-14 h-14 rounded-xl" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-base">{b.serviceName}</span>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Professional: <b>{b.providerName}</b></div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>📅 {b.date} ({b.timeSlot})</span>
                      <span>•</span>
                      <span>Total: ₹{b.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/customer/booking/${b.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1"
                >
                  <span>Track Booking & Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favProviders.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserAvatar src={p.avatar} name={p.name} className="w-12 h-12 rounded-xl" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category} • ★ {p.rating}</div>
                </div>
              </div>
              <Link to={`/provider/${p.id}`} className="text-xs text-blue-600 font-bold hover:underline">
                View Profile →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4 text-xs">
          {complaints.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-red-600">Ticket #{c.id} - {c.category}</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">{c.status}</span>
              </div>
              <p className="text-slate-700">{c.description}</p>
              {c.adminNotes && <div className="bg-slate-50 p-2 rounded text-slate-500">Admin Response: {c.adminNotes}</div>}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

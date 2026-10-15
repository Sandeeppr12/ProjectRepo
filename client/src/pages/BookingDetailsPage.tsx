import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, Clock, MapPin, Phone, Mail, Shield, MessageSquare, 
  Send, AlertTriangle, Star, Check, ArrowRight, User, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';
import { BookingStatus } from '../types';

const STATUS_STEPS: BookingStatus[] = [
  'PENDING', 'ACCEPTED', 'CONFIRMED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'
];

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    bookings, updateBookingStatus, currentUser, messages, sendMessage, 
    addReview, raiseComplaint 
  } = useApp();

  const booking = bookings.find(b => b.id === id) || bookings[0];
  const bookingMessages = messages.filter(m => m.bookingId === booking.id);

  const [chatInput, setChatInput] = useState('');

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('Quality Issue');
  const [complaintDesc, setComplaintDesc] = useState('');

  const currentStepIndex = STATUS_STEPS.indexOf(booking.status as BookingStatus);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(booking.id, chatInput);
    setChatInput('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview({
      bookingId: booking.id,
      providerId: booking.providerId,
      customerId: booking.customerId,
      customerName: booking.customerName,
      rating,
      qualityRating: rating,
      professionalismRating: rating,
      timelinessRating: rating,
      comment
    });
    setReviewModalOpen(false);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    raiseComplaint({
      bookingId: booking.id,
      customerId: booking.customerId,
      customerName: booking.customerName,
      providerId: booking.providerId,
      providerName: booking.providerName,
      category: complaintCategory,
      description: complaintDesc,
      expectedResolution: 'Partial refund / Service re-visit'
    });
    setComplaintModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Info */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded text-blue-400 font-bold">{booking.bookingCode}</span>
              <span>•</span>
              <span>Created on {new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">
              {booking.serviceName}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Status: {booking.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* VISUAL BOOKING STATUS TIMELINE */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center relative">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="flex flex-col items-center z-10 text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' :
                    isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                    isDone ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Provider & Appointment Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Booking Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <UserAvatar src={booking.providerAvatar} name={booking.providerName} className="w-12 h-12 rounded-xl" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{booking.providerName}</div>
                  <div className="text-slate-500">{booking.providerCategory}</div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-500 font-medium">Scheduled Time:</div>
                <div className="font-bold text-slate-900">{booking.date} ({booking.timeSlot})</div>
              </div>
            </div>

            <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
              <div className="text-slate-500 font-medium">Delivery Address:</div>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{booking.address}, {booking.city} - {booking.pincode}</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-slate-500 font-medium">Special Requirements:</div>
              <p className="bg-slate-50 p-3 rounded-xl text-slate-700 leading-relaxed font-mono">
                {booking.requirements}
              </p>
            </div>
          </div>

          {/* Payment Receipt Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Payment & Payout Summary
            </h3>

            <div className="flex justify-between text-slate-600">
              <span>Service Base Price</span>
              <span className="font-semibold text-slate-900">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Commission ({booking.commissionPercentage}%)</span>
              <span className="font-semibold text-purple-600">₹{booking.commissionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Provider Net Earnings</span>
              <span className="font-semibold text-emerald-600">₹{booking.providerEarnings.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between font-extrabold text-sm text-slate-900">
              <span>{booking.paymentStatus === 'PAID' ? `Total Paid via ${booking.paymentMethod}` : `Due via ${booking.paymentMethod === 'PayAfterService' ? 'pay after service' : booking.paymentMethod}`}</span>
              <span className={booking.paymentStatus === 'PAID' ? 'text-blue-600' : 'text-amber-700'}>₹{booking.totalAmount.toFixed(2)}</span>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 font-mono">
              {booking.paymentId
                ? `${booking.paymentId.startsWith('pay_test_') ? 'Test Payment ID' : 'Razorpay Payment ID'}: ${booking.paymentId}`
                : 'No online payment taken'} (Status: {booking.paymentStatus})
            </div>
          </div>

          {/* Quick Role Actions */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">
              Action Controls
            </h3>

            <div className="flex flex-wrap gap-3 text-xs">
              {currentUser?.role === 'provider' && (
                <>
                  {booking.status === 'PENDING' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'ACCEPTED', 'Accepted by provider')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow"
                    >
                      Accept Booking
                    </button>
                  )}
                  {booking.status === 'ACCEPTED' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'ON_THE_WAY', 'Provider is on the way')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow"
                    >
                      Mark On The Way
                    </button>
                  )}
                  {booking.status === 'ON_THE_WAY' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS', 'Service started')}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl shadow"
                    >
                      Start Service
                    </button>
                  )}
                  {booking.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'COMPLETED', 'Service finished successfully')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl shadow"
                    >
                      Mark Completed
                    </button>
                  )}
                </>
              )}

              {/* Customer Actions */}
              {booking.status === 'COMPLETED' && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 px-4 rounded-xl shadow flex items-center gap-1"
                >
                  <Star className="w-4 h-4 fill-slate-950" /> Rate & Review Professional
                </button>
              )}

              <button
                onClick={() => setComplaintModalOpen(true)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 py-2 px-4 rounded-xl font-medium"
              >
                Raise Complaint / Issue
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Real-time Communication Module */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col h-[550px]">
          
          {/* Chat Header */}
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">Direct Customer Chat</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Live Secured
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {bookingMessages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center my-auto">
                No chat messages yet. Type below to communicate with {booking.providerName}.
              </p>
            ) : (
              bookingMessages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col text-xs ${
                    m.senderId === currentUser?.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5">{m.senderName}</span>
                  <div className={`p-3 rounded-2xl max-w-[85%] ${
                    m.senderId === currentUser?.id 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="border-t border-slate-100 pt-3 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Write message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      {/* REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base">Write Review for {booking.providerName}</h3>
              <button onClick={() => setReviewModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`text-xl ${rating >= s ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Your Feedback</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-red-600">Raise Complaint / Support Ticket</h3>
              <button onClick={() => setComplaintModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Complaint Category</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Late Arrival">Late Arrival</option>
                  <option value="Overcharging">Overcharging</option>
                  <option value="Unprofessional Behavior">Unprofessional Behavior</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Description of Issue</label>
                <textarea
                  rows={4}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe what went wrong..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Submit Complaint to Admin
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

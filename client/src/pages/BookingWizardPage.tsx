import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Banknote, CreditCard, ShieldCheck, CheckCircle2, 
  ArrowRight, ArrowLeft, Building2, Upload, AlertCircle, LoaderCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../data/mockData';
import type { Booking } from '../types';
import { postJson } from '../utils/api';

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  keyId?: string;
  mode: 'mock' | 'razorpay';
  testPaymentId?: string;
  testToken?: string;
}

interface VerifiedPayment {
  verified: boolean;
  paymentId: string;
  amount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'Other';
  providerId: string;
  serviceName: string;
  testMode?: boolean;
}

interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const loadRazorpayCheckout = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(Boolean(window.Razorpay));
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export const BookingWizardPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { providers, services, currentUser, createBooking, commissionPercentage, currentCity } = useApp();

  const provider = providers.find(p => p.id === providerId) || providers[0];

  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<string>(provider.servicesOffered[0] || 'General Service');
  const [bookingDate, setBookingDate] = useState<string>('2026-09-28');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState<string>('Flat 402, Sunshine Heights, Tonk Road');
  const [city, setCity] = useState<string>(provider.city || currentCity);
  const [pincode, setPincode] = useState<string>('302018');
  const [requirements, setRequirements] = useState<string>('');
  const [paymentChoice, setPaymentChoice] = useState<'ONLINE' | 'PAY_AFTER_SERVICE'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [testPaymentOrder, setTestPaymentOrder] = useState<PaymentOrder | null>(null);

  const basePrice = provider.startingPrice;
  const commissionAmount = Number(((basePrice * commissionPercentage) / 100).toFixed(2));
  const providerEarnings = Number((basePrice - commissionAmount).toFixed(2));
  const totalAmount = basePrice; // Total paid by customer

  const saveVerifiedPayment = (payment: VerifiedPayment) => {
    if (!currentUser || !payment.verified || payment.providerId !== provider.id || payment.serviceName !== selectedService) {
      throw new Error('The payment could not be matched to this booking. Contact support before retrying.');
    }

    const newBooking = saveBooking({
      totalAmount: payment.amount / 100,
      paymentId: payment.paymentId,
      paymentMethod: payment.paymentMethod,
      paymentStatus: 'PAID'
    });
    navigate(`/customer/booking/${newBooking.id}`);
  };

  const handleTestPayment = async () => {
    if (!currentUser || !testPaymentOrder?.testPaymentId || !testPaymentOrder.testToken) return;

    setIsProcessing(true);
    setPaymentError('');
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 1800));
      const payment = await postJson<VerifiedPayment>('/api/payments/verify', {
        mode: 'mock',
        orderId: testPaymentOrder.id,
        paymentId: testPaymentOrder.testPaymentId,
        testToken: testPaymentOrder.testToken
      });
      if (!payment.testMode) throw new Error('The local test payment could not be verified.');
      setTestPaymentOrder(null);
      saveVerifiedPayment(payment);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Test payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveBooking = (payment: Pick<Booking, 'totalAmount' | 'paymentMethod' | 'paymentStatus' | 'paymentId'>) => {
    const commission = Number(((payment.totalAmount * commissionPercentage) / 100).toFixed(2));
    return createBooking({
      customerId: currentUser!.id,
      customerName: currentUser!.name,
      customerEmail: currentUser!.email,
      customerMobile: currentUser!.mobile,
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      providerCategory: provider.category,
      serviceId: 'srv-custom',
      serviceName: selectedService,
      date: bookingDate,
      timeSlot,
      address,
      city,
      pincode,
      requirements: requirements || 'No special requirements added.',
      totalAmount: payment.totalAmount,
      commissionPercentage,
      commissionAmount: commission,
      providerEarnings: Number((payment.totalAmount - commission).toFixed(2)),
      paymentId: payment.paymentId,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      status: 'PENDING'
    });
  };

  const handleCompleteBooking = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (paymentChoice === 'PAY_AFTER_SERVICE') {
      const newBooking = saveBooking({
        totalAmount,
        paymentMethod: 'PayAfterService',
        paymentStatus: 'PENDING'
      });
      navigate(`/customer/booking/${newBooking.id}`);
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      const order = await postJson<PaymentOrder>('/api/payments/orders', {
        providerId: provider.id,
        serviceName: selectedService
      });

      if (order.mode === 'mock') {
        setTestPaymentOrder(order);
        setIsProcessing(false);
        return;
      }

      if (!order.keyId) throw new Error('Razorpay is missing its public key. Check the server configuration.');
      const checkoutLoaded = await loadRazorpayCheckout();
      if (!checkoutLoaded || !window.Razorpay) {
        throw new Error('Secure checkout could not be loaded. Check your connection and try again.');
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Digital Vistara',
        description: `${selectedService} with ${provider.name}`,
        order_id: order.id,
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.mobile
        },
        theme: { color: '#315b45' },
        handler: async (response) => {
          try {
            const payment = await postJson<VerifiedPayment>('/api/payments/verify', response);
            saveVerifiedPayment(payment);
          } catch (error) {
            setPaymentError(error instanceof Error ? error.message : 'Payment verification failed. Contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) }
      });

      checkout.open();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Could not start payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Wizard Progress Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-300">
          <span className="font-bold text-blue-400 uppercase tracking-widest">Step 0{step} of 04</span>
          <span>Booking with <b>{provider.name}</b></span>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Step Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">1. Select Service & Requirements</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Service Offered</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.servicesOffered.map((srv, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 rounded-2xl border text-left font-semibold text-xs transition flex items-center justify-between ${
                      selectedService === srv ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{srv}</span>
                    {selectedService === srv && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Special Instructions / Job Requirements</label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe your specific requirement (e.g. AC cooling gas issue, Class 12 Integration chapter)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Date & Time Slot */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">2. Select Appointment Date & Time</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Appointment Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow"
              >
                <span>Continue to Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Address Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">3. Service Delivery Address</h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, house no, landmark..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-semibold"
                  >
                    {INDIAN_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Summary & Payment Gateway */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">4. Review Price Breakdown & Payment</h2>

            {/* Price Receipt */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Service ({selectedService})</span>
                <span className="font-semibold text-slate-900">₹{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Convenience Fee ({commissionPercentage}%)</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between font-extrabold text-base text-slate-900">
                <span>Total Amount Payable</span>
                <span className="text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div role="radiogroup" aria-label="Choose how to pay" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                role="radio"
                aria-checked={paymentChoice === 'ONLINE'}
                onClick={() => { setPaymentChoice('ONLINE'); setPaymentError(''); }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${paymentChoice === 'ONLINE' ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 bg-white'}`}
              >
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <span><strong className="block text-xs text-slate-900">Pay online now</strong><small className="mt-1 block text-[11px] text-slate-500">UPI, card, or net banking</small></span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={paymentChoice === 'PAY_AFTER_SERVICE'}
                onClick={() => { setPaymentChoice('PAY_AFTER_SERVICE'); setPaymentError(''); }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${paymentChoice === 'PAY_AFTER_SERVICE' ? 'border-emerald-700 bg-emerald-50' : 'border-slate-200 bg-white'}`}
              >
                <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <span><strong className="block text-xs text-slate-900">Pay after service</strong><small className="mt-1 block text-[11px] text-slate-500">Settle directly with your professional</small></span>
              </button>
            </div>

            {paymentError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="booking-payment-actions flex flex-col-reverse gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:justify-between">
              <button
                onClick={() => setStep(3)}
                className="flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleCompleteBooking}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-3 py-3 text-xs font-extrabold text-white shadow-xl shadow-emerald-600/30 transition hover:bg-emerald-500 sm:w-auto sm:px-8 sm:text-sm"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{paymentChoice === 'PAY_AFTER_SERVICE' ? 'Book now, pay after service' : `Pay ₹${totalAmount} & Confirm Booking`}</span>
                  </>
                )}
              </button>
            </div>

            {testPaymentOrder && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4" role="presentation">
                <section role="dialog" aria-modal="true" aria-labelledby="test-payment-title" className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-6 shadow-2xl">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Local test mode</p>
                    <h2 id="test-payment-title" className="mt-2 text-xl font-bold text-slate-900">Simulate payment</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">This is a local demo. No payment is sent to Razorpay and no money will be charged.</p>
                  </div>
                  <div className="flex justify-between border-y border-slate-200 py-3 text-sm">
                    <span className="text-slate-600">Test amount</span>
                    <strong className="text-slate-900">₹{(testPaymentOrder.amount / 100).toFixed(2)}</strong>
                  </div>
                  {paymentError && <p role="alert" className="text-xs text-rose-700">{paymentError}</p>}
                  {isProcessing ? (
                    <div role="status" aria-live="polite" className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-4 text-center">
                      <LoaderCircle className="h-7 w-7 animate-spin text-emerald-700" aria-hidden="true" />
                      <span><strong className="block text-sm text-slate-900">Processing test payment</strong><small className="mt-1 block text-xs text-slate-500">Verifying your demo transaction. No money will be charged.</small></span>
                    </div>
                  ) : (
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button type="button" onClick={() => { setTestPaymentOrder(null); setPaymentError(''); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
                      <button type="button" onClick={handleTestPayment} className="rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white">Confirm test payment</button>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

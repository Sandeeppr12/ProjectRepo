import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, User, MessageSquare, Tag } from 'lucide-react';
import { apiRequest } from '../utils/api';

// ─── EMAILJS CONFIG ────────────────────────────────────────────────────────
// Follow the setup guide below to get these values from emailjs.com
const EMAILJS_SERVICE_ID  = 'service_h3eejnv';
const EMAILJS_TEMPLATE_ID = 'template_x93ix5n';
const EMAILJS_PUBLIC_KEY  = 'CCYEG6ElJ7GVnf09_';
// ──────────────────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

export const ContactPage: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();
  const professionalRequest = searchParams.get('request') === 'professional';
  const requestedService = searchParams.get('service') || 'the requested service';
  const requestedProfile = searchParams.get('profile');

  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    phone: '',
    subject: professionalRequest ? 'Service Provider Issue' : '',
    message: professionalRequest
      ? `I’m looking for a real professional for ${requestedService}.${requestedProfile ? ` I saw the fictional profile for ${requestedProfile}; I understand that profile is not bookable.` : ''}`
      : '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      if (professionalRequest) {
        await apiRequest('/api/professional-requests', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.from_name,
            email: formData.from_email,
            phone: formData.phone,
            service: requestedService,
            profileName: requestedProfile || '',
            message: formData.message
          })
        });
      } else {
        await emailjs.sendForm(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          formRef.current!,
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
      }
      setStatus('success');
      setFormData({ from_name: '', from_email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.text || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact &amp; Support</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            We'd Love to <span className="text-blue-600">Hear From You</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            {professionalRequest
              ? `Tell us how to reach you and we'll follow up about arranging ${requestedService} with a real professional. This request is not a confirmed booking.`
              : "Fill out the form below and we'll get back to you within 2 business hours."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact Info Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 space-y-6">
              <h2 className="text-lg font-bold">Get In Touch</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Digital Vistara Tech Park</div>
                    <div className="text-blue-100 text-xs mt-0.5">Tonk Road, Jaipur, Rajasthan 302018</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold">+91 1800-890-VISTARA</div>
                    <div className="text-blue-100 text-xs mt-0.5">Toll Free • Mon–Sat 9AM–8PM</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <a
                      href="mailto:digitalvistara.in@gmail.com"
                      className="font-semibold hover:underline"
                    >
                      digitalvistara.in@gmail.com
                    </a>
                    <div className="text-blue-100 text-xs mt-0.5">Replies within 2 hours</div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <a
                      href="https://wa.me/918755607281"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      +91 87556 07281
                    </a>
                    <div className="text-blue-100 text-xs mt-0.5">WhatsApp • Chat Now</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="text-xs text-blue-100 font-medium mb-3">Response Guarantee</div>
                <div className="space-y-2 text-xs text-blue-100">
                  {[
                    'General Queries → Within 2 Hours',
                    'Booking Issues → Within 30 Mins',
                    'Technical Support → Within 1 Hour',
                  ].map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="font-bold text-slate-900 text-lg mb-6 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>{professionalRequest ? 'Request a Booking' : 'Send Us a Message'}</span>
              </h2>

              {/* Success State */}
              {status === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3 mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="font-bold text-base">{professionalRequest ? 'Request Received!' : 'Message Sent Successfully! 🎉'}</div>
                  <p className="text-sm text-emerald-700">
                    {professionalRequest
                      ? 'Your request is saved for the administrator to review. This is not a confirmed booking.'
                      : "We've received your query and will reply within 2 hours."}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-xs text-emerald-600 hover:underline mt-2"
                  >
                    Send another message →
                  </button>
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3 mb-5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Failed to send message</div>
                    <div className="mt-0.5">{errorMsg || 'Please check your EmailJS configuration.'}</div>
                  </div>
                </div>
              )}

              {status !== 'success' && (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1">
                        <User className="w-3 h-3" /><span>Full Name *</span>
                      </label>
                      <input
                        type="text"
                        name="from_name"
                        value={formData.from_name}
                        onChange={handleChange}
                        placeholder="Aarav Sharma"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1">
                        <Mail className="w-3 h-3" /><span>Email Address *</span>
                      </label>
                      <input
                        type="email"
                        name="from_email"
                        value={formData.from_email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Phone + Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1">
                        <Phone className="w-3 h-3" /><span>Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1">
                        <Tag className="w-3 h-3" /><span>Subject *</span>
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">Select a topic…</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Booking Issue">Booking Issue</option>
                        <option value="Payment Problem">Payment Problem</option>
                        <option value="Service Provider Issue">Service Provider Issue</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Partnership Inquiry">Partnership / Business</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" /><span>Message *</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your query in detail…"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  {/* Hidden field — used by EmailJS template */}
                  <input type="hidden" name="to_email" value="digitalvistara.in@gmail.com" />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{professionalRequest ? 'Send Booking Request' : 'Send Message'}</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Your message will be delivered to{' '}
                    <a href="mailto:digitalvistara.in@gmail.com" className="text-blue-500 hover:underline">
                      digitalvistara.in@gmail.com
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom trust strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-6 justify-center text-xs text-slate-500">
          {['100% Spam-Free', 'Your data is secure', 'We never share your info'].map(text => (
            <div key={text} className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

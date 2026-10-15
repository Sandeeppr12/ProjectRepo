import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, X, Bot, User as UserIcon, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseNaturalLanguageQuery } from '../utils/nlpParser';
import { rankProvidersWithAI } from '../utils/aiRecommendationEngine';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: { label: string; action: () => void }[];
  matchedProviders?: any[];
}

export const VistaraAiModal: React.FC = () => {
  const { isAiModalOpen, setIsAiModalOpen, providers, currentCity } = useApp();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am **Vistara AI**, your personal service assistant. 🤖\n\nTell me what you need in plain language (e.g. *"My AC is not cooling"*, *"I need a maths tutor in Jaipur"*, or *"I need someone to manage my Instagram"*).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAiModalOpen) return null;

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');

    // Parse Intent
    const parsed = parseNaturalLanguageQuery(textToSend);
    const targetCity = parsed.city || currentCity;
    const ranked = rankProvidersWithAI(providers, parsed.category, parsed.service, targetCity);
    const topMatches = ranked.slice(0, 2);

    setTimeout(() => {
      let aiResponseText = parsed.suggestedReply;
      if (topMatches.length > 0) {
        aiResponseText += `\n\nI found ${ranked.length} verified professional(s) matching your criteria:`;
      } else {
        aiResponseText += `\n\nI couldn't find an exact match in our system, but you can explore our 5 primary categories!`;
      }

      const actions = [];
      if (parsed.categorySlug) {
        actions.push({
          label: `Browse ${parsed.category || 'Category'}`,
          action: () => {
            setIsAiModalOpen(false);
            navigate(`/services/${parsed.categorySlug}`);
          }
        });
      }

      actions.push({
        label: `View All Recommended Professionals`,
        action: () => {
          setIsAiModalOpen(false);
          navigate(`/providers?category=${encodeURIComponent(parsed.category || '')}&service=${encodeURIComponent(parsed.service || '')}`);
        }
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions,
        matchedProviders: topMatches.map(m => m.provider)
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl h-[600px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">Vistara AI Assistant</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  RAG Smart Match
                </span>
              </div>
              <p className="text-xs text-slate-300">Ask anything in natural language</p>
            </div>
          </div>

          <button
            onClick={() => setIsAiModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                {msg.sender === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Matched Providers Cards */}
                {msg.matchedProviders && msg.matchedProviders.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-700/80 pt-2">
                    {msg.matchedProviders.map((p: any) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setIsAiModalOpen(false);
                          navigate(`/provider/${p.id}`);
                        }}
                        className="bg-slate-900 p-2.5 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer flex items-center justify-between transition group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-semibold text-white text-xs flex items-center space-x-1">
                              <span>{p.name}</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            </div>
                            <div className="text-[10px] text-slate-400">★ {p.rating} • {p.city} • Starting ₹{p.startingPrice}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Chips */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-1 border-t border-slate-700/50">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={act.action}
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right mt-1.5 opacity-70">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px] text-slate-300 no-scrollbar">
          <span className="text-slate-500 font-semibold shrink-0">Try asking:</span>
          <button 
            onClick={() => handleSend('My AC is not cooling')}
            className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
          >
            "My AC is not cooling"
          </button>
          <button 
            onClick={() => handleSend('I need a maths tutor in Jaipur')}
            className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
          >
            "I need a maths tutor"
          </button>
          <button 
            onClick={() => handleSend('I need someone to manage my Instagram')}
            className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
          >
            "Social media manager"
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your service requirement (e.g. nurse for home care)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl shadow transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

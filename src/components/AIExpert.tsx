import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, Brain, Bot, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAgriAdvice } from '../services/aiService';
import { cn } from '../lib/utils';

export const AIExpert = ({ language }: { language: 'en' | 'te' }) => {
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('Cotton');
  const [district, setDistrict] = useState('Guntur');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: language === 'te' ? "నమస్కారం! నేను మీ అగ్రిసైట్ AI నిపుణుడిని. మీకు ఈరోజు ఎలా సహాయపడగలను?" : "Namaste! I am your AgriSight AI Expert." }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setQuery('');
    setLoading(true);

    const advice = await getAgriAdvice(crop, district, language);
    setMessages(prev => [...prev, { role: 'ai', text: advice || "Error generating response." }]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-emerald-950 rounded-xl p-6 text-white shadow-xl border border-emerald-800 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
            <div className="p-4 bg-emerald-900/50 rounded-xl border border-emerald-800 shadow-2xl">
                <Brain size={32} className="text-emerald-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black tracking-tight leading-none mb-1 uppercase">A.I. Expert Core</h3>
                <p className="text-emerald-200/60 text-[11px] font-bold uppercase tracking-wider mb-4">
                    {language === 'en' 
                        ? "Predictive Intelligence • Satellite Analysis" 
                        : "శాటిలైట్ విశ్లేషణ • మార్కెట్ ఇంటిలిజెన్స్"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <select 
                      value={crop} 
                      onChange={(e) => setCrop(e.target.value)}
                      className="bg-emerald-900 border border-emerald-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                        <option>Cotton</option>
                        <option>Wheat</option>
                        <option>Rice</option>
                        <option>Tomato</option>
                    </select>
                    <input 
                       value={district}
                       onChange={(e) => setDistrict(e.target.value)}
                       className="bg-emerald-900 border border-emerald-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32 placeholder:text-emerald-700"
                       placeholder="District"
                    />
                    <button 
                      onClick={() => setMessages([{ role: 'ai', text: 'System rebooted. History cleared.' }])}
                      className="p-1.5 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900 rounded-lg transition-all border border-emerald-900"
                      title="Clear History"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 shadow-2xl min-h-[400px] flex flex-col overflow-hidden border-b-4 border-b-emerald-600 group">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[500px] scrollbar-hide bg-slate-50/50">
            <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex items-start gap-3 max-w-[90%]",
                            m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border",
                            m.role === 'user' ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        )}>
                            {m.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                        </div>
                        <div className={cn(
                            "p-3 rounded-xl text-xs font-semibold leading-relaxed shadow-sm",
                            m.role === 'user' ? "bg-slate-950 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-emerald-50"
                        )}>
                            {m.text}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest ml-11">
                        <Sparkles size={12} className="animate-spin" />
                        Analyzing Mandi Data...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center group/input">
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={language === 'en' ? "Query pests, pricing, weather..." : "తెగుళ్లు, ఎరువులు లేదా ధరల గురించి అడగండి..."}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3 pl-5 pr-14 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-xs text-slate-700 shadow-inner"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !query.trim()}
                    className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};


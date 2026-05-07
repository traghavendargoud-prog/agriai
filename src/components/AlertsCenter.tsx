import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, ArrowUpRight, ShieldCheck, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

const notifications = [
    { title: "Price Alert: Cotton", body: "Cotton prices in Guntur Mandi increased by 4% today. Expected to hold for 2 more days.", type: "success", time: "10 mins ago" },
    { title: "Weather Warning", body: "High probability of rain in your district on Sunday. Plan your harvest accordingly.", type: "warning", time: "2 hours ago" },
    { title: "Crop Stress Detected", body: "Satellite imagery shows low NDVI in Section 4B of your farm. Possible water stress.", type: "danger", time: "Yesterday" },
];

export const AlertsCenter = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-4 pb-20">
            <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-emerald-100 shadow-sm border-b-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg text-white flex items-center justify-center shadow-md">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">Signal Intelligence</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time farm & market notifications</p>
                    </div>
                </div>
                <button className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all leading-none">
                    Clear Logs
                </button>
            </div>

            <div className="space-y-2">
                {notifications.map((n, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden border-l-4">
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            n.type === 'success' ? "bg-emerald-500" : n.type === 'warning' ? "bg-orange-500" : "bg-red-500"
                        )}></div>
                        
                        <div className="flex justify-between items-start pl-1">
                            <div className="flex gap-4 items-center">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border shrink-0",
                                    n.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : n.type === 'warning' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-red-50 text-red-600 border-red-100"
                                )}>
                                    {n.type === 'success' ? <CheckCircle2 size={16}/> : n.type === 'warning' ? <Info size={16}/> : <AlertCircle size={16}/>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{n.title}</h4>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter shrink-0">{n.time}</span>
                                    </div>
                                    <p className="text-slate-500 text-[11px] font-medium leading-tight mt-0.5">{n.body}</p>
                                </div>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-200 group-hover:text-emerald-600 transition-all shrink-0" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-950 p-1 rounded-2xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-32 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center border border-slate-800 p-6 rounded-xl bg-slate-900/50 backdrop-blur-xl">
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 shadow-2xl shrink-0 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={32} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">WhatsApp AI Stream</h4>
                        <p className="text-slate-400 text-[11px] font-medium leading-tight max-w-lg mb-4 italic">
                            Stream real-time price volatility, extreme weather trajectory, and sub-surface moisture alerts directly to your mobile secure link.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <button className="px-5 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 transition-all flex items-center gap-2 active:scale-95">
                                <Share2 size={12} /> Sync Device
                            </button>
                            <button className="px-5 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-700 transition-all active:scale-95">
                                Configurations
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


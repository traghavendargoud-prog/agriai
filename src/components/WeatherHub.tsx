import React from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Wind, Droplets, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const hours = [
    { time: '9 AM', temp: '28°', icon: Sun },
    { time: '12 PM', temp: '34°', icon: Sun },
    { time: '3 PM', temp: '36°', icon: Cloud },
    { time: '6 PM', temp: '31°', icon: CloudRain },
    { time: '9 PM', temp: '27°', icon: CloudRain },
];

const days = [
    { day: 'Mon', high: 36, low: 24, icon: Sun },
    { day: 'Tue', high: 34, low: 23, icon: Sun },
    { day: 'Wed', high: 32, low: 22, icon: Cloud },
    { day: 'Thu', high: 31, low: 22, icon: CloudRain },
    { day: 'Fri', high: 30, low: 21, icon: CloudRain },
    { day: 'Sat', high: 33, low: 23, icon: Sun },
    { day: 'Sun', high: 35, low: 24, icon: Sun },
];

export const WeatherHub = () => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-700 to-indigo-900 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-extrabold tracking-tight">Guntur, Andhra Pradesh</h3>
                                <p className="text-blue-200 text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">Thursday, 07 May 2026</p>
                            </div>
                            <Sun size={48} className="text-yellow-400 drop-shadow-2xl animate-pulse" />
                        </div>
                        
                        <div className="flex items-baseline gap-3 mb-8">
                            <h2 className="text-6xl font-black tracking-tighter">32°</h2>
                            <div className="text-sm font-bold text-blue-100 flex flex-col">
                                <span className="leading-none text-lg">Partly Cloudy</span>
                                <span className="text-blue-300/60 font-semibold leading-none mt-1">Feels like 36°</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/10 rounded-lg"><Droplets size={14}/></div>
                                <div><p className="text-[8px] text-blue-200 uppercase font-black tracking-tighter">Humidity</p><p className="font-bold text-xs uppercase tracking-tighter">45%</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/10 rounded-lg"><Wind size={14}/></div>
                                <div><p className="text-[8px] text-blue-200 uppercase font-black tracking-tighter">Wind</p><p className="font-bold text-xs uppercase tracking-tighter">12 km/h</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/10 rounded-lg"><CloudRain size={14}/></div>
                                <div><p className="text-[8px] text-blue-200 uppercase font-black tracking-tighter">Precip</p><p className="font-bold text-xs uppercase tracking-tighter">14%</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/10 rounded-lg"><Thermometer size={14}/></div>
                                <div><p className="text-[8px] text-blue-200 uppercase font-black tracking-tighter">Pressure</p><p className="font-bold text-xs uppercase tracking-tighter">1012 hPa</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" size={14} />
                            Farmer Weather Alerts
                        </h4>
                        <div className="space-y-2">
                            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                <p className="text-[11px] font-black text-orange-800 uppercase tracking-tight">High Heat Warning</p>
                                <p className="text-[10px] text-orange-700/80 mt-1 leading-tight font-medium">Temps &gt; 40°C tomorrow 11AM-4PM. Irrigate cotton today.</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-[11px] font-black text-blue-800 uppercase tracking-tight">Ideal Spray window</p>
                                <p className="text-[10px] text-blue-700/80 mt-1 leading-tight font-medium">Low wind tonight. Favorable for foliar nutrition.</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                        <MessageSquare size={14} /> WhatsApp Alert
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      Hourly Forecast
                    </h4>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {hours.map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 shrink-0 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg transition-all hover:border-blue-200 cursor-default">
                                <span className="text-[9px] font-black text-slate-400 uppercase">{h.time}</span>
                                <h.icon size={20} className="text-blue-500" />
                                <span className="text-sm font-black text-slate-800">{h.temp}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      7-Day Agri-Weather
                    </h4>
                    <div className="space-y-3">
                        {days.map((d, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <span className="w-8 text-[11px] font-black text-slate-500 uppercase">{d.day}</span>
                                <div className="flex items-center gap-2 flex-1 justify-center px-4">
                                    <d.icon size={16} className="text-blue-500 shrink-0" />
                                    <div className="w-full h-1 bg-slate-100 rounded-full relative overflow-hidden">
                                        <div 
                                          className="absolute h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                                          style={{ left: `${(d.low / 40) * 100}%`, width: `${((d.high - d.low) / 40) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-20 text-right font-black text-xs tabular-nums">
                                    <span className="text-slate-900">{d.high}°</span>
                                    <span className="text-slate-300 ml-2">{d.low}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

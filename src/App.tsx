/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  TrendingUp, 
  CloudRain, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Phone,
  BarChart3,
  Leaf,
  ChevronRight,
  Bell,
  Search,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CropPrice, WeatherData } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { SatelliteAnalysis } from './components/SatelliteAnalysis';
import { MarketIntelligence, premiumMarketData } from './components/MarketIntelligence';
import { WeatherHub } from './components/WeatherHub';
import { AIExpert } from './components/AIExpert';
import { AlertsCenter } from './components/AlertsCenter';
import { SplashScreen } from './components/SplashScreen';
import { translations } from './constants/translations';

// Components
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, language }: any) => {
  const t = translations[language as 'en' | 'te'];
  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'satellite', label: t.satellite, icon: MapIcon },
    { id: 'market', label: t.market, icon: TrendingUp },
    { id: 'weather', icon: CloudRain, label: t.weather },
    { id: 'ai-advice', icon: MessageSquare, label: t.aiExpert },
    { id: 'alerts', icon: Bell, label: t.alerts },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 bg-emerald-600 text-white rounded-md shadow-md"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-56 bg-emerald-950 text-white transition-transform duration-300 transform lg:translate-x-0 border-r border-emerald-900",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="text-emerald-950" size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">AgriSight AI</h1>
                <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mt-1">Predict • Grow • Profit</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setIsOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold",
                    activeTab === tab.id 
                      ? "bg-emerald-500 text-emerald-950 shadow-md" 
                      : "text-emerald-100/60 hover:bg-emerald-900/50 hover:text-white"
                  )}
                  id={`nav-${tab.id}`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-5 border-t border-emerald-900/50">
            <button 
              onClick={() => { setActiveTab('settings'); setIsOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold",
                activeTab === 'settings' 
                  ? "bg-emerald-500 text-emerald-950 shadow-md" 
                  : "text-emerald-100/60 hover:bg-emerald-900/50 hover:text-white"
              )}
              id="nav-settings"
            >
              <Settings size={16} />
              <span>{translations[language as 'en' | 'te'].settings}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all group border-b-2 flex items-center justify-between gap-3"
  >
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 flex items-center justify-center rounded-lg shadow-inner", color)}>
        <Icon size={18} className="text-white drop-shadow-sm" />
      </div>
      <div>
        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <h3 className="text-lg font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
      </div>
    </div>
    {trend && (
      <span className={cn(
        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
        trend.startsWith('+') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : trend === 'Stable' ? "bg-slate-50 text-slate-500 border border-slate-100" : "bg-red-50 text-red-600 border border-red-100"
      )}>
        {trend}
      </span>
    )}
  </motion.div>
);

const MarketTicker = () => (
  <footer className="fixed bottom-0 left-0 right-0 lg:left-56 h-8 bg-slate-950 flex items-center z-30 shrink-0 border-t border-slate-800">
    <div className="bg-emerald-600 text-[9px] font-black text-white px-4 h-full flex items-center uppercase tracking-widest shrink-0">Market Pulse</div>
    <div className="flex-1 overflow-hidden relative h-full flex items-center">
      <div className="flex items-center gap-12 px-6 text-[10px] text-slate-400 font-mono whitespace-nowrap animate-marquee">
        <span>WHEAT (IND) 2,125 <span className="text-emerald-400">+0.25%</span></span>
        <span>SOYBEAN (IND) 5,420 <span className="text-red-400">-1.12%</span></span>
        <span>MAIZE (IND) 1,980 <span className="text-emerald-400">+0.05%</span></span>
        <span>ONION (NSK) 1,200 <span className="text-red-400">-4.20%</span></span>
        <span>SUGARCANE (UP) 315 <span className="text-slate-300">0.00%</span></span>
        <span>COTTON (MCX) 61,240 <span className="text-emerald-400">+2.40%</span></span>
      </div>
    </div>
    <div className="px-4 text-[9px] text-slate-500 font-bold border-l border-slate-800 hidden md:block">
      SERVER STATUS: OPTIMAL
    </div>
    <style>{`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-marquee {
        animation: marquee 30s linear infinite;
        display: inline-flex;
      }
    `}</style>
  </footer>
);


export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [prices, setPrices] = useState<CropPrice[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Ensure user profile exists in Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'farmer',
              district: 'Guntur',
              preferredLanguage: 'en',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        setUser(null);
      }
    });

    fetch('/api/market/prices')
      .then(res => res.json())
      .then(setPrices);

    fetch('/api/weather/current?district=Guntur')
      .then(res => res.json())
      .then(setWeather);

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const filteredPrices = prices.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <div className="space-y-4 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tighter leading-none uppercase">{translations[language].farmersIntel}</h2>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Guntur Core • 2.4 Acres Active Monitoring</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-lg text-emerald-700 text-[10px] uppercase font-black hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                >
                  <Globe size={14} />
                  {language === 'en' ? 'తెలుగు' : 'English'}
                </button>
                <div className="relative group">
                  <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-all cursor-pointer">
                    <Bell size={16} />
                  </div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-2 right-2 border border-white"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="NDVI Index" value="0.72" trend="+4%" icon={Leaf} color="bg-emerald-600" />
              <StatCard label="Soil Moisture" value="34%" trend="-2%" icon={CloudRain} color="bg-blue-600" />
              <StatCard 
                label="Air Temp" 
                value={weather ? `${weather.temp}°C` : '32°C'} 
                trend={weather ? weather.condition : 'Clear'} 
                icon={CloudRain} 
                color="bg-amber-500" 
              />
              <StatCard label="Yield Outlook" value="4.8T" trend="Stable" icon={BarChart3} color="bg-indigo-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">Live Weather & Crop Health</h3>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-[9px] font-black uppercase">
                       <CloudRain size={10} />
                       {weather ? `${weather.humidity}% Humid` : '42% Humid'}
                    </div>
                  </div>
                </div>
                <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden relative shadow-inner">
                  <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale scale-110" alt="Farm map" />
                  <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply"></div>
                  <div className="z-10 bg-slate-950/90 backdrop-blur px-4 py-3 rounded-lg shadow-2xl border border-emerald-900/50 text-center">
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Optical Stream Active</p>
                    <p className="text-white font-mono text-[9px] opacity-80">16.306°N, 80.436°E</p>
                    <div className="mt-2 flex gap-1.5 justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div className="w-16 h-1 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></div>
                    <div className="w-10 h-1 rounded-full bg-emerald-400/50"></div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-6 rounded-xl shadow-xl border border-emerald-900 relative overflow-hidden flex flex-col border-b-4 border-b-emerald-600">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2 leading-none">
                    <MessageSquare size={14} />
                    AgriSight Intelligence
                  </h3>
                  <div className="space-y-4 flex-1">
                    <div className="bg-emerald-900/40 p-3 rounded-lg border border-emerald-800 shadow-inner">
                      <p className="text-emerald-100 text-[11px] leading-tight font-serif italic">
                        "NDVI trajectory suggests Guntur peak maturity in <span className="text-emerald-400 font-bold underline">12 days</span>. 
                        Local liquidity is low. Strategy: Hold harvest for pricing delta."
                      </p>
                    </div>
                    <div className="pt-2 space-y-2">
                      <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest leading-none">Strategic Actions</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2.5 text-[10px] font-bold text-emerald-100/80">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>
                          Increase liquid nitrogen spray level
                        </li>
                        <li className="flex items-center gap-2.5 text-[10px] font-bold text-emerald-100/80">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>
                          Verify soil moisture telemetry sensors
                        </li>
                      </ul>
                    </div>
                    <button className="w-full mt-auto py-2.5 bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-900/50">
                      Predictive Audit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm overflow-hidden border-b-2">
               <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Market Pulse • Live Mandi Analytics</h3>
                <div className="flex gap-2">
                   <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded border border-emerald-100">Andhra Central</div>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-2 text-slate-400 font-black text-[9px] uppercase tracking-widest">Commodity</th>
                      <th className="pb-2 text-slate-400 font-black text-[9px] uppercase tracking-widest">Spot Price</th>
                      <th className="pb-2 text-slate-400 font-black text-[9px] uppercase tracking-widest text-center">Trend</th>
                      <th className="pb-2 text-slate-400 font-black text-[9px] uppercase tracking-widest text-center">Best Price (External)</th>
                      <th className="pb-2 text-slate-400 font-black text-[9px] uppercase tracking-widest text-right">Confidence Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 tabular-nums">
                    {filteredPrices.slice(0, 5).map((price, i) => (
                      <tr key={i} className="group hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 font-black text-slate-800 text-xs tracking-tight">{price.name}</td>
                        <td className="py-3 text-slate-600 text-xs font-bold leading-none">₹{price.currentPrice.toLocaleString()} <span className="text-[9px] text-slate-400">/ Qtl</span></td>
                        <td className="py-3 text-center">
                          <span className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black",
                            price.trend === 'up' ? "bg-green-50 text-green-700 border border-green-100 shadow-sm" : "bg-red-50 text-red-700 border border-red-100 shadow-sm"
                          )}>
                            {price.trend === 'up' ? '▲' : '▼'} {Math.floor(Math.random() * 5)}%
                          </span>
                        </td>
                        <td className="py-3 text-center">
                           {premiumMarketData[price.name] ? (
                             <div className="flex flex-col items-center">
                               <span className="text-emerald-700 text-xs font-black tracking-tight">₹{premiumMarketData[price.name][0].price.toLocaleString()}</span>
                               <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">
                                 {premiumMarketData[price.name][0].market}, {premiumMarketData[price.name][0].state.slice(0, 2)}
                               </span>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center">
                               <span className="text-emerald-700 text-xs font-black tracking-tight">₹{(price.currentPrice * 1.05).toLocaleString()}</span>
                               <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">Nearby Mandi</span>
                             </div>
                           )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: `${price.confidence}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-500">{price.confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPrices.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">No matches found for "{searchQuery}"</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'market':
        const filteredMarketPrices = prices.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return <MarketIntelligence prices={filteredMarketPrices} />;
      case 'weather':
        return <WeatherHub />;
      case 'ai-advice':
        return <AIExpert language={language} />;
      case 'alerts':
        return <AlertsCenter />;
      case 'satellite':
        return <SatelliteAnalysis />;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto space-y-6 py-6">
            <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Application Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preferred Language</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLanguage('en')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                        language === 'en' ? "bg-emerald-600 text-white border-emerald-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200"
                      )}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => setLanguage('te')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                        language === 'te' ? "bg-emerald-600 text-white border-emerald-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200"
                      )}
                    >
                      తెలుగు (Telugu)
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h4 className="text-xs font-bold text-slate-800 mb-4">Account Information</h4>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold overflow-hidden shadow-sm">
                         {user?.photoURL ? <img src={user.photoURL} alt="User" /> : 'F'}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-800">{user?.displayName || 'Farmer'}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-black">{user?.email || 'N/A'}</p>
                      </div>
                      <button className="ml-auto text-[10px] font-black text-red-600 uppercase hover:underline">Sign Out</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-20 text-center text-slate-400">Section coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-emerald-100">
      <AnimatePresence>
        {loading && <SplashScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        language={language}
      />
      
      <main className="lg:ml-56 p-4 lg:p-6 min-h-screen">
        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-4 mt-8 bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
          <Search className="text-slate-400 ml-2" size={14} />
          <input 
            type="text" 
            placeholder="Search Mandi or Farm..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent py-1.5 focus:outline-none font-medium text-xs text-slate-700"
          />
        </div>

        <header className="hidden lg:flex justify-between items-center mb-6 h-12 bg-white/50 backdrop-blur border border-emerald-50 rounded-xl px-4 shadow-sm">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search Mandi or Farm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-2 pl-9 pr-4 focus:outline-none transition-all font-medium text-xs text-slate-700"
            />
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
               <button 
                onClick={handleLogin}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-500 transition-all active:scale-95"
               >
                 {translations[language].connectGoogle}
               </button>
            ) : (
              <>
                <div className="flex flex-col items-end leading-none">
                  <span className="font-bold text-slate-800 text-xs">{user.displayName || 'Farmer'}</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5 tracking-tighter">Pro Member</span>
                </div>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 shadow-sm overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : (user.displayName?.[0] || 'F')}
                </div>
              </>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <MarketTicker />

      {/* WhatsApp Floating Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:shadow-green-500/40 transition-all group"
      >
        <Phone size={24} />
        <span className="absolute right-full mr-4 bg-white text-slate-900 px-4 py-2 rounded-2xl text-sm font-bold shadow-xl border border-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          WhatsApp AI Support
        </span>
      </motion.button>
    </div>
  );
}

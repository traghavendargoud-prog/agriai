import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Info, ChevronDown, BarChart3, LineChart as LineIcon, AreaChart as AreaIcon, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { CropPrice } from '../types';

const cropSpecificData: Record<string, any[]> = {
  'Cotton': [
    { name: 'Jan', price: 6200, predicted: 6100 },
    { name: 'Feb', price: 6500, predicted: 6400 },
    { name: 'Mar', price: 6800, predicted: 6700 },
    { name: 'Apr', price: 7200, predicted: 7100 },
    { name: 'May', price: 7420, predicted: 7500 },
    { name: 'Jun', price: null, predicted: 7800 },
    { name: 'Jul', price: null, predicted: 8100 },
  ],
  'Wheat': [
    { name: 'Jan', price: 2100, predicted: 2050 },
    { name: 'Feb', price: 2150, predicted: 2120 },
    { name: 'Mar', price: 2300, predicted: 2280 },
    { name: 'Apr', price: 2450, predicted: 2400 },
    { name: 'May', price: 2275, predicted: 2300 },
    { name: 'Jun', price: null, predicted: 2400 },
    { name: 'Jul', price: null, predicted: 2550 },
  ],
  'Rice': [
    { name: 'Jan', price: 3500, predicted: 3450 },
    { name: 'Feb', price: 3600, predicted: 3580 },
    { name: 'Mar', price: 3750, predicted: 3700 },
    { name: 'Apr', price: 3900, predicted: 3850 },
    { name: 'May', price: 3950, predicted: 4000 },
    { name: 'Jun', price: null, predicted: 4100 },
    { name: 'Jul', price: null, predicted: 4250 },
  ],
  'Maize': [
    { name: 'Jan', price: 1800, predicted: 1750 },
    { name: 'Feb', price: 1850, predicted: 1820 },
    { name: 'Mar', price: 1950, predicted: 1900 },
    { name: 'Apr', price: 2100, predicted: 2050 },
    { name: 'May', price: 2150, predicted: 2200 },
    { name: 'Jun', price: null, predicted: 2300 },
    { name: 'Jul', price: null, predicted: 2450 },
  ],
  'Mustard': [
    { name: 'Jan', price: 5400, predicted: 5300 },
    { name: 'Feb', price: 5600, predicted: 5500 },
    { name: 'Mar', price: 5800, predicted: 5750 },
    { name: 'Apr', price: 6100, predicted: 6000 },
    { name: 'May', price: 6250, predicted: 6300 },
    { name: 'Jun', price: null, predicted: 6500 },
    { name: 'Jul', price: null, predicted: 6800 },
  ],
  'Soybean': [
    { name: 'Jan', price: 4200, predicted: 4100 },
    { name: 'Feb', price: 4350, predicted: 4300 },
    { name: 'Mar', price: 4500, predicted: 4450 },
    { name: 'Apr', price: 4700, predicted: 4650 },
    { name: 'May', price: 4850, predicted: 4900 },
    { name: 'Jun', price: null, predicted: 5100 },
    { name: 'Jul', price: null, predicted: 5300 },
  ],
  'Turmeric': [
    { name: 'Jan', price: 12000, predicted: 11500 },
    { name: 'Feb', price: 13500, predicted: 13000 },
    { name: 'Mar', price: 15000, predicted: 14500 },
    { name: 'Apr', price: 17000, predicted: 16500 },
    { name: 'May', price: 18500, predicted: 19000 },
    { name: 'Jun', price: null, predicted: 21000 },
    { name: 'Jul', price: null, predicted: 23000 },
  ],
  'Cumin': [
    { name: 'Jan', price: 28000, predicted: 27000 },
    { name: 'Feb', price: 31000, predicted: 30000 },
    { name: 'Mar', price: 34000, predicted: 33000 },
    { name: 'Apr', price: 38000, predicted: 37000 },
    { name: 'May', price: 36500, predicted: 37000 },
    { name: 'Jun', price: null, predicted: 39000 },
    { name: 'Jul', price: null, predicted: 42000 },
  ],
};

const decisionSignals: Record<string, any> = {
  'Cotton': { signal: 'STRONG HOLD', delta: '12.5%', date: 'May 24', vol: 'Low', conf: '94.2%' },
  'Wheat': { signal: 'LIQUIDATE', delta: '-8.2%', date: 'May 12', vol: 'Medium', conf: '88.5%' },
  'Rice': { signal: 'PARTIAL SELL', delta: '+5.0%', date: 'May 18', vol: 'Stable', conf: '91.0%' },
  'Maize': { signal: 'ACCUMULATE', delta: '+15.4%', date: 'Jun 05', vol: 'High', conf: '86.7%' },
  'Mustard': { signal: 'HOLD', delta: '+8.2%', date: 'Jun 15', vol: 'Low', conf: '92.1%' },
  'Soybean': { signal: 'STRONG BUY', delta: '+18.5%', date: 'Jun 20', vol: 'Medium', conf: '89.4%' },
  'Turmeric': { signal: 'STRONG ACCUMULATE', delta: '+25.0%', date: 'Jul 10', vol: 'High', conf: '85.2%' },
  'Cumin': { signal: 'SELL RALLY', delta: '+5.5%', date: 'May 15', vol: 'Very High', conf: '82.8%' },
};

export const premiumMarketData: Record<string, { market: string; state: string; price: number; trend: 'up' | 'down'; distance: string }[]> = {
  'Cotton': [
    { market: 'Surat', state: 'Gujarat', price: 8200, trend: 'up', distance: '640 km' },
    { market: 'Amravati', state: 'Maharashtra', price: 7950, trend: 'up', distance: '420 km' },
    { market: 'Coimbatore', state: 'Tamil Nadu', price: 8100, trend: 'down', distance: '850 km' },
  ],
  'Wheat': [
    { market: 'Indore', state: 'MP', price: 2850, trend: 'up', distance: '550 km' },
    { market: 'Kota', state: 'Rajasthan', price: 2700, trend: 'up', distance: '720 km' },
    { market: 'Khanna', state: 'Punjab', price: 2600, trend: 'down', distance: '1200 km' },
  ],
  'Rice': [
    { market: 'Karnal', state: 'Haryana', price: 4500, trend: 'up', distance: '1450 km' },
    { market: 'Burdwan', state: 'West Bengal', price: 4200, trend: 'up', distance: '1100 km' },
    { market: 'Raipur', state: 'Chhattisgarh', price: 4100, trend: 'down', distance: '750 km' },
  ],
  'Maize': [
    { market: 'Davangere', state: 'Karnataka', price: 2450, trend: 'up', distance: '480 km' },
    { market: 'Gulabbagh', state: 'Bihar', price: 2600, trend: 'up', distance: '1350 km' },
    { market: 'Nizamabad', state: 'Telangana', price: 2300, trend: 'up', distance: '320 km' },
  ],
  'Mustard': [
    { market: 'Bharatpur', state: 'Rajasthan', price: 7200, trend: 'up', distance: '1150 km' },
    { market: 'Agra', state: 'UP', price: 6900, trend: 'up', distance: '1200 km' },
    { market: 'Hissar', state: 'Haryana', price: 7050, trend: 'down', distance: '1400 km' },
  ],
  'Soybean': [
    { market: 'Latur', state: 'Maharashtra', price: 5600, trend: 'up', distance: '450 km' },
    { market: 'Ujjain', state: 'MP', price: 5400, trend: 'up', distance: '680 km' },
    { market: 'Kota', state: 'Rajasthan', price: 5500, trend: 'up', distance: '720 km' },
  ],
  'Turmeric': [
    { market: 'Erode', state: 'Tamil Nadu', price: 22000, trend: 'up', distance: '650 km' },
    { market: 'Sangli', state: 'Maharashtra', price: 20500, trend: 'up', distance: '550 km' },
    { market: 'Nizamabad', state: 'Telangana', price: 19800, trend: 'up', distance: '320 km' },
  ],
  'Cumin': [
    { market: 'Unjha', state: 'Gujarat', price: 44000, trend: 'up', distance: '850 km' },
    { market: 'Nagaur', state: 'Rajasthan', price: 42000, trend: 'up', distance: '1050 km' },
    { market: 'Rajkot', state: 'Gujarat', price: 43500, trend: 'up', distance: '920 km' },
  ],
};

export const MarketIntelligence = ({ prices }: { prices: CropPrice[] }) => {
  const [selectedCrop, setSelectedCrop] = useState(prices.length > 0 ? prices[0].name : 'Cotton');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');

  // Sync selectedCrop if the filtered prices list changes and current selection is gone
  useEffect(() => {
    if (prices.length > 0 && !prices.find(p => p.name === selectedCrop)) {
      setSelectedCrop(prices[0].name);
    }
  }, [prices]);

  const currentData = cropSpecificData[selectedCrop] || cropSpecificData['Cotton'];
  const currentSignal = decisionSignals[selectedCrop] || decisionSignals['Cotton'];
  const higherMarkets = premiumMarketData[selectedCrop] || premiumMarketData['Cotton'];

  const renderChart = () => {
    const commonProps = {
      data: currentData,
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px', fontSize: '10px' }} />
            <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px', fontSize: '10px' }} />
            <Bar dataKey="price" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="predicted" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} opacity={0.5} />
          </BarChart>
        );
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px', fontSize: '10px' }} />
            <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
            <Area type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none uppercase">Price Forecast</h3>
                <div className="relative group">
                  <select 
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="appearance-none bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-8 py-1.5 rounded-lg cursor-pointer focus:outline-none hover:bg-emerald-100 transition-all"
                  >
                    {Object.keys(cropSpecificData).map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                </div>
              </div>
              <p className="text-slate-400 text-[10px] uppercase font-bold mt-1 tracking-wider leading-none">Historical mandi trends analysis</p>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 mr-2">
                <button 
                  onClick={() => setChartType('area')}
                  className={cn("p-1.5 rounded-md transition-all", chartType === 'area' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <AreaIcon size={14} />
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={cn("p-1.5 rounded-md transition-all", chartType === 'line' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <LineIcon size={14} />
                </button>
                <button 
                  onClick={() => setChartType('bar')}
                  className={cn("p-1.5 rounded-md transition-all", chartType === 'bar' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <BarChart3 size={14} />
                </button>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100 whitespace-nowrap">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div> Actual
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100 whitespace-nowrap">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> AI Predicted
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full" key={`${selectedCrop}-${chartType}`}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden group border-b-4 border-b-emerald-500">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Target size={64} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-emerald-400" size={16} />
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Decision Signal: {selectedCrop}</h4>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 mb-3 shadow-inner">
                <p className={cn(
                  "text-xl font-black tracking-tighter uppercase",
                  currentSignal.signal.includes('SELL') || currentSignal.signal.includes('LIQUIDATE') ? "text-red-400" : "text-emerald-400"
                )}>{currentSignal.signal}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest leading-none">AI Intelligence Engine v4.2</p>
              </div>
              <p className="text-slate-300 text-xs leading-tight mb-4 italic font-serif">
                Prices expected to delta <span className={cn(
                  "font-bold tracking-tight",
                  currentSignal.delta.startsWith('+') ? "text-emerald-400" : "text-red-400"
                )}>{currentSignal.delta}</span>. Target exit: <span className="text-white font-bold">{currentSignal.date}</span>.
              </p>
              <div className="grid grid-cols-2 gap-2">
                 <div className="text-center p-2 bg-slate-800/40 rounded-lg border border-slate-700">
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Market Vol</p>
                    <p className="text-xs font-bold font-mono uppercase tracking-tight text-indigo-400">{currentSignal.vol}</p>
                 </div>
                 <div className="text-center p-2 bg-slate-800/40 rounded-lg border border-slate-700">
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Confidence</p>
                    <p className="text-xs font-bold font-mono text-emerald-400">{currentSignal.conf}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm border-b-2">
             <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2 leading-none">
                <Globe size={14} className="text-indigo-500" />
                Arbitrage Alerts • High Demand Zones
             </h4>
             <div className="space-y-4">
                {higherMarkets.map((market, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-indigo-50/30 border border-indigo-50 group hover:border-indigo-200 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-800">{market.market}</p>
                        <span className="text-[8px] px-1 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">{market.state}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{market.distance} away</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 tracking-tighter">₹{market.price.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                         <span className={cn(
                           "text-[9px] font-black uppercase tracking-tighter",
                           market.trend === 'up' ? "text-emerald-600" : "text-amber-500"
                         )}>
                           {market.trend === 'up' ? '▲ High Yield' : '▼ Local Saturation'}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-4 py-2 border-t border-indigo-50 pt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline text-center">
                View Logistics Routes
             </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm border-b-2">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 leading-none">
                <Info size={14} className="text-emerald-500" />
                Signal Log
             </h4>
             <div className="space-y-3">
                <div className="flex gap-3 items-center group cursor-pointer">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all text-[10px] font-black shadow-sm">P</div>
                   <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Mandi liquidity threshold reached</p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">2h • Logistics</p>
                   </div>
                </div>
                <div className="flex gap-3 items-center group cursor-pointer">
                   <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[10px] font-black shadow-sm">T</div>
                   <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">Inter-state trade volumes rising</p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">1d • Trade Flow</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {prices.map((price, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-600 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-slate-800 leading-none uppercase tracking-tight">{price.name}</span>
                <span className={cn(
                  "p-1 rounded bg-slate-50 border border-slate-100",
                  price.trend === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {price.trend === 'up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-black text-slate-900 tracking-tighter">₹{price.currentPrice.toLocaleString()}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">/ Qtl</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center bg-slate-50/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">AI Outlook</span>
              <span className="text-xs font-black text-emerald-600 tracking-tighter">₹{price.predictedNextWeek.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



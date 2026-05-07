import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Maximize, 
  Calendar, 
  Layers, 
  Info, 
  Search,
  Download,
  Share2,
  RefreshCw,
  Zap,
  Activity,
  Hexagon,
  Navigation,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Point {
  x: number;
  y: number;
}

interface Asset {
  id: string;
  type: 'polygon' | 'line' | 'point';
  points: Point[];
  label: string;
  createdAt: string;
}

interface FarmData {
  id: string;
  name: string;
  ndviScore: number;
  cropType: string;
  area: number;
  boundary?: Point[];
  boundaryUpdatedAt?: any;
  assets?: Asset[];
}

const staticPeriods = [
  { id: 't1', label: '01 May 2026', ndvi: 0.72, status: 'Peak' },
  { id: 't2', label: '24 Apr 2026', ndvi: 0.65, status: 'Growth' },
  { id: 't3', label: '10 Apr 2026', ndvi: 0.58, status: 'Emergence' },
  { id: 't4', label: '28 Mar 2026', ndvi: 0.42, status: 'Sowing' },
];

const mapAssets = {
  t1: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop',
  t2: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop',
  t3: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop',
  t4: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2000&auto=format&fit=crop',
  live: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop',
};

export const SatelliteAnalysis = () => {
  const [farms, setFarms] = useState<FarmData[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(staticPeriods[0]);
  const [scale, setScale] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'polygon' | 'line' | 'point'>('polygon');
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isDrawing || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint = { x, y };

    if (drawingMode === 'point') {
      saveAsset('point', [newPoint]);
    } else {
      setDrawingPoints(prev => [...prev, newPoint]);
    }
  };

  const saveAsset = async (type: 'polygon' | 'line' | 'point', points: Point[]) => {
    if (!selectedFarm) return;

    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      points,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} asset`,
      createdAt: new Date().toISOString()
    };

    try {
      const farmRef = doc(db, 'farms', selectedFarm.id);
      const updatedAssets = [...(selectedFarm.assets || []), newAsset];
      await setDoc(farmRef, { assets: updatedAssets }, { merge: true });
      setSelectedFarm(prev => prev ? { ...prev, assets: updatedAssets } : null);
      setIsDrawing(false);
      setDrawingPoints([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `farms/${selectedFarm.id}/assets`);
    }
  };

  const saveBoundary = async () => {
    if (!selectedFarm || drawingPoints.length < 3) return;

    if (drawingMode !== 'polygon') {
      saveAsset(drawingMode, drawingPoints);
      return;
    }

    try {
      const farmRef = doc(db, 'farms', selectedFarm.id);
      const now = new Date().toISOString();
      await setDoc(farmRef, { 
        boundary: drawingPoints,
        boundaryUpdatedAt: serverTimestamp()
      }, { merge: true });
      
      setSelectedFarm(prev => prev ? { 
        ...prev, 
        boundary: drawingPoints,
        boundaryUpdatedAt: now
      } : null);
      
      setIsDrawing(false);
      setDrawingPoints([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `farms/${selectedFarm.id}`);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'farms'),
      where('ownerId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const farmsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FarmData[];
      
      setFarms(farmsData);
      if (farmsData.length > 0) {
        if (!selectedFarm) {
          setSelectedFarm(farmsData[0]);
        } else {
          // Keep the selected farm in sync with the latest data from the list
          const updated = farmsData.find(f => f.id === selectedFarm.id);
          if (updated) setSelectedFarm(updated);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'farms');
    });

    return () => unsubscribe();
  }, []);

  const timePeriods = [
    ...(selectedFarm ? [{ 
      id: 'live', 
      label: 'Live Sensor', 
      ndvi: selectedFarm.ndviScore, 
      status: selectedFarm.ndviScore > 0.7 ? 'Vigorous' : 'Normal' 
    }] : []),
    ...staticPeriods
  ];
  
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));
  const handleReset = () => setScale(1);

  const currentNDVI = selectedPeriod.id === 'live' ? selectedFarm?.ndviScore || 0 : selectedPeriod.ndvi;
  const currentStatus = selectedPeriod.id === 'live' 
    ? (selectedFarm?.ndviScore ? (selectedFarm.ndviScore > 0.7 ? 'Vigorous' : 'Normal') : 'N/A') 
    : selectedPeriod.status;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm border-b-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg text-white flex items-center justify-center shadow-md">
            <Maximize size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none">Geospatial Studio</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 leading-none">
              {selectedFarm ? `Plot: ${selectedFarm.name} • ${selectedFarm.cropType}` : 'Multi-Spectral NDVI Time-Series'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {timePeriods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border cursor-pointer active:scale-95 flex items-center gap-2",
                selectedPeriod.id === period.id 
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20" 
                  : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200"
              )}
            >
              {period.id === 'live' ? <Activity size={12} className="animate-pulse" /> : <Calendar size={12} />}
              {period.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select 
            className="bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg focus:outline-none"
            onChange={(e) => {
              const farm = farms.find(f => f.id === e.target.value);
              if (farm) setSelectedFarm(farm);
            }}
            value={selectedFarm?.id || ''}
          >
            {farms.map(farm => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
            {farms.length === 0 && <option value="">No Farms Connected</option>}
          </select>
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button 
              onClick={() => { setIsDrawing(!isDrawing); setDrawingPoints([]); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                isDrawing ? "bg-red-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Activity size={12} />
              {isDrawing ? 'Cancel' : 'Draw'}
            </button>
            {isDrawing && (
              <div className="flex ml-1 gap-1 border-l pl-1 border-slate-100 items-center">
                <button 
                  onClick={() => setDrawingMode('polygon')}
                  className={cn("p-1.5 rounded-md transition-all", drawingMode === 'polygon' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "text-slate-400 hover:text-slate-600")}
                  title="Polygon"
                >
                  <Hexagon size={14} />
                </button>
                <button 
                  onClick={() => setDrawingMode('line')}
                  className={cn("p-1.5 rounded-md transition-all", drawingMode === 'line' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "text-slate-400 hover:text-slate-600")}
                  title="Line"
                >
                  <Navigation size={14} />
                </button>
                <button 
                  onClick={() => setDrawingMode('point')}
                  className={cn("p-1.5 rounded-md transition-all", drawingMode === 'point' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "text-slate-400 hover:text-slate-600")}
                  title="Point"
                >
                  <MapPin size={14} />
                </button>
                <div className="w-[1px] h-4 bg-slate-100 mx-1"></div>
                <button 
                  onClick={() => setDrawingPoints(prev => prev.slice(0, -1))}
                  disabled={drawingPoints.length === 0}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-500 disabled:opacity-30"
                  title="Undo Point"
                >
                  <RefreshCw size={12} className="-scale-x-100" />
                </button>
                <button 
                  onClick={() => setDrawingPoints([])}
                  disabled={drawingPoints.length === 0}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 disabled:opacity-30"
                  title="Clear All"
                >
                  <Plus size={12} className="rotate-45" />
                </button>
              </div>
            )}
          </div>
          <button className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all border border-slate-700 shadow-lg active:scale-90">
             <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Main Viewport */}
        <div className="flex-1 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800 shadow-2xl group/viewport cursor-crosshair">
          {/* Zoom Level Indicator */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
             <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-emerald-400 border border-emerald-900/50 uppercase tracking-widest">
                Zoom: {scale.toFixed(1)}x
             </div>
             <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-white/50 border border-slate-800 uppercase tracking-widest">
                Sat: Sentinel-2C
             </div>
          </div>

          {/* Interactive Layer */}
          <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <motion.div 
              ref={mapRef}
              drag={!isDrawing}
              dragConstraints={containerRef}
              style={{ scale }}
              onClick={handleMapClick}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full relative flex items-center justify-center p-20"
            >
               <img 
                 src={mapAssets[selectedPeriod.id as keyof typeof mapAssets] || mapAssets.t1} 
                 alt="Satellite NDVI" 
                 className="w-full h-full object-cover rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] opacity-80"
                 draggable={false}
               />
               <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply rounded-lg"></div>
               
               {/* Drawing/Boundary Overlay */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                 {/* Saved Boundary */}
                 {selectedFarm?.boundary && selectedFarm.boundary.length > 0 && (
                   <polygon 
                     points={selectedFarm.boundary.map(p => `${p.x}%,${p.y}%`).join(' ')}
                     className="fill-emerald-500/20 stroke-emerald-500 stroke-[2px] opacity-60"
                   />
                 )}

                 {/* Saved Assets */}
                 {selectedFarm?.assets?.map((asset) => (
                   <g key={asset.id} className="cursor-pointer group/asset">
                     {asset.type === 'polygon' && (
                       <g shadow-lg="true">
                         <polygon 
                           points={asset.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                           className="fill-blue-500/10 stroke-blue-500 stroke-[2px] transition-all group-hover/asset:fill-blue-500/20"
                         />
                         <text 
                           x={`${asset.points[0].x}%`} 
                           y={`${asset.points[0].y}%`} 
                           className="fill-blue-400 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/asset:opacity-100 transition-opacity pointer-events-none"
                           dy="-5"
                         >
                           {asset.label}
                         </text>
                       </g>
                     )}
                     {asset.type === 'line' && (
                       <g>
                         <polyline 
                           points={asset.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                           className="fill-none stroke-amber-500 stroke-[3px] stroke-round transition-all group-hover/asset:stroke-amber-400"
                         />
                         <text 
                           x={`${asset.points[0].x}%`} 
                           y={`${asset.points[0].y}%`} 
                           className="fill-amber-400 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/asset:opacity-100 transition-opacity pointer-events-none"
                           dy="-5"
                         >
                           {asset.label}
                         </text>
                       </g>
                     )}
                     {asset.type === 'point' && (
                       <g>
                         <circle 
                           cx={`${asset.points[0].x}%`} 
                           cy={`${asset.points[0].y}%`} 
                           r="8" 
                           className="fill-rose-600 stroke-white stroke-[2px] shadow-lg transition-all group-hover/asset:scale-110 group-hover/asset:fill-rose-500"
                         />
                         <text 
                           x={`${asset.points[0].x}%`} 
                           y={`${asset.points[0].y}%`} 
                           className="fill-rose-400 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/asset:opacity-100 transition-opacity pointer-events-none"
                           dy="-12"
                           textAnchor="middle"
                         >
                           {asset.label}
                         </text>
                       </g>
                     )}
                   </g>
                 ))}
                 
                 {/* Active Drawing */}
                 {drawingPoints.length > 0 && (
                   <>
                     {drawingMode === 'polygon' && (
                       <polygon 
                         points={drawingPoints.map(p => `${p.x}%,${p.y}%`).join(' ')}
                         className="fill-white/10 stroke-white stroke-[2px] stroke-dasharray-[4,4]"
                       />
                     )}
                     {drawingMode === 'line' && (
                       <polyline 
                         points={drawingPoints.map(p => `${p.x}%,${p.y}%`).join(' ')}
                         className="fill-none stroke-white stroke-[2px] stroke-dasharray-[4,4]"
                       />
                     )}
                     {drawingPoints.map((p, i) => (
                       <circle 
                         key={i} 
                         cx={`${p.x}%`} 
                         cy={`${p.y}%`} 
                         r="4" 
                         className="fill-white stroke-slate-900 stroke-[1px]" 
                       />
                     ))}
                   </>
                 )}
               </svg>

               {/* Polygons / Overlays simulated with CSS */}
               <div className="absolute inset-20 border-2 border-emerald-500/10 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 p-2 bg-emerald-500 text-slate-950 text-[8px] font-black uppercase">
                    {selectedFarm ? `Active Plot: ${selectedFarm.name}` : 'Scanning...'}
                  </div>
               </div>

               {/* Grid Overlay */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </motion.div>
          </div>

          {/* Viewport Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
             {isDrawing && ((drawingMode === 'polygon' && drawingPoints.length >= 3) || (drawingMode === 'line' && drawingPoints.length >= 2)) && (
               <motion.button 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={() => {
                   if (drawingPoints.length > 0) {
                     saveAsset(drawingMode, drawingPoints);
                   }
                 }}
                 className="px-6 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-emerald-500 flex items-center gap-2"
               >
                 <Activity size={16} /> Save {drawingMode}
               </motion.button>
             )}

             <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl">
                <button onClick={handleZoomOut} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"><Minus size={18}/></button>
                <button onClick={handleReset} className="px-4 py-2 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-slate-700/50">Reset View</button>
                <button onClick={handleZoomIn} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"><Plus size={18}/></button>
             </div>
          </div>

          {/* Map Legend */}
          <div className="absolute right-6 top-6 z-20 flex flex-col gap-4">
             <div className="bg-slate-950/80 backdrop-blur-xl p-4 rounded-xl border border-slate-800 w-48 shadow-2xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">NDVI Calibration</h4>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                         <span className="text-[10px] font-bold text-slate-300">Healthy</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-500">&gt; 0.8</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]"></div>
                         <span className="text-[10px] font-bold text-slate-300">Normal</span>
                      </div>
                      <span className="text-[10px] font-mono text-lime-400">0.5 - 0.7</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></div>
                         <span className="text-[10px] font-bold text-slate-300">Stress</span>
                      </div>
                      <span className="text-[10px] font-mono text-orange-500">0.3 - 0.4</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                         <span className="text-[10px] font-bold text-slate-300">Sparse</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-500">&lt; 0.2</span>
                   </div>
                </div>
                
                <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-lime-400 to-emerald-500 rounded-full mt-6"></div>
             </div>

             <div className="bg-slate-950/80 backdrop-blur-xl p-4 rounded-xl border border-slate-800 w-48 shadow-2xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Zap size={14} className="text-yellow-400" />
                   AI Insights
                </h4>
                <p className="text-[10px] text-slate-300 leading-tight italic font-serif">
                   "Vigorous biomass detected in East Sector. Biomass gain of +15% vs last week."
                </p>
             </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
           <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm border-b-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Plot Metrics</h3>
              <div className="space-y-4">
                 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Current NDVI Mean</p>
                    <div className="flex justify-between items-baseline">
                       <span className="text-2xl font-black text-slate-800">{currentNDVI}</span>
                       <span className={cn(
                         "text-[10px] font-black uppercase",
                         currentNDVI > 0.6 ? "text-emerald-600" : "text-orange-600"
                       )}>{currentStatus}</span>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Atmospheric Correction</p>
                    <p className="text-xs font-bold text-slate-700">6S Model Applied</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Anomalies Detected</h3>
              <div className="space-y-3">
                 <div className="flex gap-3 group cursor-pointer">
                    <div className="w-8 h-8 bg-red-50 border border-red-100 rounded flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-all shrink-0">!</div>
                    <div>
                       <p className="text-[11px] font-black text-slate-800 leading-none">Chlorophyll Drop</p>
                       <p className="text-[9px] text-slate-400 mt-1">Section 4A • Prob: 84%</p>
                    </div>
                 </div>
                 <div className="flex gap-3 group cursor-pointer">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">?</div>
                    <div>
                       <p className="text-[11px] font-black text-slate-800 leading-none">Water Stress</p>
                       <p className="text-[9px] text-slate-400 mt-1">Section 2B • Irrigation check</p>
                    </div>
                 </div>
              </div>
              
              <button className="w-full mt-8 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-95">
                 Request High-Res Capture
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

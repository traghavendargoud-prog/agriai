import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Sparkles, TrendingUp, Globe } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 1000);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-emerald-950 flex flex-col items-center justify-center text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)]"></div>
            </div>
            
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center gap-8"
            >
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150"
                    ></motion.div>
                    <div className="p-8 bg-emerald-500 rounded-[2.5rem] shadow-2xl shadow-emerald-500/40 relative z-10 border-4 border-emerald-400">
                        <Leaf className="text-emerald-950" size={80} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <motion.h1 
                        initial={{ tracking: "0.2em", opacity: 0 }}
                        animate={{ tracking: "0.05em", opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-6xl font-black text-white"
                    >
                        AGRISIGHT AI
                    </motion.h1>
                    <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3">
                        <Sparkles size={16} /> Predict • Grow • Profit
                    </p>
                </div>

                <div className="w-80 space-y-4">
                    <div className="h-1.5 bg-emerald-900/50 rounded-full overflow-hidden border border-emerald-800/30">
                        <motion.div 
                            className="h-full bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></motion.div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-emerald-500/60">
                        <span>{progress < 30 ? 'Initializing Engines' : progress < 70 ? 'Fetching Satellite Data' : 'AI Optimization'}</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-12 flex gap-12 opacity-30">
                <div className="flex items-center gap-2"><Globe size={18}/><span>Multi-Satellite</span></div>
                <div className="flex items-center gap-2"><TrendingUp size={18}/><span>ML Forecasting</span></div>
            </div>
        </div>
    );
};

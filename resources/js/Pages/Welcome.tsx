import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { MousePointerClick } from 'lucide-react';

export default function Welcome({
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    
    // Generate organic particles only on client-side to prevent hydration mismatch
    const [particles, setParticles] = useState<{ id: number; left: string; size: string; delay: string; duration: string; opacity: number }[]>([]);
    
    // Clueless indicator timer state
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        // Generate organic particles
        const generated = Array.from({ length: 18 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${6 + Math.random() * 14}px`,
            delay: `${Math.random() * -10}s`, // Negative delay so they start immediately
            duration: `${15 + Math.random() * 15}s`,
            opacity: 0.15 + Math.random() * 0.35,
        }));
        setParticles(generated);

        // Trigger helper after 5 seconds
        const timer = setTimeout(() => {
            setShowHint(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title="Ba-Yu Gateway" />
            
            {/* Custom Animations injected via a style block to ensure standalone compatibility */}
            <style>{`
                @keyframes ripple {
                    0% {
                        transform: translate(-50%, -50%) scale(0.85);
                        opacity: 0.7;
                        border-color: rgba(93, 92, 230, 0.6);
                        box-shadow: 0 0 15px rgba(93, 92, 230, 0.2);
                    }
                    50% {
                        border-color: rgba(139, 92, 246, 0.4);
                        box-shadow: 0 0 25px rgba(139, 92, 246, 0.3);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2.3);
                        opacity: 0;
                        border-color: rgba(6, 182, 212, 0);
                        box-shadow: 0 0 40px rgba(6, 182, 212, 0);
                    }
                }
                
                @keyframes float-particle {
                    0% {
                        transform: translateY(110vh) scale(0.8);
                    }
                    50% {
                        transform: translateY(40vh) scale(1.1) translateX(15px);
                    }
                    100% {
                        transform: translateY(-10vh) scale(0.7) translateX(-15px);
                    }
                }

                @keyframes pulse-portal {
                    0% {
                        transform: translate(-50%, -50%) scale(0.95);
                        opacity: 0.12;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.05);
                        opacity: 0.18;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(0.95);
                        opacity: 0.12;
                    }
                }

                .ripple-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    border: 1px solid;
                    pointer-events: none;
                }

                .ripple-1 {
                    animation: ripple 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
                }
                .ripple-2 {
                    animation: ripple 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
                    animation-delay: 1.3s;
                }
                .ripple-3 {
                    animation: ripple 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
                    animation-delay: 2.6s;
                }

                .portal-glow-pulse {
                    animation: pulse-portal 10s ease-in-out infinite;
                }

                .floating-particle {
                    position: absolute;
                    bottom: -20px;
                    border-radius: 50%;
                    pointer-events: none;
                    background: radial-gradient(circle, rgba(93, 92, 230, 0.5) 0%, rgba(93, 92, 230, 0) 70%);
                    animation: float-particle linear infinite;
                }

                @keyframes pulse-helper {
                    0% {
                        transform: scale(0.96);
                        opacity: 0.75;
                    }
                    50% {
                        transform: scale(1.04);
                        opacity: 1;
                        filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.7));
                    }
                    100% {
                        transform: scale(0.96);
                        opacity: 0.75;
                    }
                }
                .pulse-helper-anim {
                    animation: pulse-helper 2.5s ease-in-out infinite;
                }
            `}</style>

            <div className="relative min-h-screen w-full bg-[#020105] text-slate-100 overflow-hidden flex items-center justify-center font-sans select-none">
                
                {/* 1. Subtle Space Grid & Dot Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1.2px,transparent_1.2px)] bg-[size:16px_16px] pointer-events-none z-0" />
                
                {/* 2. Ambient Grain Overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* 3. Glowing Portal Light underneath the button */}
                <div className="absolute top-1/2 left-1/2 w-[90vw] h-[90vw] max-w-[650px] max-h-[650px] rounded-full blur-[140px] pointer-events-none z-0 portal-glow-pulse"
                     style={{ 
                         background: 'radial-gradient(circle, rgba(93,92,230,0.75) 0%, rgba(139,92,246,0.3) 40%, transparent 70%)' 
                     }} 
                />

                {/* 4. Drifting Organic Particles in the background */}
                {particles.map((p) => (
                    <div 
                        key={p.id}
                        className="floating-particle"
                        style={{
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            animationDelay: p.delay,
                            animationDuration: p.duration,
                            opacity: p.opacity,
                        }}
                    />
                ))}

                {/* 5. The Big Pulsing Interactive Button */}
                <div className="relative z-10 flex flex-col items-center">
                    <a 
                        href="/app" 
                        className="relative group block"
                    >
                        {/* Ripple Waves radiating outward */}
                        <div className="ripple-circle ripple-1 w-32 h-32 md:w-40 md:h-40" />
                        <div className="ripple-circle ripple-2 w-32 h-32 md:w-40 md:h-40" />
                        <div className="ripple-circle ripple-3 w-32 h-32 md:w-40 md:h-40" />

                        {/* Circular Portal Button */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black/60 border border-white/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(93,92,230,0.3),inset_0_2px_8px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(93,92,230,0.6),inset_0_2px_12px_rgba(255,255,255,0.2)] hover:border-white/20 transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden backdrop-blur-md">
                            {/* High-quality interior lighting glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#5D5CE6]/20 via-transparent to-[#8B5CF6]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            {/* Logo centered */}
                            <img 
                                src="/logo.svg" 
                                alt="Ba-Yu Logo" 
                                className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_12px_rgba(93,92,230,0.4)] transition-transform duration-500 group-hover:scale-110" 
                            />
                        </div>
                    </a>

                    {/* 6. Elegant Clueless Helper Indicator (Fades in after 5s) */}
                    <div className={`absolute top-full mt-8 flex flex-col items-center gap-2.5 transition-all duration-1000 ease-out ${
                        showHint ? 'opacity-85 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}>
                        <div className="pulse-helper-anim flex flex-col items-center gap-1.5">
                            <MousePointerClick className="w-5 h-5 text-[#8B5CF6] filter drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                        </div>
                    </div>
                </div>

                {/* 7. Subtle background copyright/hint footer (extremely low-opacity) */}
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10 opacity-20">
                    <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-slate-500">
                        Ba-Yu Gateway
                    </p>
                </div>
            </div>
        </>
    );
}

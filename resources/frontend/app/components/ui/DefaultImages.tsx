import { FileText, User, BookOpen, Calculator, Atom, Beaker, Globe, History, Languages, Code, HeartPulse, HardHat, Sprout, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mataPelajaran } from '../../data/mockData';

/**
 * Default thumbnail placeholder for notes without images.
 * Shows a varied background color and icon based on subject.
 */
export function DefaultThumbnail({ 
    className = "", 
    subject,
    title
}: { 
    className?: string;
    subject?: string;
    title?: string;
}) {
    // Find subject data from mockData
    const subjectData = mataPelajaran.find(m => m.name === subject || m.id === subject);
    
    // Fallback colors if subject not found
    const fallbackColors = [
        'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
        'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        'bg-amber-100 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400',
        'bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400',
        'bg-sky-100 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400',
        'bg-purple-100 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400',
    ];

    // Simple hash function for consistent color based on title or subject
    const getHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const hash = getHash(subject || title || "Ba-Yu");
    const colorClass = subjectData 
        ? "" // We'll use inline style for custom hex colors
        : fallbackColors[hash % fallbackColors.length];

    const icon = subjectData?.icon || "📘";

    return (
        <div 
            className={`flex items-center justify-center ${colorClass} ${className} transition-all duration-500 relative`}
            style={subjectData ? { backgroundColor: `${subjectData.color}25` } : {}}
        >
            <div className="flex flex-col items-center gap-2 transition-transform duration-500">
                {subjectData ? (
                    <span className="text-5xl sm:text-6xl drop-shadow-sm">{icon}</span>
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-80">
                        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
                    </div>
                )}
            </div>
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
    );
}

/**
 * Default avatar placeholder for users without profile pictures.
 * Shows a soft gray circle with a person silhouette.
 */
export function DefaultAvatar({ size = 20, className = "" }: { size?: number; className?: string }) {
    return (
        <div 
            className={`flex items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 shrink-0 ${className} border border-slate-300/20 dark:border-white/5 shadow-inner`}
            style={{ width: size, height: size }}
        >
            <User className="text-slate-500 dark:text-slate-400" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.5} />
        </div>
    );
}

/**
 * Avatar image with automatic fallback to DefaultAvatar.
 * Use this as a drop-in replacement for <img> tags showing user avatars.
 */
export function AvatarImage({ 
    src, 
    alt, 
    size = 20, 
    className = "" 
}: { 
    src?: string | null; 
    alt?: string; 
    size?: number; 
    className?: string;
}) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (!src || hasError) {
        return <DefaultAvatar size={size} className={className} />;
    }

    return (
        <img
            src={src}
            alt={alt || "User"}
            className={`rounded-full object-cover ${className}`}
            style={{ width: size, height: size }}
            onError={() => setHasError(true)}
        />
    );
}

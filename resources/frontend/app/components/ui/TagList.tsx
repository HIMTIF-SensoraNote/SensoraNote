import React, { useState } from 'react';

interface TagListProps {
    tags?: string[];
    className?: string; // Optional class to override default margins
}

export function TagList({ tags, className = "mb-6 mt-auto" }: TagListProps) {
    const [expanded, setExpanded] = useState(false);

    if (!tags || tags.length === 0) return null;

    const visibleTags = expanded ? tags : tags.slice(0, 3);
    const hiddenCount = tags.length - 3;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
            {visibleTags.map((tag, idx) => (
                <span 
                    key={idx} 
                    className="px-2.5 py-1 bg-gray-100/80 dark:bg-white/5 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-md text-[11px] font-['Manrope'] font-bold transition-colors hover:bg-gray-100 dark:hover:bg-white/10 cursor-default"
                >
                    {tag}
                </span>
            ))}
            {!expanded && hiddenCount > 0 && (
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpanded(true);
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-[#1C1A29] text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-md text-[11px] font-['Manrope'] font-bold hover:bg-gray-50 dark:hover:bg-white/10 hover:text-primary transition-colors cursor-pointer focus:outline-none"
                >
                    +{hiddenCount} lainnya
                </button>
            )}
            {expanded && hiddenCount > 0 && (
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpanded(false);
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-[#1C1A29] text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-md text-[11px] font-['Manrope'] font-bold hover:bg-gray-50 dark:hover:bg-white/10 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
                >
                    Tutup
                </button>
            )}
        </div>
    );
}

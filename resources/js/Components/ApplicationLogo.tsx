import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="bayuLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#5D5CE6" />
                </linearGradient>
                <linearGradient id="bayuDark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5D5CE6" />
                    <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>
                <linearGradient id="windTrail" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
                </linearGradient>
            </defs>
            <path d="M 12 68 Q 25 65 35 75 T 52 68" stroke="url(#windTrail)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 15 45 Q 25 50 35 40 T 48 45" stroke="url(#windTrail)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 8 82 Q 20 80 30 90 T 45 82" stroke="url(#windTrail)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <g strokeLinejoin="round" strokeLinecap="round">
                <path d="M 88 12 Q 45 20 12 40 Q 25 46 40 52 Z" fill="url(#bayuLight)" stroke="url(#bayuLight)" strokeWidth="2" />
                <path d="M 88 12 Q 70 50 58 88 Q 50 72 40 52 Z" fill="url(#bayuDark)" stroke="url(#bayuDark)" strokeWidth="2" />
                <path d="M 40 52 L 40 72 L 48 64 Z" fill="#312E81" stroke="#312E81" strokeWidth="2" opacity="0.8" />
            </g>
            <circle cx="80" cy="18" r="2.5" fill="#FFD166" />
            <circle cx="22" cy="75" r="1.5" fill="#FFD166" opacity="0.9" />
            <circle cx="65" cy="88" r="2" fill="#FFD166" opacity="0.7" />
        </svg>
    );
}

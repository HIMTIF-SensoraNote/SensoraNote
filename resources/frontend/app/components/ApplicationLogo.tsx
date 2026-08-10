import React from 'react';

export type PremiumLogoVariant = 'spectrum-pages';

interface ApplicationLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: PremiumLogoVariant;
  className?: string;
}

/**
 * Clean, Solid Abstract Logo for SensoraNote
 * "The Spectrum Pages" (Lembaran Spektrum)
 * Resolves all previous issues:
 * 1. NO anatomical/skeletal shapes (pure solid rectangles).
 * 2. NO medical EKG lines.
 * 3. Clearly reads as an Open Book (Note).
 * 4. Vibrant fanned color spectrum represents Diversity & Inclusivity.
 * 5. Golden Spark represents Sensora / AI.
 */
export default function ApplicationLogo({
  size = 36,
  variant = 'spectrum-pages',
  className = '',
  ...props
}: ApplicationLogoProps) {
  // Variant: The Spectrum Pages
  // Three solid, perfectly proportioned document pages fanning out.
  // Back Left: Warm Spectrum (Violet/Pink) - Humanity/Touch
  // Back Right: Earth Spectrum (Teal/Emerald) - Environment/Sound
  // Front Center: Core Spectrum (Blue/Cyan) - Note/Structure
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="page-left" x1="13" y1="12" x2="27" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" /> {/* Purple */}
          <stop offset="1" stopColor="#ec4899" /> {/* Pink */}
        </linearGradient>
        
        <linearGradient id="page-right" x1="13" y1="12" x2="27" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" /> {/* Teal */}
          <stop offset="1" stopColor="#10b981" /> {/* Emerald */}
        </linearGradient>

        <linearGradient id="page-center" x1="13" y1="12" x2="27" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" /> {/* Royal Blue */}
          <stop offset="1" stopColor="#0ea5e9" /> {/* Sky Blue */}
        </linearGradient>
      </defs>

      {/* Back Left Page (Warm Spectrum - Inclusivity/Humanity) */}
      <rect
        x="13"
        y="12"
        width="14"
        height="24"
        rx="3"
        fill="url(#page-left)"
        transform="rotate(-30 20 36)"
        className="shadow-sm"
      />

      {/* Back Right Page (Nature Spectrum - Senses/Sound) */}
      <rect
        x="13"
        y="12"
        width="14"
        height="24"
        rx="3"
        fill="url(#page-right)"
        transform="rotate(30 20 36)"
        className="shadow-sm"
      />

      {/* Front Center Page (Core Platform - Note) */}
      {/* Acts as the spine/cover binding them together */}
      <rect
        x="13"
        y="12"
        width="14"
        height="24"
        rx="3"
        fill="url(#page-center)"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="1"
      />

      {/* Sensora AI / Accessibility Sparkle */}
      <path
        d="M20 2 L21.5 6.5 L26 8 L21.5 9.5 L20 14 L18.5 9.5 L14 8 L18.5 6.5 L20 2 Z"
        fill="#f59e0b"
      />
    </svg>
  );
}
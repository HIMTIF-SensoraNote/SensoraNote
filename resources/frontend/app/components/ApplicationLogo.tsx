import React, { useId } from 'react';

export type PremiumLogoVariant = 'spectrum-pages';

interface ApplicationLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  variant?: PremiumLogoVariant;
  className?: string;
}

/**
 * Clean, Solid Abstract Logo for SensoraNote
 * "The Spectrum Pages" (Lembaran Spektrum)
 */
export default function ApplicationLogo({
  size = 36,
  variant = 'spectrum-pages',
  className = '',
  ...props
}: ApplicationLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const leftGradId = `page-left-${uid}`;
  const rightGradId = `page-right-${uid}`;
  const centerGradId = `page-center-${uid}`;

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
        <linearGradient id={leftGradId} x1="13" y1="12" x2="27" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        
        <linearGradient id={rightGradId} x1="13" y1="12" x2="27" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id={centerGradId} x1="13" y1="12" x2="27" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Back Left Page */}
      <rect
        x="13"
        y="12"
        width="14"
        height="24"
        rx="3"
        fill={`url(#${leftGradId})`}
        transform="rotate(-30 20 36)"
      />

      {/* Back Right Page */}
      <rect
        x="13"
        y="12"
        width="14"
        height="24"
        rx="3"
        fill={`url(#${rightGradId})`}
        transform="rotate(30 20 36)"
      />

      {/* Front Center Page */}
      <rect
        x="13"
        y="12"
        width="14"
        height="24"
        rx="3"
        fill={`url(#${centerGradId})`}
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="1"
      />

      {/* Sensora AI Golden Sparkle */}
      <path
        d="M20 2 L21.5 6.5 L26 8 L21.5 9.5 L20 14 L18.5 9.5 L14 8 L18.5 6.5 L20 2 Z"
        fill="#f59e0b"
      />
    </svg>
  );
}
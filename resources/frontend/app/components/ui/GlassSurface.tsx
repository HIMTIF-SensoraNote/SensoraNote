import React from 'react';
import './GlassSurface.css';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 54,
  height = 54,
  borderRadius = 27,
  className = '',
  style = {},
  onClick
}) => {
  const containerStyle: React.CSSProperties = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
  };

  return (
    <div
      onClick={onClick}
      className={`glass-surface ${className}`}
      style={containerStyle}
    >
      <div className="glass-surface__content">{children}</div>
    </div>
  );
};

export default GlassSurface;

import React from 'react';
import type { LucideProps } from 'lucide-react';

// Type-safe wrapper for Lucide icons
export const createIcon = (IconComponent: any) => {
  const WrappedIcon = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
    return React.createElement(IconComponent, { ...props, ref });
  });
  
  WrappedIcon.displayName = `Icon(${IconComponent.displayName || IconComponent.name || 'Component'})`;
  
  return WrappedIcon;
};

// Utility to render any Lucide icon safely
export const renderIcon = (IconComponent: any, props: LucideProps = {}) => {
  return React.createElement(IconComponent, props);
}; 
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  // Fix for React version conflicts
  type ReactNode = import('react').ReactNode | bigint;
}

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react'
  
  export interface LucideProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
    size?: string | number
    absoluteStrokeWidth?: boolean
  }
  
  export type LucideIcon = ComponentType<LucideProps>
  
  // Declare all your icons as compatible components
  export const ArrowRight: LucideIcon
  export const Users: LucideIcon
  export const MessageSquare: LucideIcon
  export const Bell: LucideIcon
  export const Shield: LucideIcon
  export const Zap: LucideIcon
  export const CheckCircle: LucideIcon
  export const Star: LucideIcon
  export const Sparkles: LucideIcon
  export const Rocket: LucideIcon
  export const Target: LucideIcon
  export const TrendingUp: LucideIcon
  export const Award: LucideIcon
  export const Globe: LucideIcon
  export const Lock: LucideIcon
  export const Clock: LucideIcon
  export const Heart: LucideIcon
  export const Play: LucideIcon
  export const ChevronDown: LucideIcon
  export const Menu: LucideIcon
  export const X: LucideIcon
  export const User: LucideIcon
  export const Mail: LucideIcon
  export const EyeOff: LucideIcon
  export const Eye: LucideIcon
  export const Check: LucideIcon
  export const Briefcase: LucideIcon
  export const MessageCircle: LucideIcon
  export const Phone: LucideIcon
  export const Calendar: LucideIcon
  export const MapPin: LucideIcon
  export const AtSign: LucideIcon
  export const Send: LucideIcon
  export const Settings: LucideIcon
  export const LogOut: LucideIcon
  export const Search: LucideIcon
  export const Plus: LucideIcon
  export const Filter: LucideIcon
}

declare module '@tanstack/react-query-devtools' {
  import { ComponentType } from 'react'
  
  export interface DevtoolsOptions {
    initialIsOpen?: boolean
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
  
  export const ReactQueryDevtools: ComponentType<DevtoolsOptions>
} 
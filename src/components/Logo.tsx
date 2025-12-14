import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <img 
      src="/logocheck-removebg-preview.png" 
      alt="Check Imob Logo" 
      className={cn("object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}


import * as Icons from 'lucide-react';

interface IconComponentProps {
  name: string;
  size?: number;
  className?: string;
}

export function IconComponent({ name, size = 24, className = '' }: IconComponentProps) {
  const IconElement = Icons[name as keyof typeof Icons] as React.ComponentType<any>;
  
  if (!IconElement) {
    return <Icons.Circle size={size} className={className} />;
  }
  
  return <IconElement size={size} className={className} />;
}
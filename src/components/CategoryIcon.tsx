import { IconComponent } from './IconComponent';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ icon, color, size = 24, className = '' }: CategoryIconProps) {
  return (
    <div 
      className={`rounded-full p-2 ${className}`}
      style={{ backgroundColor: `${color}20` }}
    >
      <IconComponent 
        name={icon} 
        size={size} 
        className={`text-${color}`}
        style={{ color }}
      />
    </div>
  );
}
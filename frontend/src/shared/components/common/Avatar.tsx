import { cn } from '../../lib/utils';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

export function Avatar({ name, url, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return <img src={url} alt={name} className={cn('rounded-full object-cover', sizeMap[size], className)} />;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-accent-subtle font-medium text-accent',
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

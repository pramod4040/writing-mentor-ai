import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

const sizeClasses = {
  sm: 'size-9 text-sm',
  md: 'size-14 text-lg',
};

export function UserAvatar({ name, image, size = 'sm', className }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  if (image) {
    return (
      <div
        className={cn(
          'shrink-0 overflow-hidden rounded-full border border-[var(--border)]',
          sizeClasses[size],
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          referrerPolicy="no-referrer"
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] font-semibold',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial || <User className="h-4 w-4" />}
    </div>
  );
}

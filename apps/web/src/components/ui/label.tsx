import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-base font-medium leading-none text-[var(--foreground)]', className)}
      {...props}
    />
  );
}

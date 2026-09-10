import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; title: string }> = {
  info: {
    container: 'bg-sky-50 border-sky-200 text-sky-800',
    icon: 'text-sky-500',
    title: 'text-sky-900',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: 'text-emerald-500',
    title: 'text-emerald-900',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: 'text-amber-500',
    title: 'text-amber-900',
  },
  error: {
    container: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: 'text-rose-500',
    title: 'text-rose-900',
  },
};

const variantIcons: Record<AlertVariant, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  onClose,
  ...props
}) => {
  const Icon = variantIcons[variant];
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn('relative flex gap-3 rounded-lg border p-4 text-sm', styles.container, className)}
      {...props}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1">
        {title && <h5 className={cn('mb-1 font-semibold', styles.title)}>{title}</h5>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

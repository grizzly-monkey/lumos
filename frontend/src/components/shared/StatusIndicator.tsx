import { cn } from '../../lib/utils';

export type StatusVariant = 'healthy' | 'warning' | 'critical' | 'loading';

interface StatusIndicatorProps {
  status: StatusVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withLabel?: boolean;
}

const statusColors: Record<StatusVariant, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
  loading: 'bg-blue-500 animate-pulse',
};

const statusLabels: Record<StatusVariant, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  loading: 'Connecting...',
};

const sizeClasses = {
  sm: 'h-2.5 w-2.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export const StatusIndicator = ({
  status,
  size = 'md',
  className,
  withLabel = false,
}: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full',
          statusColors[status],
          sizeClasses[size],
          className
        )}
        aria-label={`Status: ${status}`}
      />
      {withLabel && (
        <span className="text-sm text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
};

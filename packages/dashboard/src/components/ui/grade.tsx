import { cn } from '@/lib/utils';
import { getGradeInfo, getPerformanceIndicator, type Grade as GradeType } from '@/lib/grades';

interface GradeProps {
  grade: GradeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function Grade({ grade, size = 'md', showLabel = false, className }: GradeProps) {
  const gradeInfo = getGradeInfo(grade);
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  };

  return (
    <div className="flex items-center space-x-2">
      <span
        className={cn(
          'font-bold rounded border-2 inline-flex items-center justify-center',
          gradeInfo.color,
          gradeInfo.bgColor,
          sizeClasses[size],
          className
        )}
        title={gradeInfo.description}
      >
        {grade}
      </span>
      {showLabel && (
        <span className={cn('text-sm', gradeInfo.color)}>
          {gradeInfo.label}
        </span>
      )}
    </div>
  );
}

interface PerformanceIndicatorProps {
  value: number;
  average: number;
  type?: 'duration' | 'success_rate';
  showIcon?: boolean;
  className?: string;
}

export function PerformanceIndicator({ 
  value, 
  average, 
  type = 'success_rate', 
  showIcon = true,
  className 
}: PerformanceIndicatorProps) {
  const indicator = getPerformanceIndicator(value, average, type);
  
  const IconComponent = showIcon ? (
    indicator.icon === 'up' ? (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ) : indicator.icon === 'down' ? (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  ) : null;

  return (
    <span className={cn('flex items-center space-x-1 text-xs', indicator.color, className)}>
      {IconComponent}
      <span>{indicator.label}</span>
    </span>
  );
}

// Re-export the utility function for use in other components
export { getPerformanceIndicator } from '@/lib/grades';
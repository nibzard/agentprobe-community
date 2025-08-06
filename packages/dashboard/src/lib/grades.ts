/**
 * Grade calculation utilities based on AgentProbe CLI grading system
 * A: 90-100%, B: 80-89%, C: 70-79%, D: 60-69%, F: 0-59%
 */

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface GradeInfo {
  grade: Grade;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

/**
 * Calculate grade based on success rate
 */
export function calculateGrade(successRate: number): Grade {
  if (successRate >= 0.9) return 'A';
  if (successRate >= 0.8) return 'B';
  if (successRate >= 0.7) return 'C';
  if (successRate >= 0.6) return 'D';
  return 'F';
}

/**
 * Get comprehensive grade information including colors and descriptions
 */
export function getGradeInfo(grade: Grade): GradeInfo {
  const gradeMap: Record<Grade, GradeInfo> = {
    'A': {
      grade: 'A',
      label: 'Excellent',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      description: '90-100% success rate - Outstanding performance'
    },
    'B': {
      grade: 'B',
      label: 'Good',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      description: '80-89% success rate - Good performance'
    },
    'C': {
      grade: 'C',
      label: 'Average',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      description: '70-79% success rate - Average performance'
    },
    'D': {
      grade: 'D',
      label: 'Below Average',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      description: '60-69% success rate - Below average performance'
    },
    'F': {
      grade: 'F',
      label: 'Failed',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      description: '0-59% success rate - Poor performance'
    }
  };

  return gradeMap[grade];
}

/**
 * Get grade from success rate with full info
 */
export function getGradeFromSuccessRate(successRate: number): GradeInfo {
  const grade = calculateGrade(successRate);
  return getGradeInfo(grade);
}

/**
 * Calculate overall grade for multiple scenarios weighted by number of runs
 */
export function calculateWeightedGrade(scenarios: Array<{
  success_rate: number;
  total_runs: number;
}>): Grade {
  if (scenarios.length === 0) return 'F';
  
  // Calculate weighted average success rate
  const totalRuns = scenarios.reduce((sum, s) => sum + s.total_runs, 0);
  if (totalRuns === 0) return 'F';
  
  const weightedSuccessRate = scenarios.reduce((sum, s) => {
    return sum + (s.success_rate * s.total_runs / totalRuns);
  }, 0);
  
  return calculateGrade(weightedSuccessRate);
}

/**
 * Get performance indicator relative to average
 */
export function getPerformanceIndicator(
  value: number,
  average: number,
  type: 'duration' | 'success_rate' = 'success_rate'
): {
  label: string;
  color: string;
  icon: 'up' | 'down' | 'neutral';
} {
  const threshold = 0.1; // 10% threshold for "similar"
  const ratio = value / average;
  
  if (type === 'duration') {
    // For duration, lower is better
    if (ratio <= (1 - threshold)) {
      return {
        label: 'faster than average',
        color: 'text-green-600',
        icon: 'up'
      };
    } else if (ratio >= (1 + threshold)) {
      return {
        label: 'slower than average',
        color: 'text-red-600',
        icon: 'down'
      };
    } else {
      return {
        label: 'average speed',
        color: 'text-gray-600',
        icon: 'neutral'
      };
    }
  } else {
    // For success rate, higher is better
    if (ratio >= (1 + threshold)) {
      return {
        label: 'above average',
        color: 'text-green-600',
        icon: 'up'
      };
    } else if (ratio <= (1 - threshold)) {
      return {
        label: 'below average',
        color: 'text-red-600',
        icon: 'down'
      };
    } else {
      return {
        label: 'average performance',
        color: 'text-gray-600',
        icon: 'neutral'
      };
    }
  }
}
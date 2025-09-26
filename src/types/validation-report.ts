export interface ValidationReportMessage {
  type: string;
  message: string;
}

export interface ValidationReportLessonEntry {
  file: string;
  problems: ValidationReportMessage[];
  warnings: ValidationReportMessage[];
  lessonId?: string;
}

export interface ValidationReportCourseEntry {
  id: string;
  lessonsTotal: number;
  lessonsWithIssues: number;
  problems: number;
  warnings: number;
  lessons: ValidationReportLessonEntry[];
}

export interface ValidationReportTotals {
  courses: number;
  lessons: number;
  lessonsWithIssues: number;
  problems: number;
  warnings: number;
}

export type ValidationReportStatus = 'passed' | 'passed-with-warnings' | 'failed';

export interface ValidationReportGenerationEntry {
  id: string;
  generatedBy?: string;
  model?: string;
  timestamp?: string;
  available?: boolean;
  type?: string;
}

export interface ValidationReportGenerationSummary {
  course: string;
  total: number;
  withMetadata: number;
  missingMetadata: number;
  byGenerator: Record<string, number>;
  byModel: Record<string, number>;
  earliestTimestamp?: string;
  latestTimestamp?: string;
  entries: ValidationReportGenerationEntry[];
}

export interface ValidationReportGeneration {
  exercises: ValidationReportGenerationSummary[];
  supplements: ValidationReportGenerationSummary[];
}

export interface ValidationReport {
  generatedAt: string;
  status: ValidationReportStatus;
  totals: ValidationReportTotals;
  courses: ValidationReportCourseEntry[];
  generation?: ValidationReportGeneration;
}

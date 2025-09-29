import courseContentSummary from '../../../reports/course-content-summary.json';
import contentObservability from '../../../reports/content-observability.json';
import governanceAlert from '../../../reports/governance-alert.json';

type CourseSummary = (typeof courseContentSummary.courses)[number];
type CourseObservability = (typeof contentObservability.courses)[number];

const TARGET_COURSE_ID = 'algi';

function findCourseSummary(courseId: string): CourseSummary | undefined {
  return courseContentSummary.courses.find((course) => course.id === courseId);
}

function findCourseObservability(courseId: string): CourseObservability | undefined {
  return contentObservability.courses.find((course) => course.id === courseId);
}

const courseSummary = findCourseSummary(TARGET_COURSE_ID);
const courseObservability = findCourseObservability(TARGET_COURSE_ID);

const lessonsPublished = courseSummary?.summary.lessons.published ?? 0;
const lessonsTotal = courseSummary?.summary.lessons.total ?? 0;
const exercisesUpcoming = courseSummary?.summary.exercises.upcoming ?? 0;

const totalBlocks = courseObservability?.lessons.totalBlocks ?? 0;
const legacyBlocks = courseObservability?.lessons.legacyBlocks ?? 0;
const md3Blocks = courseObservability?.lessons.md3Blocks ?? 0;

const migrationRatio = totalBlocks > 0 ? md3Blocks / totalBlocks : 0;
const migrationPercent = Math.round(migrationRatio * 100);

const governanceWarnings = governanceAlert.validationTotals.warnings;
const governanceProblems = governanceAlert.validationTotals.problems;
const governanceStatus = governanceAlert.validationStatus;

export const teacherNavigationMetrics = {
  courseTitle: courseSummary?.title ?? 'Curso MD3',
  lessonsPublished,
  lessonsTotal,
  exercisesUpcoming,
  migrationPercent,
  md3Blocks,
  legacyBlocks,
  governanceWarnings,
  governanceProblems,
  governanceStatus,
};

function formatLessonBadge(): string {
  if (!lessonsTotal) {
    return '—';
  }
  return `${lessonsPublished}/${lessonsTotal}`;
}

function formatExercisesBadge(): string {
  if (!exercisesUpcoming) {
    return '—';
  }
  return String(exercisesUpcoming);
}

function formatGovernanceBadge(): string {
  if (governanceProblems > 0) {
    return `${governanceProblems} problema${governanceProblems > 1 ? 's' : ''}`;
  }

  if (governanceWarnings > 0) {
    return `${governanceWarnings} aviso${governanceWarnings > 1 ? 's' : ''}`;
  }

  return 'Saudável';
}

function formatMigrationBadge(): string {
  if (!migrationPercent) {
    return legacyBlocks > 0 ? 'Em migração' : '—';
  }
  return `${migrationPercent}% MD3`;
}

export const teacherShellNavigation = [
  {
    id: 'overview',
    label: 'Panorama',
    icon: 'compass',
    badge: formatMigrationBadge(),
    to: { name: 'course-overview' },
  },
  {
    id: 'lessons',
    label: 'Aulas',
    icon: 'book-open',
    badge: formatLessonBadge(),
    to: { name: 'course-lessons' },
  },
  {
    id: 'exercises',
    label: 'Exercícios',
    icon: 'clipboard-list',
    badge: formatExercisesBadge(),
    to: { name: 'course-exercises' },
  },
  {
    id: 'governance',
    label: 'Governança',
    icon: 'shield-check',
    badge: formatGovernanceBadge(),
    disabled: governanceStatus !== 'passed',
    to: governanceStatus === 'passed' ? { name: 'course-governance' } : undefined,
  },
] as const;

export const teacherRailItems = teacherShellNavigation.map(({ id, label, icon, badge }) => ({
  id,
  label,
  icon,
  badge,
}));

export const teacherDrawerItems = teacherShellNavigation.map(({ id, label, badge, icon }) => ({
  id,
  label,
  icon,
  badge,
  description:
    id === 'overview'
      ? 'Resumo do plano e progresso de migração'
      : id === 'lessons'
        ? 'Grade oficial e conteúdos publicados'
        : id === 'exercises'
          ? 'Listas, avaliações e prazos'
          : 'Alertas de validação e governança',
}));

export const teacherBottomActions = teacherShellNavigation.map(({ id, label, icon }) => ({
  id,
  label,
  icon,
  disabled: id === 'governance' && governanceStatus !== 'passed',
}));

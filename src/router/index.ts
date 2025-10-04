import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../pages/Home.vue';
const CourseLayout = () => import('../pages/CourseLayout.vue');
const CourseHome = () => import('../pages/CourseHome.vue');
const LessonView = () => import('../pages/LessonView.vue');
const ExerciseView = () => import('../pages/ExerciseView.vue');
const ValidationReport = () => import('../pages/ValidationReport.vue');
const FacultyDashboard = () => import('../pages/faculty/FacultyDashboard.vue');
const FacultyIngestion = () => import('../pages/faculty/IngestionWorkbench.vue');
const FacultyEditor = () => import('../pages/faculty/EditorWorkbench.vue');
const FacultyValidation = () => import('../pages/faculty/ValidationWorkbench.vue');
const FacultyPublication = () => import('../pages/faculty/PublicationWorkbench.vue');

const isAuthoringBuildEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_AUTHORING === 'true';

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  {
    path: '/course/:courseId',
    component: CourseLayout,
    props: true,
    children: [
      { path: '', name: 'course-home', component: CourseHome, props: true },
      { path: 'lesson/:lessonId', name: 'lesson', component: LessonView, props: true },
      { path: 'exercise/:exerciseId', name: 'exercise', component: ExerciseView, props: true },
    ],
  },
  {
    path: '/reports/content-validation',
    name: 'validation-report',
    component: ValidationReport,
  },
  // Fallback to home for unknown routes
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

if (isAuthoringBuildEnabled) {
  routes.splice(
    routes.length - 1,
    0,
    {
      path: '/faculty',
      name: 'faculty-dashboard',
      component: FacultyDashboard,
    },
    {
      path: '/faculty/ingestion',
      name: 'faculty-ingestion',
      component: FacultyIngestion,
    },
    {
      path: '/faculty/editor',
      name: 'faculty-editor',
      component: FacultyEditor,
    },
    {
      path: '/faculty/validation',
      name: 'faculty-validation',
      component: FacultyValidation,
    },
    {
      path: '/faculty/publication',
      name: 'faculty-publication',
      component: FacultyPublication,
    }
  );
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

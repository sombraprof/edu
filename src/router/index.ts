import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../pages/Home.vue';
const CourseLayout = () => import('../pages/CourseLayout.vue');
const CourseHome = () => import('../pages/CourseHome.vue');
const LessonView = () => import('../pages/LessonView.vue');
const ExerciseView = () => import('../pages/ExerciseView.vue');
const ValidationReport = () => import('../pages/ValidationReport.vue');
const TeacherGuide = () => import('../pages/TeacherGuide.vue');

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
  routes.splice(routes.length - 1, 0, {
    path: '/professor',
    name: 'teacher-guide',
    component: TeacherGuide,
  });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

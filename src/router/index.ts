import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../pages/Home.vue';
import CourseLayout from '../pages/CourseLayout.vue';
import CourseHome from '../pages/CourseHome.vue';
import LessonView from '../pages/LessonView.vue';
import ExerciseView from '../pages/ExerciseView.vue';
import ValidationReport from '../pages/ValidationReport.vue';
const ProfessorDashboard = () => import('../pages/professor/ProfessorDashboard.vue');
const ProfessorIngestion = () => import('../pages/professor/IngestionWorkbench.vue');
const ProfessorEditor = () => import('../pages/professor/EditorWorkbench.vue');
const ProfessorValidation = () => import('../pages/professor/ValidationWorkbench.vue');
const ProfessorPublication = () => import('../pages/professor/PublicationWorkbench.vue');

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
    path: '/relatorios/validacao-conteudo',
    name: 'validation-report',
    component: ValidationReport,
  },
  {
    path: '/professor',
    name: 'professor-dashboard',
    component: ProfessorDashboard,
  },
  {
    path: '/professor/ingestao',
    name: 'professor-ingestion',
    component: ProfessorIngestion,
  },
  {
    path: '/professor/editor',
    name: 'professor-editor',
    component: ProfessorEditor,
  },
  {
    path: '/professor/validacao',
    name: 'professor-validation',
    component: ProfessorValidation,
  },
  {
    path: '/professor/publicacao',
    name: 'professor-publication',
    component: ProfessorPublication,
  },
  // Fallback to home for unknown routes
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

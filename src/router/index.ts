import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../pages/Home.vue';
import CourseLayout from '../pages/CourseLayout.vue';
import CourseHome from '../pages/CourseHome.vue';
import LessonView from '../pages/LessonView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  {
    path: '/course/:courseId',
    component: CourseLayout,
    props: true,
    children: [
      { path: '', name: 'course-home', component: CourseHome, props: true },
      { path: 'lesson/:lessonId', name: 'lesson', component: LessonView, props: true }
    ]
  },
  // Fallback to home for unknown routes
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
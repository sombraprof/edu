import {
  createRouter as createVueRouter,
  createWebHashHistory,
} from "vue-router";
// Storage utilities are no longer needed in Vue Router

// Import views (we'll create these components)
const HomeView = () => import("../../views/HomeView.vue");
const LessonView = () => import("../../views/LessonView.vue");
const ExerciseView = () => import("../../views/ExerciseView.vue");
const PolicyView = () => import("../../views/PolicyView.vue");

export const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/lesson/:id",
    name: "lesson",
    component: LessonView,
    props: true,
  },
  {
    path: "/exercise/:id",
    name: "exercise",
    component: ExerciseView,
    props: true,
  },
  {
    path: "/policy",
    name: "policy",
    component: PolicyView,
  },
];

export function computeLastRouteSnapshot(to) {
  if (!to || typeof to !== "object") return null;
  const rawName = to.name;
  if (!rawName || typeof rawName !== "string" || rawName.trim() === "") {
    return null;
  }

  const rawId = to.params?.id;
  if (!rawId) return null;

  const normalizedId = String(rawId).trim();
  if (!normalizedId) return null;

  return `${rawName}=${encodeURIComponent(normalizedId)}`;
}

export function createRouter(options = {}) {
  const router = createVueRouter({
    history: createWebHashHistory(),
    routes,
    ...options,
  });

  router.beforeEach((to, from, next) => {
    // Save current route for persistence
    const snapshot = computeLastRouteSnapshot(to);
    if (snapshot) {
      localStorage.setItem("lastRoute", snapshot);
    }
    next();
  });

  return router;
}

const router = createRouter();

// Legacy toggling removed: MD3-only styles

export default router;

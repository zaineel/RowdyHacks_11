import { createRouter, createWebHistory } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/Landing.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/circles',
    name: 'Circles',
    component: () => import('../views/Circles.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/circles/create',
    name: 'CreateCircle',
    component: () => import('../views/CreateCircle.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/circles/:id',
    name: 'CircleDetail',
    component: () => import('../views/CircleDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('../views/Payments.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/credit',
    name: 'Credit',
    component: () => import('../views/Credit.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard for authentication
router.beforeEach((to, from, next) => {
  // Check if in demo mode
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' ||
                     import.meta.env.VITE_AUTH0_DOMAIN === 'demo-mode';

  if (isDemoMode) {
    // Skip auth check in demo mode
    next();
    return;
  }

  const { isAuthenticated, isLoading } = useAuth0();

  if (to.meta.requiresAuth && !isLoading.value && !isAuthenticated.value) {
    // Redirect to landing page if not authenticated
    next('/');
  } else {
    next();
  }
});

export default router;

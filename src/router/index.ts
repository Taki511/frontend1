import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true },
    },
    // Dashboard placeholders - will be implemented later
    {
      path: '/student/dashboard',
      name: 'student-dashboard',
      component: () => import('../views/dashboards/StudentDashboard.vue'),
      meta: { requiresAuth: true, role: 'student' },
    },
    {
      path: '/recruiter/dashboard',
      name: 'recruiter-dashboard',
      component: () => import('../views/dashboards/RecruiterDashboard.vue'),
      meta: { requiresAuth: true, role: 'recruiter' },
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/dashboards/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' },
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state from localStorage
  if (!authStore.user && localStorage.getItem('token')) {
    await authStore.initializeAuth()
  }

  // Redirect authenticated users away from guest pages
  if (to.meta.guest && authStore.isAuthenticated) {
    return next(authStore.dashboardRoute)
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Check role-based access
  if (to.meta.requiresAuth && to.meta.role) {
    const requiredRole = to.meta.role as string
    if (authStore.userRole !== requiredRole) {
      // Redirect to their appropriate dashboard
      return next(authStore.dashboardRoute)
    }
  }

  next()
})

export default router

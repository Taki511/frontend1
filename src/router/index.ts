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
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { guest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: { guest: true },
    },
        {
      path: '/offers',
      name: 'browse-offers',
      component: () => import('../views/BrowseOffersView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    // Dashboard placeholders - will be implemented later
    {
      path: '/student/dashboard',
      component: () => import('../views/dashboards/StudentDashboard.vue'),
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: '',
          redirect: '/student/dashboard/my-cv',
        },
        {
          path: 'my-cv',
          name: 'student-my-cv',
          component: () => import('../views/dashboards/student/MyCV.vue'),
        },
        {
          path: 'my-applications',
          name: 'student-my-applications',
          component: () => import('../views/dashboards/student/MyApplications.vue'),
        },
      ],
    },
    {
      path: '/recruiter/dashboard',
      component: () => import('../views/dashboards/RecruiterDashboard.vue'),
      meta: { requiresAuth: true, role: 'recruiter' },
      children: [
        {
          path: '',
          redirect: '/recruiter/dashboard/my-offers',
        },
        {
          path: 'my-offers',
          name: 'recruiter-my-offers',
          component: () => import('../views/dashboards/recruiter/MyOffers.vue'),
        },
        {
          path: 'applications',
          name: 'recruiter-applications',
          component: () => import('../views/dashboards/recruiter/Applications.vue'),
        },
        {
          path: 'company-profile',
          name: 'recruiter-company-profile',
          component: () => import('../views/dashboards/recruiter/CompanyProfile.vue'),
        },
        {
          path: 'my-profile',
          name: 'recruiter-my-profile',
          component: () => import('../views/dashboards/recruiter/MyProfile.vue'),
        },
      ],
    },
    {
      path: '/admin/dashboard',
      component: () => import('../views/dashboards/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard/applications',
        },
        {
          path: 'applications',
          name: 'admin-applications',
          component: () => import('../views/dashboards/admin/Applications.vue'),
        },
        {
          path: 'agreements',
          name: 'admin-agreements',
          component: () => import('../views/dashboards/admin/Agreements.vue'),
        },
      ],
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

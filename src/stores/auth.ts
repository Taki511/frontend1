import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService, getDashboardRoute, type User, type LoginCredentials, type RegisterData, type ForgotPasswordData, type ResetPasswordData } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const dashboardRoute = computed(() => user.value ? getDashboardRoute(user.value.role) : '/')

  // Actions
  const setAuth = (authToken: string, authUser: User) => {
    token.value = authToken
    user.value = authUser
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(authUser))
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // Verify token is still valid
        const currentUser = await authService.getCurrentUser(storedToken)
        user.value = currentUser
      } catch (err) {
        clearAuth()
      }
    }
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      setAuth(response.token, response.user)
      return { success: true, dashboard: getDashboardRoute(response.user.role) }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.register(data)
      setAuth(response.token, response.user)
      return { success: true, dashboard: getDashboardRoute(response.user.role) }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    const currentToken = token.value
    
    // Clear auth immediately for better UX
    clearAuth()
    
    // Then try to notify the server
    if (currentToken) {
      try {
        await authService.logout(currentToken)
      } catch (err) {
        // Ignore logout errors - token is already cleared
        console.log('Logout API call failed, but local session cleared')
      }
    }
  }

  const forgotPassword = async (email: string) => {
    loading.value = true
    error.value = null

    try {
      await authService.forgotPassword({ email })
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset email'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (data: ResetPasswordData) => {
    loading.value = true
    error.value = null

    try {
      await authService.resetPassword(data)
      return { success: true }
    } catch (err: any) {
      let userFriendlyMessage = err.message || 'Failed to reset password'
      
      // Provide more user-friendly messages for common errors
      if (userFriendlyMessage.toLowerCase().includes('not found') || 
          userFriendlyMessage.toLowerCase().includes('invalid') ||
          userFriendlyMessage.toLowerCase().includes('expired')) {
        userFriendlyMessage = 'This password reset link is invalid or has expired. Please request a new password reset.'
      } else if (userFriendlyMessage.toLowerCase().includes('token')) {
        userFriendlyMessage = 'Invalid reset token. Please request a new password reset link.'
      } else if (userFriendlyMessage.toLowerCase().includes('email')) {
        userFriendlyMessage = 'Email address not found. Please check your email and try again.'
      }
      
      error.value = userFriendlyMessage
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    dashboardRoute,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    initializeAuth,
    clearAuth,
  }
})

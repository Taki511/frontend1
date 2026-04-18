const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'recruiter' | 'admin'
  university_email?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  university_email?: string
  role: 'student' | 'recruiter'
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()
    return data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const result = await response.json()
    return result
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get current user')
    }

    const data = await response.json()
    return data.user || data
  },

  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    console.log('Attempting forgot password for email:', data.email)

    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    console.log('Forgot password response status:', response.status)
    console.log('Forgot password response ok:', response.ok)

    if (!response.ok) {
      let errorDetails
      try {
        errorDetails = await response.json()
        console.log('Error response from server:', errorDetails)
      } catch (e) {
        errorDetails = { message: `HTTP ${response.status}: ${response.statusText}` }
        console.log('Could not parse error response:', e)
      }
      
      const errorMessage = errorDetails.message || errorDetails.error || 'Failed to send password reset email'
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Forgot password successful:', result)
    return result
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    console.log('Attempting password reset with data:', {
      email: data.email,
      token: data.token.substring(0, 10) + '...',
      password: data.password ? '***' : 'missing',
      password_confirmation: data.password_confirmation ? '***' : 'missing'
    })

    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    console.log('Reset password response status:', response.status)
    console.log('Reset password response ok:', response.ok)

    if (!response.ok) {
      let errorDetails
      try {
        errorDetails = await response.json()
        console.log('Error response from server:', errorDetails)
      } catch (e) {
        errorDetails = { message: `HTTP ${response.status}: ${response.statusText}` }
        console.log('Could not parse error response:', e)
      }
      
      const errorMessage = errorDetails.message || errorDetails.error || 'Failed to reset password'
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Password reset successful:', result)
    return result
  },
}

export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'recruiter':
      return '/recruiter/dashboard'
    case 'student':
      return '/student/dashboard'
    default:
      return '/'
  }
}

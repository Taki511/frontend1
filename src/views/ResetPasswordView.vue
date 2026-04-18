<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const token = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const isReset = ref(false)
const errorMessage = ref('')

// Extract token and email from URL query parameters
onMounted(() => {
  console.log('ResetPasswordView mounted with route:', route.fullPath)
  console.log('Query params:', route.query)
  
  const emailParam = route.query.email as string
  const tokenParam = route.query.token as string
  
  if (!emailParam || !tokenParam) {
    errorMessage.value = 'Invalid or missing reset link parameters.\n\n' +
      'Current URL: ' + route.fullPath + '\n' +
      'Expected: /reset-password?token=YOUR_TOKEN&email=your@email.com\n\n' +
      'This might happen if:\n' +
      '1. The reset link has expired\n' +
      '2. You accessed the wrong URL\n' +
      '3. The email link was corrupted\n' +
      '4. The backend sent an incorrect URL format\n\n' +
      'Please request a new password reset link.'
    return
  }
  
  email.value = emailParam
  token.value = tokenParam
  console.log('Extracted email:', emailParam)
  console.log('Extracted token:', tokenParam.substring(0, 10) + '...')
})

const handleResetPassword = async () => {
  errorMessage.value = ''
  
  if (!password.value) {
    errorMessage.value = 'Please enter a new password'
    return
  }
  
  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long'
    return
  }
  
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  const result = await authStore.resetPassword({
    email: email.value,
    token: token.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  })
  
  if (result.success) {
    isReset.value = true
  } else {
    errorMessage.value = result.error || 'Failed to reset password'
  }
}

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      <!-- Header -->
      <div class="text-center">
        <router-link to="/" class="inline-flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity">
          <div class="w-3 h-3 rounded-full bg-primary-500"></div>
          <span class="text-2xl font-bold text-gray-900">Stage.io</span>
        </router-link>
        <h2 class="text-3xl font-bold text-gray-900">Set new password</h2>
        <p class="mt-2 text-gray-600">
          {{ isReset ? 'Password reset successful' : 'Enter your new password' }}
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="isReset" class="text-center space-y-6">
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="font-medium">Password has been reset!</p>
          <p class="text-sm mt-1">You can now sign in with your new password</p>
        </div>

        <button
          @click="navigateToLogin"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Sign In
        </button>
      </div>

      <!-- Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
          {{ errorMessage }}
        </div>

        <!-- Error from store -->
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <!-- Invalid Link Warning -->
        <div v-if="!email || !token" class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
          <p>This password reset link is invalid or has expired.</p>
          <p class="mt-1">Please request a new password reset.</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Email (readonly) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              readonly
              class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 outline-none"
            />
          </div>

          <!-- New Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm new password
            </label>
            <div class="relative">
              <input
                id="password_confirmation"
                v-model="passwordConfirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg v-if="showPasswordConfirmation" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading || !email || !token"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ authStore.loading ? 'Resetting...' : 'Reset Password' }}
        </button>

        <!-- Request New Reset -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Need a new reset link?
            <button
              type="button"
              @click="navigateToForgotPassword"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Request again
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const isSubmitted = ref(false)
const errorMessage = ref('')

const handleForgotPassword = async () => {
  errorMessage.value = ''
  
  if (!email.value) {
    errorMessage.value = 'Please enter your email address'
    return
  }

  const result = await authStore.forgotPassword(email.value)
  
  if (result.success) {
    isSubmitted.value = true
  } else {
    errorMessage.value = result.error || 'Failed to send reset email'
  }
}

const navigateToLogin = () => {
  router.push('/login')
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
        <h2 class="text-3xl font-bold text-gray-900">Reset your password</h2>
        <p class="mt-2 text-gray-600">
          {{ isSubmitted ? 'Check your email' : 'Enter your email address' }}
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="isSubmitted" class="text-center space-y-6">
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="font-medium">Password reset link sent!</p>
          <p class="text-sm mt-1">We've sent a password reset link to {{ email }}</p>
        </div>
        
        <div class="space-y-3">
          <p class="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or
          </p>
          <button
            @click="isSubmitted = false"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Try again
          </button>
        </div>

        <button
          @click="navigateToLogin"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Back to Login
        </button>
      </div>

      <!-- Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ errorMessage }}
        </div>

        <!-- Error from store -->
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <div class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <p>We'll send you a password reset link to this email address.</p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ authStore.loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <!-- Back to Login -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Remember your password?
            <button
              type="button"
              @click="navigateToLogin"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

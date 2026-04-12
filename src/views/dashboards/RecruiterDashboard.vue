<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-primary-500"></div>
              <span class="text-xl font-bold text-gray-900">Stage.io</span>
            </router-link>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">Welcome, {{ authStore.user?.first_name }}</span>
            <button
              @click="handleLogout"
              class="text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome to your recruiter dashboard. This is a placeholder.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isMenuOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
  isMenuOpen.value = false
}
</script>

<template>
  <nav class="bg-white border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2">
            <img src="/logo.png" alt="Stage.io" class="h-8 w-auto" />
            <span class="text-xl font-bold text-gray-900">Stage.io</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link to="/" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
            Home
          </router-link>
          <router-link to="/offers" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
            Browse Offers
          </router-link>
          <router-link to="/contact" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
            Contact
          </router-link>
        </div>

        <!-- Auth Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <router-link
              :to="authStore.dashboardRoute"
              class="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Dashboard
            </router-link>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="px-4 py-2 text-white font-medium bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Register
            </router-link>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden bg-white border-t border-gray-100">
      <div class="px-4 pt-2 pb-4 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
          @click="isMenuOpen = false"
        >
          Home
        </router-link>
        <router-link
          to="/offers"
          class="block px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
          @click="isMenuOpen = false"
        >
          Browse Offers
        </router-link>
        <router-link
          to="/contact"
          class="block px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
          @click="isMenuOpen = false"
        >
          Contact
        </router-link>
        
        <template v-if="authStore.isAuthenticated">
          <router-link
            :to="authStore.dashboardRoute"
            class="block px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
            @click="isMenuOpen = false"
          >
            Dashboard
          </router-link>
          <button
            @click="handleLogout"
            class="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <div class="pt-4 space-y-2">
            <router-link
              to="/login"
              class="block w-full px-3 py-2 text-center text-gray-700 font-medium border border-gray-300 rounded-lg"
              @click="isMenuOpen = false"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="block w-full px-3 py-2 text-center text-white font-medium bg-primary-500 rounded-lg"
              @click="isMenuOpen = false"
            >
              Register
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

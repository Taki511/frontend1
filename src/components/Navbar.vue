<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)
</script>

<template>
  <nav class="bg-white border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-primary-500"></div>
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
      </div>
    </div>
  </nav>
</template>

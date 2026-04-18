<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">About Stage.io</h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting talented students with exciting internship opportunities across Algeria
          </p>
        </div>

        <!-- Mission Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div class="bg-white rounded-xl border border-gray-200 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p class="text-gray-600 leading-relaxed">
              To bridge the gap between education and employment by creating a seamless platform where 
              Algerian students can discover meaningful internship opportunities and companies can find 
              the next generation of talent.
            </p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p class="text-gray-600 leading-relaxed">
              To become the leading platform for career development in Algeria, empowering students 
              with practical experience and helping companies build strong talent pipelines for the future.
            </p>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="bg-green-600 rounded-xl p-8 mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-white">Making an Impact</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">500+</div>
              <div class="text-green-100">Active Students</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">100+</div>
              <div class="text-green-100">Partner Companies</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">200+</div>
              <div class="text-green-100">Internship Offers</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">95%</div>
              <div class="text-green-100">Success Rate</div>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="mb-16">
          <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Stage.io?</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Easy Applications</h3>
              <p class="text-gray-600">
                Simple and intuitive application process that saves time and reduces complexity.
              </p>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Verified Opportunities</h3>
              <p class="text-gray-600">
                All internship offers are verified to ensure quality and authenticity for students.
              </p>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Direct Connections</h3>
              <p class="text-gray-600">
                Connect directly with recruiters and hiring managers from top Algerian companies.
              </p>
            </div>
          </div>
        </div>

        
        <!-- CTA Section -->
        <div class="bg-gray-900 rounded-xl p-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p class="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already found their dream internships through Stage.io.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/register"
              class="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Get Started
            </router-link>
            <router-link
              to="/offers"
              class="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Opportunities
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

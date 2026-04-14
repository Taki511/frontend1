<script setup lang="ts">
const cards = [
  {
    title: 'For Students',
    description: 'Discover internships that match your field of study and build your career from university.',
    image: '/illustrations/Career progress-cuate.svg',
  },
  {
    title: 'For Companies',
    description: 'Connect with talented interns, streamline interviews, and grow your team effortlessly.',
    image: '/illustrations/Interview-cuate.svg',
  },
  {
    title: 'For Internships',
    description: 'Manage applications, track progress, and turn opportunities into real-world experience.',
    image: '/illustrations/Resume folder-cuate.svg',
  },
]
</script>

<template>
  <section class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Built for Every Step of the Journey
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Whether you are a student, a company, or looking for an internship — we have got you covered.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div
          v-for="card in cards"
          :key="card.title"
          class="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
        >
          <div class="relative w-full aspect-[4/3] mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-white">
            <img
              :src="card.image"
              :alt="card.title"
              class="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">
            {{ card.title }}
          </h3>
          <p class="text-gray-500 leading-relaxed">
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

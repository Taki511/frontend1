<script setup lang="ts">
const features = [
  {
    icon: 'lightning',
    title: 'Easy Applications',
    description: 'Apply to internships with just one click. Simple, fast, and hassle-free.',
  },
  {
    icon: 'academic',
    title: 'Validated by Universities',
    description: 'All offers are verified and recognized by Algerian universities.',
  },
  {
    icon: 'money',
    title: 'Free for Students',
    description: 'No hidden fees. Find and apply to your dream internship for free.',
  },
  {
    icon: 'globe',
    title: 'Algeria-wide Opportunities',
    description: 'Explore internships across all wilayas and sectors.',
  },
]
</script>

<template>
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-16">
        Why Stage.io?
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="text-center"
        >
          <!-- Icon -->
          <div class="inline-flex items-center justify-center w-16 h-16 mb-6">
            <template v-if="feature.icon === 'lightning'">
              <svg class="w-10 h-10 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </template>
            <template v-else-if="feature.icon === 'academic'">
              <svg class="w-10 h-10 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </template>
            <template v-else-if="feature.icon === 'money'">
              <svg class="w-10 h-10 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </template>
            <template v-else-if="feature.icon === 'globe'">
              <svg class="w-10 h-10 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </template>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ feature.title }}
          </h3>

          <!-- Description -->
          <p class="text-gray-500 text-sm leading-relaxed">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

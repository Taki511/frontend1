<script setup lang="ts">
import { computed } from 'vue'
import InternshipCard from './InternshipCard.vue'

interface Offer {
  id: number
  title: string
  description: string
  wilaya: string
  internship_type: string
  duration: number
  max_students: number
  accepted_students?: number
  deadline: string
  start_date: string
  status: string
  company?: {
    name: string
    logo?: string
  }
  skills?: string[]
}

const props = defineProps<{
  offers: Offer[]
}>()

const displayedOffers = computed(() => {
  return props.offers.slice(0, 6)
})
</script>

<template>
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
        Featured Internships
      </h2>

      <div v-if="displayedOffers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InternshipCard
          v-for="offer in displayedOffers"
          :key="offer.id"
          :offer="offer"
        />
      </div>

      <div v-else class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p class="text-gray-500">No internships available at the moment.</p>
      </div>

      <div class="text-center mt-10">
        <router-link
          to="/offers"
          class="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          View All Offers
          <svg class="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

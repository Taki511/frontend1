<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalOffers: number
}>()

const displayCount = computed(() => {
  return props.totalOffers > 0 ? props.totalOffers : 100
})
</script>

<template>
  <section class="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div class="text-5xl md:text-6xl font-bold text-primary-600 mb-4">
        {{ displayCount }}+
      </div>
      <h3 class="text-2xl font-bold text-gray-900 mb-2">
        Internship Offers Posted
      </h3>
      <p class="text-gray-600">
        By companies across Algeria
      </p>
    </div>
  </section>
</template>

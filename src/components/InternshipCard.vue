<script setup lang="ts">
import { computed } from 'vue'

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
  offer: Offer
}>()

const availableSpots = computed(() => {
  return props.offer.max_students - (props.offer.accepted_students || 0)
})

const isClosed = computed(() => {
  return props.offer.status === 'closed' || availableSpots.value <= 0 || new Date(props.offer.deadline) < new Date()
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const typeLabel = computed(() => {
  const types: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    remote: 'Remote',
  }
  return types[props.offer.internship_type] || props.offer.internship_type
})
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
          <span class="text-primary-600 font-bold text-lg">
            {{ offer.company?.name?.charAt(0) || 'S' }}
          </span>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 line-clamp-1">{{ offer.company?.name || 'Company' }}</h3>
          <p class="text-sm text-gray-500">{{ offer.wilaya }}</p>
        </div>
      </div>
      <span
        :class="[
          'px-3 py-1 text-xs font-medium rounded-full',
          isClosed ? 'bg-gray-100 text-gray-600' : 'bg-primary-100 text-primary-700'
        ]"
      >
        {{ isClosed ? 'Closed' : 'Open' }}
      </span>
    </div>

    <!-- Title -->
    <h4 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{{ offer.title }}</h4>

    <!-- Description -->
    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ offer.description }}</p>

    <!-- Details -->
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        {{ typeLabel }}
      </span>
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        {{ offer.duration }} weeks
      </span>
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        {{ availableSpots }} spot{{ availableSpots !== 1 ? 's' : '' }} left
      </span>
    </div>

    <!-- Skills -->
    <div v-if="offer.skills && offer.skills.length > 0" class="flex flex-wrap gap-1 mb-4">
      <span
        v-for="skill in offer.skills.slice(0, 3)"
        :key="skill"
        class="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md"
      >
        {{ skill }}
      </span>
      <span v-if="offer.skills.length > 3" class="px-2 py-1 text-gray-400 text-xs">
        +{{ offer.skills.length - 3 }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="text-sm text-gray-500">
        Deadline: {{ formatDate(offer.deadline) }}
      </div>
      <router-link
        :to="`/offers/${offer.id}`"
        class="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
      >
        View Details
      </router-link>
    </div>
  </div>
</template>

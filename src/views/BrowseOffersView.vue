<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const offers = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const total = ref(0)

// Filters
const searchQuery = ref('')
const selectedWilaya = ref('')
const selectedSkill = ref('')
const selectedType = ref('')

const wilayas = ref([
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida',
  'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers', 'Djelfa', 'Jijel',
  'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
  'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'El M\'ghair', 'El Menia', 'Ouled Djellal',
  'Bordj Baji Mokhtar', 'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
])

const skills = ref<string[]>([])
const types = ref([
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'remote', label: 'Remote' },
])

// Modal
const selectedOffer = ref<any>(null)
const showDetailModal = ref(false)

// Applied offer IDs (to show cancel button)
const appliedOfferIds = ref<Set<number>>(new Set())

// Fetch skills
const fetchSkills = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/internship-offers/skills/list`, {
      headers: { 'Accept': 'application/json' },
    })
    const data = await response.json()
    skills.value = data.data || []
  } catch (err) {
    console.error('Error fetching skills:', err)
    skills.value = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'PHP', 'Laravel', 'MySQL', 'MongoDB']
  }
}

// Fetch offers
const fetchOffers = async (page = 1) => {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('per_page', String(perPage.value))
    if (searchQuery.value.trim()) params.append('search', searchQuery.value.trim())
    if (selectedWilaya.value) params.append('wilaya', selectedWilaya.value)
    if (selectedSkill.value) params.append('skill', selectedSkill.value)
    if (selectedType.value) params.append('type', selectedType.value)

    const response = await fetch(`${API_BASE_URL}/internship-offers?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load offers')
    }

    offers.value = data.data || []
    currentPage.value = data.meta?.current_page || 1
    lastPage.value = data.meta?.last_page || 1
    perPage.value = data.meta?.per_page || 10
    total.value = data.meta?.total || 0
  } catch (err: any) {
    error.value = err.message || 'Failed to load offers'
  } finally {
    loading.value = false
  }
}

// Fetch my applications to know which offers are already applied to
const fetchMyApplications = async () => {
  if (!authStore.isAuthenticated || authStore.userRole !== 'student') return

  try {
    const response = await fetch(`${API_BASE_URL}/my-applications`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (response.ok) {
      const apps = data.data || []
      // Only count active applications (pending or accepted)
      const active = apps.filter((app: any) => {
        const status = (app.status || '').toLowerCase()
        return ['pending', 'accepted'].includes(status) && !app.is_confirmed
      })
      appliedOfferIds.value = new Set(active.map((app: any) => app.internship_offer_id))
    }
  } catch (err) {
    console.error('Error fetching my applications:', err)
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchOffers(1)
  // Update URL query params
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedWilaya.value) query.wilaya = selectedWilaya.value
  if (selectedSkill.value) query.skill = selectedSkill.value
  if (selectedType.value) query.type = selectedType.value
  router.replace({ path: '/offers', query })
}

// Clear filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedWilaya.value = ''
  selectedSkill.value = ''
  selectedType.value = ''
  currentPage.value = 1
  fetchOffers(1)
  router.replace({ path: '/offers' })
}

// Apply to offer
const applyToOffer = async (offerId: number) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (authStore.userRole !== 'student') {
    error.value = 'Only students can apply to internships'
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/internship-offers/${offerId}/apply`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply')
    }

    success.value = data.message || 'Application submitted successfully!'
    appliedOfferIds.value.add(offerId)
    await fetchMyApplications()
    if (selectedOffer.value?.id === offerId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to apply'
  }
}

// Cancel application for this offer
const cancelApplicationForOffer = async (offerId: number) => {
  if (!confirm('Are you sure you want to cancel your application for this offer?')) return

  try {
    // Need to find the application ID first
    const response = await fetch(`${API_BASE_URL}/my-applications`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to find application')
    }

    const apps = data.data || []
    const app = apps.find((a: any) => a.internship_offer_id === offerId && ['pending', 'accepted'].includes((a.status || '').toLowerCase()))

    if (!app) {
      throw new Error('Application not found')
    }

    const cancelResponse = await fetch(`${API_BASE_URL}/applications/${app.id}/cancel`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const cancelData = await cancelResponse.json()

    if (!cancelResponse.ok) {
      throw new Error(cancelData.message || 'Failed to cancel application')
    }

    success.value = cancelData.message || 'Application cancelled successfully!'
    appliedOfferIds.value.delete(offerId)
    await fetchMyApplications()
    if (selectedOffer.value?.id === offerId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to cancel application'
  }
}

// Modal helpers
const openDetailModal = (offer: any) => {
  selectedOffer.value = offer
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOffer.value = null
}

// Formatting
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getStatusClasses = (status: string) => {
  const s = (status || '').toLowerCase()
  if (s === 'open') return 'bg-green-100 text-green-800 border-green-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

// Initialize from URL query params
onMounted(() => {
  searchQuery.value = (route.query.search as string) || ''
  selectedWilaya.value = (route.query.wilaya as string) || ''
  selectedSkill.value = (route.query.skill as string) || ''
  selectedType.value = (route.query.type as string) || ''
  fetchSkills()
  fetchOffers()
  fetchMyApplications()
})

watch(() => route.query, (query) => {
  searchQuery.value = (query.search as string) || ''
  selectedWilaya.value = (query.wilaya as string) || ''
  selectedSkill.value = (query.skill as string) || ''
  selectedType.value = (query.type as string) || ''
  fetchOffers()
}, { deep: true })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Browse Internship Offers</h1>
          <p class="mt-2 text-gray-600">Find and apply to the best internship opportunities</p>
        </div>

        <!-- Alerts -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>
        <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {{ success }}
        </div>

        <!-- Search & Filters -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <!-- Search Input -->
            <div class="md:col-span-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search internships..."
                  class="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  @keyup.enter="handleSearch"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <!-- Location Dropdown -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                v-model="selectedWilaya"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white cursor-pointer"
              >
                <option value="">All Locations</option>
                <option v-for="wilaya in wilayas" :key="wilaya" :value="wilaya">
                  {{ wilaya }}
                </option>
              </select>
            </div>

            <!-- Skills Dropdown -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <select
                v-model="selectedSkill"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white cursor-pointer"
              >
                <option value="">All Skills</option>
                <option v-for="skill in skills" :key="skill" :value="skill">
                  {{ skill }}
                </option>
              </select>
            </div>

            <!-- Type Dropdown -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                v-model="selectedType"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white cursor-pointer"
              >
                <option value="">All Types</option>
                <option v-for="type in types" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              @click="handleSearch"
              class="flex-1 sm:flex-none sm:px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Internships
            </button>
            <button
              @click="clearFilters"
              class="flex-1 sm:flex-none sm:px-6 py-3 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="offers.length === 0"
          class="text-center py-12 bg-white rounded-xl border border-gray-200"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">No offers found</h3>
          <p class="text-gray-500">Try adjusting your search or filters.</p>
        </div>

        <!-- Offers Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="offer in offers"
            :key="offer.id"
            class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
          >
            <div class="p-5 flex-1">
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">{{ offer.title }}</h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize shrink-0',
                    getStatusClasses(offer.status),
                  ]"
                >
                  {{ offer.status }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ offer.company_profile?.name || 'Unknown Company' }}</p>
              <p class="mt-2 text-sm text-gray-600 line-clamp-3">{{ offer.description }}</p>

              <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ offer.wilaya }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ offer.duration }} wks
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 capitalize">
                  {{ offer.internship_type?.replace('_', ' ') }}
                </span>
              </div>

              <div v-if="offer.skills?.length" class="mt-3 flex flex-wrap gap-1.5">
                <span
                  v-for="skill in offer.skills"
                  :key="skill.id"
                  class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                >
                  {{ skill.name }}
                </span>
              </div>
            </div>

            <div class="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <div class="flex items-center gap-2">
                <button
                  @click="openDetailModal(offer)"
                  class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Details
                </button>
                <template v-if="authStore.isAuthenticated && authStore.userRole === 'student'">
                  <button
                    v-if="appliedOfferIds.has(offer.id)"
                    @click="cancelApplicationForOffer(offer.id)"
                    class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    v-else-if="offer.status === 'open'"
                    @click="applyToOffer(offer.id)"
                    class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    v-else
                    disabled
                    class="flex-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                  >
                    Closed
                  </button>
                </template>
                <template v-else-if="!authStore.isAuthenticated">
                  <button
                    @click="router.push('/login')"
                    class="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Login to Apply
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="lastPage > 1" class="flex items-center justify-between mt-8">
          <p class="text-sm text-gray-500">
            Showing {{ offers.length }} of {{ total }} offers
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="fetchOffers(currentPage - 1)"
              :disabled="currentPage === 1 || loading"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ lastPage }}
            </span>
            <button
              @click="fetchOffers(currentPage + 1)"
              :disabled="currentPage === lastPage || loading"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedOffer" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeDetailModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ selectedOffer.title }}</h3>
              <p class="text-sm text-gray-500">{{ selectedOffer.company_profile?.name || 'Unknown Company' }}</p>
              <div class="mt-2 flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(selectedOffer.status),
                  ]"
                >
                  {{ selectedOffer.status }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ selectedOffer.wilaya }}
                </span>
              </div>
            </div>
            <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600 p-1">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Description</h4>
              <p class="text-gray-600 leading-relaxed">{{ selectedOffer.description }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-gray-500">Start Date</span>
                <span class="font-medium text-gray-900">{{ formatDate(selectedOffer.start_date) }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-gray-500">Duration</span>
                <span class="font-medium text-gray-900">{{ selectedOffer.duration }} weeks</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-gray-500">Type</span>
                <span class="font-medium text-gray-900 capitalize">{{ selectedOffer.internship_type?.replace('_', ' ') }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-gray-500">Max Students</span>
                <span class="font-medium text-gray-900">{{ selectedOffer.max_students }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-gray-500">Deadline</span>
                <span class="font-medium text-gray-900">{{ formatDate(selectedOffer.deadline) }}</span>
              </div>
              <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                <span class="text-gray-500">Location</span>
                <span class="font-medium text-gray-900">{{ selectedOffer.wilaya }}</span>
              </div>
            </div>

            <div v-if="selectedOffer.skills?.length">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Required Skills</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in selectedOffer.skills"
                  :key="skill.id"
                  class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md"
                >
                  {{ skill.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <template v-if="authStore.isAuthenticated && authStore.userRole === 'student'">
              <button
                v-if="appliedOfferIds.has(selectedOffer.id)"
                @click="cancelApplicationForOffer(selectedOffer.id)"
                class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
              >
                Cancel Application
              </button>
              <button
                v-else-if="selectedOffer.status === 'open'"
                @click="applyToOffer(selectedOffer.id)"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Apply Now
              </button>
              <button
                v-else
                disabled
                class="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
              >
                Offer Closed
              </button>
            </template>
            <template v-else-if="!authStore.isAuthenticated">
              <button
                @click="router.push('/login')"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Login to Apply
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

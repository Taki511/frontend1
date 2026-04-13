<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const authStore = useAuthStore()

// State
const offers = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Filter & Pagination
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(10)
const total = ref(0)

// Filter Options
const filterOptions = ref<any>(null)

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedOffer = ref<any>(null)
const expandedOfferId = ref<number | null>(null)

// Form
const form = ref({
  title: '',
  description: '',
  wilaya: '',
  start_date: '',
  internship_type: '',
  duration: 12,
  max_students: 1,
  deadline: '',
  skills: [] as string[],
})

const formErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Computed
const internshipTypes = computed(() => filterOptions.value?.types || [])
const availableSkills = computed(() => filterOptions.value?.skills || [])

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida',
  'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers', 'Djelfa', 'Jijel',
  'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
  'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'El M\'ghair', 'El Menia', 'Ouled Djellal',
  'Bordj Baji Mokhtar', 'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
]

// Fetch offers
const fetchOffers = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/my-internship-offers?page=${page}&per_page=${perPage.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch offers')
    const data = await response.json()
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

// Fetch filter options
const fetchFilterOptions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/internship-offers-filter-options`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })
    if (response.ok) {
      const data = await response.json()
      filterOptions.value = data
    }
  } catch (err) {
    console.error('Error fetching filter options:', err)
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    wilaya: '',
    start_date: '',
    internship_type: '',
    duration: 12,
    max_students: 1,
    deadline: '',
    skills: [],
  }
  formErrors.value = {}
}

// Open create modal
const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

// Open edit modal
const openEditModal = (offer: any) => {
  selectedOffer.value = offer
  form.value = {
    title: offer.title || '',
    description: offer.description || '',
    wilaya: offer.wilaya || '',
    start_date: offer.start_date || '',
    internship_type: offer.internship_type || '',
    duration: offer.duration || 12,
    max_students: offer.max_students || 1,
    deadline: offer.deadline || '',
    skills: offer.skills?.map((s: any) => s.name) || [],
  }
  formErrors.value = {}
  showEditModal.value = true
}

// Open delete modal
const openDeleteModal = (offer: any) => {
  selectedOffer.value = offer
  showDeleteModal.value = true
}

// Close modals
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedOffer.value = null
}

// Create offer
const createOffer = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/internship-offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 422 && data.errors) {
        formErrors.value = Object.fromEntries(
          Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])
        )
        throw new Error('Please fix the validation errors')
      }
      throw new Error(data.message || 'Failed to create offer')
    }

    success.value = 'Offer created successfully!'
    closeModals()
    await fetchOffers(currentPage.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to create offer'
  } finally {
    isSubmitting.value = false
  }
}

// Update offer
const updateOffer = async () => {
  if (!selectedOffer.value) return

  isSubmitting.value = true
  formErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/internship-offers/${selectedOffer.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 422 && data.errors) {
        formErrors.value = Object.fromEntries(
          Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])
        )
        throw new Error('Please fix the validation errors')
      }
      throw new Error(data.message || 'Failed to update offer')
    }

    success.value = 'Offer updated successfully!'
    closeModals()
    await fetchOffers(currentPage.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to update offer'
  } finally {
    isSubmitting.value = false
  }
}

// Delete offer
const deleteOffer = async () => {
  if (!selectedOffer.value) return

  isSubmitting.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/internship-offers/${selectedOffer.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to delete offer')
    }

    success.value = 'Offer deleted successfully!'
    closeModals()
    await fetchOffers(currentPage.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to delete offer'
  } finally {
    isSubmitting.value = false
  }
}

// Toggle card expansion
const toggleExpand = (offerId: number) => {
  expandedOfferId.value = expandedOfferId.value === offerId ? null : offerId
}

// Skill tag input
const addSkill = () => {
  const raw = skillInput.value.trim()
  if (!raw) return

  // Split by comma or semicolon and trim each
  const newSkills = raw.split(/[,;]+/).map(s => s.trim()).filter(s => s.length > 0)

  newSkills.forEach(skill => {
    if (!form.value.skills.includes(skill)) {
      form.value.skills.push(skill)
    }
  })

  skillInput.value = ''
}

const removeSkill = (skillName: string) => {
  const index = form.value.skills.indexOf(skillName)
  if (index > -1) {
    form.value.skills.splice(index, 1)
  }
}

const handleSkillKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
    e.preventDefault()
    addSkill()
  } else if (e.key === 'Backspace' && !skillInput.value) {
    form.value.skills.pop()
  }
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Get status badge classes
const getStatusClasses = (status: string) => {
  if (status === 'open') {
    return 'bg-green-100 text-green-800 border-green-200'
  }
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

// Get pending applications count
const getPendingCount = (offer: any) => {
  return offer.applications?.filter((app: any) => app.status === 'pending').length || 0
}

onMounted(() => {
  fetchOffers()
  fetchFilterOptions()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">My Offers</h2>
        <p class="mt-1 text-gray-600">Manage your internship offers</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Offer
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>
    <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
      {{ success }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="offers.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No offers yet</h3>
      <p class="text-gray-500 mb-4">Create your first internship offer to start receiving applications.</p>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Offer
      </button>
    </div>

    <!-- Offers List -->
    <div v-else class="space-y-4">
      <div
        v-for="offer in offers"
        :key="offer.id"
        @click="toggleExpand(offer.id)"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
        :class="{ 'ring-2 ring-green-500 ring-offset-2': expandedOfferId === offer.id }"
      >
        <div class="p-5">
          <!-- Header Row -->
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-semibold text-gray-900 truncate">{{ offer.title }}</h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize shrink-0',
                    getStatusClasses(offer.status),
                  ]"
                >
                  {{ offer.status }}
                </span>
              </div>
            </div>

            <!-- Actions (stop propagation so click doesn't expand) -->
            <div class="flex items-center gap-2 shrink-0" @click.stop>
              <button
                @click="openEditModal(offer)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                title="Edit"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                @click="openDeleteModal(offer)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
                title="Delete"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          <!-- Description -->
          <p
            class="mt-2 text-sm text-gray-600"
            :class="expandedOfferId === offer.id ? '' : 'line-clamp-2'"
          >
            {{ offer.description }}
          </p>

          <!-- Meta Tags -->
          <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ offer.wilaya }}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ formatDate(offer.start_date) }}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ offer.duration }} wks
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {{ offer.max_students }} max
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              DL {{ formatDate(offer.deadline) }}
            </span>
            <span
              v-if="getPendingCount(offer) > 0"
              class="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {{ getPendingCount(offer) }} pending
            </span>
          </div>

          <!-- Skills -->
          <div v-if="offer.skills?.length" class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="skill in offer.skills"
              :key="skill.id"
              class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
            >
              {{ skill.name }}
            </span>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedOfferId === offer.id" class="mt-4 pt-4 border-t border-gray-100">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Type</span>
                <p class="font-medium text-gray-900 capitalize">{{ offer.internship_type?.replace('_', ' ') }}</p>
              </div>
              <div>
                <span class="text-gray-500">Created</span>
                <p class="font-medium text-gray-900">{{ formatDate(offer.created_at) }}</p>
              </div>
              <div>
                <span class="text-gray-500">Applications</span>
                <p class="font-medium text-gray-900">{{ offer.applications?.length || 0 }} total</p>
              </div>
              <div>
                <span class="text-gray-500">Offer ID</span>
                <p class="font-medium text-gray-900">#{{ offer.id }}</p>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-400 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click again to collapse
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="lastPage > 1" class="flex items-center justify-between pt-4">
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

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeModals"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ showCreateModal ? 'Create Offer' : 'Edit Offer' }}
            </h3>
            <button @click="closeModals" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
              <input
                v-model="form.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.title }"
                placeholder="e.g. Full Stack Developer Intern"
              />
              <p v-if="formErrors.title" class="mt-1 text-xs text-red-600">{{ formErrors.title }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.description }"
                placeholder="Describe the internship role, responsibilities, requirements..."
              ></textarea>
              <p v-if="formErrors.description" class="mt-1 text-xs text-red-600">{{ formErrors.description }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Wilaya -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Wilaya <span class="text-red-500">*</span></label>
                <select
                  v-model="form.wilaya"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  :class="{ 'border-red-300': formErrors.wilaya }"
                >
                  <option value="">Select wilaya</option>
                  <option v-for="w in wilayas" :key="w" :value="w">{{ w }}</option>
                </select>
                <p v-if="formErrors.wilaya" class="mt-1 text-xs text-red-600">{{ formErrors.wilaya }}</p>
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Internship Type <span class="text-red-500">*</span></label>
                <select
                  v-model="form.internship_type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                  :class="{ 'border-red-300': formErrors.internship_type }"
                >
                  <option value="">Select type</option>
                  <option v-for="t in internshipTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
                <p v-if="formErrors.internship_type" class="mt-1 text-xs text-red-600">{{ formErrors.internship_type }}</p>
              </div>

              <!-- Start Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date <span class="text-red-500">*</span></label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.start_date }"
                />
                <p v-if="formErrors.start_date" class="mt-1 text-xs text-red-600">{{ formErrors.start_date }}</p>
              </div>

              <!-- Deadline -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deadline <span class="text-red-500">*</span></label>
                <input
                  v-model="form.deadline"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.deadline }"
                />
                <p v-if="formErrors.deadline" class="mt-1 text-xs text-red-600">{{ formErrors.deadline }}</p>
              </div>

              <!-- Duration -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (weeks) <span class="text-red-500">*</span></label>
                <input
                  v-model.number="form.duration"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.duration }"
                />
                <p v-if="formErrors.duration" class="mt-1 text-xs text-red-600">{{ formErrors.duration }}</p>
              </div>

              <!-- Max Students -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Max Students <span class="text-red-500">*</span></label>
                <input
                  v-model.number="form.max_students"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.max_students }"
                />
                <p v-if="formErrors.max_students" class="mt-1 text-xs text-red-600">{{ formErrors.max_students }}</p>
              </div>
            </div>

            <!-- Skills -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
              <div
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 bg-white"
                :class="{ 'border-red-300': formErrors.skills }"
              >
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="skill in form.skills"
                    :key="skill"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-green-800 bg-green-100 border border-green-300 rounded-md"
                  >
                    {{ skill }}
                    <button
                      type="button"
                      @click="removeSkill(skill)"
                      class="inline-flex items-center justify-center w-4 h-4 text-green-700 hover:text-green-900 hover:bg-green-200 rounded-full transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                  <input
                    v-model="skillInput"
                    type="text"
                    class="flex-1 min-w-[8rem] py-1 text-sm outline-none bg-transparent"
                    placeholder="Type a skill and press Enter..."
                    @keydown="handleSkillKeydown"
                    @blur="addSkill"
                  />
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">Press Enter or comma to add a skill</p>
              <p v-if="formErrors.skills" class="mt-1 text-xs text-red-600">{{ formErrors.skills }}</p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              @click="closeModals"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              v-if="showCreateModal"
              @click="createOffer"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Offer' }}
            </button>
            <button
              v-else
              @click="updateOffer"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black/50" @click="closeModals"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Delete Offer</h3>
          </div>
          <p class="text-sm text-gray-600 mb-6">
            Are you sure you want to delete <strong>"{{ selectedOffer?.title }}"</strong>? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="closeModals"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="deleteOffer"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

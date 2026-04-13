<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const authStore = useAuthStore()

// State
const offers = ref<any[]>([])
const applications = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Filters
const selectedOffer = ref<number | 'all'>('all')
const statusFilter = ref<'all' | 'pending' | 'accepted' | 'refused'>('pending')

// Modal
const selectedApplication = ref<any>(null)
const showDetailModal = ref(false)

// Fetch offers
const fetchOffers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-internship-offers`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch offers')
    const data = await response.json()
    offers.value = data.data || []
  } catch (err: any) {
    console.error('Error fetching offers:', err)
  }
}

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  applications.value = []

  try {
    const allApplications: any[] = []
    for (const offer of offers.value) {
      const response = await fetch(`${API_BASE_URL}/internship-offers/${offer.id}/applications`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` },
      })
      if (response.ok) {
        const data = await response.json()
        const apps = (data.data || []).map((app: any) => ({
          ...app,
          offer_title: offer.title,
          offer_id: offer.id,
        }))
        allApplications.push(...apps)
      }
    }
    applications.value = allApplications
  } catch (err: any) {
    error.value = err.message || 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

// Filtered applications
const filteredApplications = computed(() => {
  let filtered = applications.value

  if (selectedOffer.value !== 'all') {
    filtered = filtered.filter(app => app.offer_id === selectedOffer.value)
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const counts = computed(() => ({
  all: applications.value.length,
  pending: applications.value.filter(a => a.status.toLowerCase() === 'pending').length,
  accepted: applications.value.filter(a => a.status.toLowerCase() === 'accepted').length,
  refused: applications.value.filter(a => a.status.toLowerCase() === 'refused').length,
}))

// Actions
const acceptApplication = async (applicationId: number) => {
  if (!confirm('Are you sure you want to accept this application?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to accept application')
    }
    success.value = 'Application accepted successfully!'
    await fetchApplications()
    if (selectedApplication.value?.id === applicationId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to accept application'
  }
}

const refuseApplication = async (applicationId: number) => {
  if (!confirm('Are you sure you want to refuse this application?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/refuse`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to refuse application')
    }
    success.value = 'Application refused successfully!'
    await fetchApplications()
    if (selectedApplication.value?.id === applicationId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to refuse application'
  }
}

// Modal helpers
const openDetailModal = (application: any) => {
  selectedApplication.value = application
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedApplication.value = null
}

// Formatting
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const getStatusClasses = (status: string) => {
  const s = status.toLowerCase()
  if (s === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200'
  if (s === 'accepted') return 'bg-green-100 text-green-800 border-green-200'
  if (s === 'refused') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

onMounted(async () => {
  await fetchOffers()
  await fetchApplications()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Applications</h2>
        <p class="mt-1 text-gray-600">Review and manage student applications</p>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>
    <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
      {{ success }}
    </div>

    <!-- Filters -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div class="flex flex-col lg:flex-row gap-4 lg:items-end">
        <!-- Status Tabs -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in [
              { key: 'pending', label: 'Pending' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'refused', label: 'Refused' },
              { key: 'all', label: 'All' },
            ]"
            :key="tab.key"
            @click="statusFilter = tab.key as any"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
              statusFilter === tab.key
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
          >
            {{ tab.label }}
            <span
              :class="[
                'ml-1.5 px-1.5 py-0.5 text-xs rounded-md',
                statusFilter === tab.key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600',
              ]"
            >
              {{ counts[tab.key as keyof typeof counts] }}
            </span>
          </button>
        </div>

        <!-- Offer Filter -->
        <div class="lg:ml-auto">
          <label class="block text-xs font-medium text-gray-500 mb-1">Filter by Offer</label>
          <select
            v-model="selectedOffer"
            class="w-full lg:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="all">All Offers</option>
            <option v-for="offer in offers" :key="offer.id" :value="offer.id">
              {{ offer.title }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredApplications.length === 0"
      class="text-center py-12 bg-white rounded-xl border border-gray-200"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No applications found</h3>
      <p class="text-gray-500">
        {{ applications.length === 0 ? "You haven't received any applications yet." : "No applications match your current filters." }}
      </p>
    </div>

    <!-- Applications List -->
    <div v-else class="space-y-4">
      <div
        v-for="application in filteredApplications"
        :key="application.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-5">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <!-- Applicant Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-semibold text-gray-900">
                  {{ application.student?.name || `${application.student?.first_name} ${application.student?.last_name}` }}
                </h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(application.status),
                  ]"
                >
                  {{ application.status }}
                </span>
              </div>
              <p class="text-sm text-gray-500">{{ application.student?.email }}</p>

              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ application.offer_title }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Applied {{ formatDate(application.created_at) }}
                </span>
                <span
                  v-if="application.student_cv?.academic_level"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {{ application.student_cv.academic_level }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="openDetailModal(application)"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <template v-if="application.status.toLowerCase() === 'pending'">
                <button
                  @click="refuseApplication(application.id)"
                  class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Refuse
                </button>
                <button
                  @click="acceptApplication(application.id)"
                  class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Accept
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedApplication" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeDetailModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ selectedApplication.student?.name || `${selectedApplication.student?.first_name} ${selectedApplication.student?.last_name}` }}
              </h3>
              <p class="text-sm text-gray-500">{{ selectedApplication.student?.email }}</p>
              <div class="mt-2">
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(selectedApplication.status),
                  ]"
                >
                  {{ selectedApplication.status }}
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
            <!-- Application Info -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Applied for</span>
                  <p class="font-medium text-gray-900">{{ selectedApplication.offer_title }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Applied on</span>
                  <p class="font-medium text-gray-900">{{ formatDateTime(selectedApplication.created_at) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Application ID</span>
                  <p class="font-medium text-gray-900">#{{ selectedApplication.id }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Status</span>
                  <p class="font-medium text-gray-900 capitalize">{{ selectedApplication.status }}</p>
                </div>
              </div>
            </div>

            <!-- Student Info -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Student Information</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student?.name || `${selectedApplication.student?.first_name} ${selectedApplication.student?.last_name}` }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Email</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student?.email }}</span>
                </div>
                <div
                  v-if="selectedApplication.student?.student_profile?.university_email"
                  class="flex justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span class="text-gray-500">University Email</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student.student_profile.university_email }}</span>
                </div>
              </div>
            </div>

            <!-- CV Info -->
            <div v-if="selectedApplication.student_cv">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">CV Information</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div v-if="selectedApplication.student_cv.academic_level" class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Academic Level</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.academic_level }}</span>
                </div>
                <div v-if="selectedApplication.student_cv.phone_number" class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Phone</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.phone_number }}</span>
                </div>
                <div v-if="selectedApplication.student_cv.full_address" class="flex justify-between p-3 bg-gray-50 rounded-md sm:col-span-2">
                  <span class="text-gray-500">Address</span>
                  <span class="font-medium text-gray-900 text-right">{{ selectedApplication.student_cv.full_address }}</span>
                </div>
                <div v-if="selectedApplication.student_cv.email" class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">CV Email</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.email }}</span>
                </div>
                <div v-if="selectedApplication.student_cv.university_email" class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">University Email</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.university_email }}</span>
                </div>
              </div>

              <!-- Links -->
              <div
                v-if="selectedApplication.student_cv.github_link || selectedApplication.student_cv.linkedin_link || selectedApplication.student_cv.portfolio_link"
                class="flex flex-wrap gap-2 mt-3"
              >
                <a
                  v-if="selectedApplication.student_cv.github_link"
                  :href="selectedApplication.student_cv.github_link"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  v-if="selectedApplication.student_cv.linkedin_link"
                  :href="selectedApplication.student_cv.linkedin_link"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  v-if="selectedApplication.student_cv.portfolio_link"
                  :href="selectedApplication.student_cv.portfolio_link"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio
                </a>
              </div>
            </div>

            <!-- Motivation Letter -->
            <div v-if="selectedApplication.student_cv?.motivation_letter">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Motivation Letter</h4>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ selectedApplication.student_cv.motivation_letter }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div v-if="selectedApplication.status.toLowerCase() === 'pending'" class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              @click="refuseApplication(selectedApplication.id)"
              class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
            >
              Refuse
            </button>
            <button
              @click="acceptApplication(selectedApplication.id)"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Accept Application
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

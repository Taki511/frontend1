<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const authStore = useAuthStore()

// State
const applications = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Filters
const statusFilter = ref<string>('all')

// Modal
const selectedApplication = ref<any>(null)
const showDetailModal = ref(false)

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/my-applications`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load applications')
    }

    applications.value = data.data || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

// Normalize status for display/filtering
const normalizeStatus = (status: string, isConfirmed?: boolean | number | string) => {
  const s = (status || '').toLowerCase()
  if (s === 'rejected') return 'refused'
  const confirmed = isConfirmed === true || isConfirmed === 1 || isConfirmed === 'true' || isConfirmed === '1'
  if (s === 'accepted' && confirmed) return 'confirmed'
  return s
}

// Filtered applications
const filteredApplications = computed(() => {
  let filtered = [...applications.value]

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => normalizeStatus(app.status, app.is_confirmed) === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const counts = computed(() => ({
  all: applications.value.length,
  pending: applications.value.filter(a => normalizeStatus(a.status, a.is_confirmed) === 'pending').length,
  accepted: applications.value.filter(a => normalizeStatus(a.status, a.is_confirmed) === 'accepted').length,
  confirmed: applications.value.filter(a => normalizeStatus(a.status, a.is_confirmed) === 'confirmed').length,
  refused: applications.value.filter(a => normalizeStatus(a.status, a.is_confirmed) === 'refused').length,
  cancelled: applications.value.filter(a => normalizeStatus(a.status, a.is_confirmed) === 'cancelled').length,
}))

// Confirm application
const confirmApplication = async (applicationId: number) => {
  if (!confirm('Are you sure you want to confirm this application? Other accepted applications will be cancelled.')) return

  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/confirm`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to confirm application')
    }

    success.value = data.message || 'Application confirmed successfully!'
    if (data.other_applications_cancelled && data.other_applications_cancelled > 0) {
      success.value += ` ${data.other_applications_cancelled} other application(s) were cancelled.`
    }
    await fetchApplications()
    if (selectedApplication.value?.id === applicationId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to confirm application'
  }
}

// Cancel application
const cancelApplication = async (applicationId: number) => {
  if (!confirm('Are you sure you want to cancel this application?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel application')
    }

    success.value = data.message || 'Application cancelled successfully!'
    await fetchApplications()
    if (selectedApplication.value?.id === applicationId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to cancel application'
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

const getStatusClasses = (status: string, isConfirmed?: boolean | number | string) => {
  const s = normalizeStatus(status, isConfirmed)
  if (s === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200'
  if (s === 'accepted') return 'bg-green-100 text-green-800 border-green-200'
  if (s === 'confirmed') return 'bg-blue-100 text-blue-800 border-blue-200'
  if (s === 'refused') return 'bg-red-100 text-red-800 border-red-200'
  if (s === 'cancelled') return 'bg-gray-100 text-gray-800 border-gray-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

const canConfirm = (status: string, isConfirmed?: boolean | number | string) => {
  return normalizeStatus(status, isConfirmed) === 'accepted'
}

const canCancel = (status: string, isConfirmed?: boolean | number | string) => {
  const s = normalizeStatus(status, isConfirmed)
  return ['pending', 'accepted'].includes(s)
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">My Applications</h2>
        <p class="mt-1 text-gray-600">Track your internship applications</p>
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
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in [
            { key: 'pending', label: 'Pending' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'refused', label: 'Refused' },
            { key: 'cancelled', label: 'Cancelled' },
            { key: 'all', label: 'All' },
          ]"
          :key="tab.key"
          @click="statusFilter = tab.key"
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
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No applications found</h3>
      <p class="text-gray-500">
        {{ applications.length === 0 ? "You haven't applied to any internships yet." : "No applications match your current filter." }}
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
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-semibold text-gray-900">
                  {{ application.internship_offer?.title || 'Unknown Offer' }}
                </h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(application.status, application.is_confirmed),
                  ]"
                >
                  {{ normalizeStatus(application.status, application.is_confirmed) }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ application.internship_offer?.company_profile?.name || 'Unknown Company' }}
              </p>

              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Applied {{ formatDate(application.created_at) }}
                </span>
                <span
                  v-if="application.application_date"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  App date {{ formatDate(application.application_date) }}
                </span>
                <span
                  v-if="application.accepted_at"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded-md border border-green-100"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Accepted {{ formatDate(application.accepted_at) }}
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
              <button
                v-if="canConfirm(application.status, application.is_confirmed)"
                @click="confirmApplication(application.id)"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirm
              </button>
              <button
                v-if="canCancel(application.status, application.is_confirmed)"
                @click="cancelApplication(application.id)"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedApplication" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeDetailModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ selectedApplication.internship_offer?.title || 'Unknown Offer' }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ selectedApplication.internship_offer?.company_profile?.name || 'Unknown Company' }}
              </p>
              <div class="mt-2 flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(selectedApplication.status, selectedApplication.is_confirmed),
                  ]"
                >
                  {{ normalizeStatus(selectedApplication.status, selectedApplication.is_confirmed) }}
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
                  <span class="text-gray-500">Applied on</span>
                  <p class="font-medium text-gray-900">{{ formatDateTime(selectedApplication.created_at) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Application Date</span>
                  <p class="font-medium text-gray-900">{{ formatDate(selectedApplication.application_date) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Application ID</span>
                  <p class="font-medium text-gray-900">#{{ selectedApplication.id }}</p>
                </div>
                <div v-if="selectedApplication.accepted_at">
                  <span class="text-gray-500">Accepted At</span>
                  <p class="font-medium text-gray-900">{{ formatDateTime(selectedApplication.accepted_at) }}</p>
                </div>
                <div v-if="selectedApplication.confirmed_at">
                  <span class="text-gray-500">Confirmed At</span>
                  <p class="font-medium text-gray-900">{{ formatDateTime(selectedApplication.confirmed_at) }}</p>
                </div>
              </div>
            </div>

            <!-- Offer Info -->
            <div v-if="selectedApplication.internship_offer">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Offer Details</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Company</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.internship_offer.company_profile?.name }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Location</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.internship_offer.wilaya }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Type</span>
                  <span class="font-medium text-gray-900 capitalize">{{ selectedApplication.internship_offer.internship_type?.replace('_', ' ') }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Duration</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.internship_offer.duration }} weeks</span>
                </div>
              </div>
            </div>

            <!-- CV Info -->
            <div v-if="selectedApplication.student_cv">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Submitted CV</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.first_name }} {{ selectedApplication.student_cv.last_name }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Email</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.email }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Phone</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.phone_number }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Academic Level</span>
                  <span class="font-medium text-gray-900">{{ selectedApplication.student_cv.academic_level }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            v-if="canConfirm(selectedApplication.status, selectedApplication.is_confirmed) || canCancel(selectedApplication.status, selectedApplication.is_confirmed)"
            class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3"
          >
            <button
              v-if="canCancel(selectedApplication.status, selectedApplication.is_confirmed)"
              @click="cancelApplication(selectedApplication.id)"
              class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
            >
              Cancel Application
            </button>
            <button
              v-if="canConfirm(selectedApplication.status, selectedApplication.is_confirmed)"
              @click="confirmApplication(selectedApplication.id)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Confirm Application
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

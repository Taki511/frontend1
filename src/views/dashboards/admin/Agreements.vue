<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const authStore = useAuthStore()

// State
const internships = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const universityDomain = ref('')

// Modal
const selectedInternship = ref<any>(null)
const showDetailModal = ref(false)

// Fetch internships (validated applications)
const fetchInternships = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/admin/internships`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load internships')
    }

    internships.value = data.data || []
    universityDomain.value = data.university_domain || ''
  } catch (err: any) {
    error.value = err.message || 'Failed to load internships'
  } finally {
    loading.value = false
  }
}

// Generate agreement
const generateAgreement = async (internshipId: number) => {
  if (!confirm('Are you sure you want to generate the agreement for this internship?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/admin/internships/${internshipId}/generate-agreement`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate agreement')
    }

    success.value = data.message || 'Agreement generated successfully!'
    await fetchInternships()
    if (selectedInternship.value?.id === internshipId) {
      closeDetailModal()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to generate agreement'
  }
}

// Download agreement
const downloadAgreement = async (agreementId: number, fileName?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/agreements/${agreementId}/download`, {
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to download agreement')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || `agreement_${agreementId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    success.value = 'Agreement downloaded successfully!'
  } catch (err: any) {
    error.value = err.message || 'Failed to download agreement'
  }
}

// Regenerate PDF
const regeneratePDF = async (agreementId: number) => {
  if (!confirm('Are you sure you want to regenerate the PDF for this agreement?')) return

  try {
    const response = await fetch(`${API_BASE_URL}/admin/agreements/${agreementId}/regenerate-pdf`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to regenerate PDF')
    }

    success.value = data.message || 'PDF regenerated successfully!'
    await fetchInternships()
  } catch (err: any) {
    error.value = err.message || 'Failed to regenerate PDF'
  }
}

// Modal helpers
const openDetailModal = (internship: any) => {
  selectedInternship.value = internship
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedInternship.value = null
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
  const s = (status || '').toLowerCase()
  if (s === 'ongoing') return 'bg-green-100 text-green-800 border-green-200'
  if (s === 'completed') return 'bg-blue-100 text-blue-800 border-blue-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

onMounted(() => {
  fetchInternships()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Agreements</h2>
        <p class="mt-1 text-gray-600">Generate and manage internship agreements for your university</p>
      </div>
      <div v-if="universityDomain" class="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {{ universityDomain }}
      </div>
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
    <div
      v-else-if="internships.length === 0"
      class="text-center py-12 bg-white rounded-xl border border-gray-200"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No internships yet</h3>
      <p class="text-gray-500">There are no validated internships in your university.</p>
    </div>

    <!-- Internships List -->
    <div v-else class="space-y-4">
      <div
        v-for="internship in internships"
        :key="internship.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-5">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-semibold text-gray-900">
                  {{ internship.application?.student?.name || `${internship.application?.student?.first_name} ${internship.application?.student?.last_name}` }}
                </h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(internship.status),
                  ]"
                >
                  {{ internship.status }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ internship.application?.student?.email }}
              </p>

              <div class="mt-3">
                <span class="text-sm font-medium text-gray-700">Internship:</span>
                <span class="text-sm text-gray-900 ml-1">{{ internship.application?.internship_offer?.title || 'Unknown Offer' }}</span>
                <span class="text-gray-400 mx-2">|</span>
                <span class="text-sm text-gray-500">{{ internship.application?.internship_offer?.company_profile?.name || 'Unknown Company' }}</span>
              </div>

              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Start {{ formatDate(internship.start_date) }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  End {{ formatDate(internship.end_date) }}
                </span>
                <span
                  v-if="internship.agreement"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Agreement Generated
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No Agreement
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="openDetailModal(internship)"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </button>
              <button
                v-if="!internship.agreement"
                @click="generateAgreement(internship.id)"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Generate
              </button>
              <button
                v-if="internship.agreement"
                @click="downloadAgreement(internship.agreement.id, internship.agreement.pdf_file?.split('/').pop())"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedInternship" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeDetailModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ selectedInternship.application?.student?.name || `${selectedInternship.application?.student?.first_name} ${selectedInternship.application?.student?.last_name}` }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ selectedInternship.application?.student?.email }}
              </p>
              <div class="mt-2 flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                    getStatusClasses(selectedInternship.status),
                  ]"
                >
                  {{ selectedInternship.status }}
                </span>
                <span
                  v-if="selectedInternship.agreement"
                  class="px-2 py-0.5 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200"
                >
                  Agreement Generated
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 text-xs font-medium rounded-full border bg-amber-100 text-amber-800 border-amber-200"
                >
                  No Agreement
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
            <!-- Internship Info -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Internship ID</span>
                  <p class="font-medium text-gray-900">#{{ selectedInternship.id }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Application ID</span>
                  <p class="font-medium text-gray-900">#{{ selectedInternship.application_id }}</p>
                </div>
                <div>
                  <span class="text-gray-500">Start Date</span>
                  <p class="font-medium text-gray-900">{{ formatDate(selectedInternship.start_date) }}</p>
                </div>
                <div>
                  <span class="text-gray-500">End Date</span>
                  <p class="font-medium text-gray-900">{{ formatDate(selectedInternship.end_date) }}</p>
                </div>
                <div v-if="selectedInternship.agreement">
                  <span class="text-gray-500">Generated Date</span>
                  <p class="font-medium text-gray-900">{{ formatDate(selectedInternship.agreement.generated_date) }}</p>
                </div>
                <div v-if="selectedInternship.agreement">
                  <span class="text-gray-500">Signature Status</span>
                  <p class="font-medium text-gray-900">{{ selectedInternship.agreement.signature_status ? 'Signed' : 'Pending' }}</p>
                </div>
              </div>
            </div>

            <!-- Offer Info -->
            <div v-if="selectedInternship.application?.internship_offer">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Offer Details</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between p-3 bg-gray-50 rounded-md sm:col-span-2">
                  <span class="text-gray-500">Offer</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.internship_offer.title }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Company</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.internship_offer.company_profile?.name }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Location</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.internship_offer.wilaya }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Type</span>
                  <span class="font-medium text-gray-900 capitalize">{{ selectedInternship.application.internship_offer.internship_type?.replace('_', ' ') }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Duration</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.internship_offer.duration }} weeks</span>
                </div>
              </div>
            </div>

            <!-- Student Info -->
            <div v-if="selectedInternship.application?.student">
              <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Student Information</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Name</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.student.name || `${selectedInternship.application.student.first_name} ${selectedInternship.application.student.last_name}` }}</span>
                </div>
                <div class="flex justify-between p-3 bg-gray-50 rounded-md">
                  <span class="text-gray-500">Email</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.student.email }}</span>
                </div>
                <div
                  v-if="selectedInternship.application.student.student_profile?.university_email"
                  class="flex justify-between p-3 bg-gray-50 rounded-md sm:col-span-2"
                >
                  <span class="text-gray-500">University Email</span>
                  <span class="font-medium text-gray-900">{{ selectedInternship.application.student.student_profile.university_email }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              v-if="selectedInternship.agreement"
              @click="regeneratePDF(selectedInternship.agreement.id)"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Regenerate PDF
            </button>
            <button
              v-if="!selectedInternship.agreement"
              @click="generateAgreement(selectedInternship.id)"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Generate Agreement
            </button>
            <button
              v-if="selectedInternship.agreement"
              @click="downloadAgreement(selectedInternship.agreement.id, selectedInternship.agreement.pdf_file?.split('/').pop())"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const authStore = useAuthStore()

// State
const cv = ref<any>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const hasCV = ref(false)

// Modal
const showModal = ref(false)
const isEditing = ref(false)

// Form
const form = ref({
  first_name: '',
  last_name: '',
  age: 22,
  full_address: '',
  phone_number: '',
  academic_level: '',
  email: '',
  university_email: '',
  github_link: '',
  linkedin_link: '',
  portfolio_link: '',
  motivation_letter: '',
  personal_info: '',
  personal_photo: '',
})
const formErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Fetch CV
const fetchCV = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/my-cv`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    const data = await response.json()

    if (response.ok && data.data) {
      cv.value = data.data
      hasCV.value = true
    } else {
      cv.value = null
      hasCV.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load CV'
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    first_name: '',
    last_name: '',
    age: 22,
    full_address: '',
    phone_number: '',
    academic_level: '',
    email: '',
    university_email: '',
    github_link: '',
    linkedin_link: '',
    portfolio_link: '',
    motivation_letter: '',
    personal_info: '',
    personal_photo: '',
  }
  formErrors.value = {}
}

// Open create modal
const openCreateModal = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

// Open edit modal
const openEditModal = () => {
  if (!cv.value) return
  form.value = {
    first_name: cv.value.first_name || '',
    last_name: cv.value.last_name || '',
    age: cv.value.age || 22,
    full_address: cv.value.full_address || '',
    phone_number: cv.value.phone_number || '',
    academic_level: cv.value.academic_level || '',
    email: cv.value.email || '',
    university_email: cv.value.university_email || '',
    github_link: cv.value.github_link || '',
    linkedin_link: cv.value.linkedin_link || '',
    portfolio_link: cv.value.portfolio_link || '',
    motivation_letter: cv.value.motivation_letter || '',
    personal_info: cv.value.personal_info || '',
    personal_photo: cv.value.personal_photo || '',
  }
  formErrors.value = {}
  isEditing.value = true
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
}

// Create CV
const createCV = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/my-cv`, {
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
      throw new Error(data.message || 'Failed to create CV')
    }

    success.value = 'CV created successfully!'
    closeModal()
    await fetchCV()
  } catch (err: any) {
    error.value = err.message || 'Failed to create CV'
  } finally {
    isSubmitting.value = false
  }
}

// Update CV
const updateCV = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/my-cv`, {
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
      throw new Error(data.message || 'Failed to update CV')
    }

    success.value = 'CV updated successfully!'
    closeModal()
    await fetchCV()
  } catch (err: any) {
    error.value = err.message || 'Failed to update CV'
  } finally {
    isSubmitting.value = false
  }
}

// Delete CV
const deleteCV = async () => {
  if (!confirm('Are you sure you want to delete your CV? This action cannot be undone.')) return

  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/my-cv`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to delete CV')
    }

    success.value = 'CV deleted successfully!'
    await fetchCV()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete CV'
  }
}

onMounted(() => {
  fetchCV()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">My CV</h2>
        <p class="mt-1 text-gray-600">Manage your curriculum vitae</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="hasCV"
          @click="openEditModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit CV
        </button>
        <button
          v-if="hasCV"
          @click="deleteCV"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
        <button
          v-else
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create CV
        </button>
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
      v-else-if="!hasCV"
      class="text-center py-12 bg-white rounded-xl border border-gray-200"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No CV yet</h3>
      <p class="text-gray-500 mb-4">Create your CV to start applying for internships.</p>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create CV
      </button>
    </div>

    <!-- CV Card -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Photo -->
          <div class="shrink-0">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
              <img
                v-if="cv.personal_photo"
                :src="cv.personal_photo"
                alt="Personal Photo"
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                class="w-12 h-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-2xl font-bold text-gray-900">{{ cv.first_name }} {{ cv.last_name }}</h3>
            <p class="mt-1 text-gray-500">{{ cv.email }}</p>
            <p v-if="cv.university_email" class="text-gray-500">{{ cv.university_email }}</p>

            <div class="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                {{ cv.academic_level }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {{ cv.phone_number }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zM3 9h18M5 21h14" />
                </svg>
                Age {{ cv.age }}
              </span>
            </div>

            <div class="mt-6 space-y-4">
              <div>
                <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Address</h4>
                <p class="text-gray-600">{{ cv.full_address }}</p>
              </div>

              <div v-if="cv.personal_info">
                <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Personal Info</h4>
                <p class="text-gray-600">{{ cv.personal_info }}</p>
              </div>

              <div v-if="cv.motivation_letter">
                <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">Motivation Letter</h4>
                <p class="text-gray-600 whitespace-pre-wrap">{{ cv.motivation_letter }}</p>
              </div>

              <div
                v-if="cv.github_link || cv.linkedin_link || cv.portfolio_link"
                class="flex flex-wrap gap-2 pt-2"
              >
                <a
                  v-if="cv.github_link"
                  :href="cv.github_link"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  v-if="cv.linkedin_link"
                  :href="cv.linkedin_link"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  v-if="cv.portfolio_link"
                  :href="cv.portfolio_link"
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
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit CV' : 'Create CV' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- First Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
                <input
                  v-model="form.first_name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.first_name }"
                />
                <p v-if="formErrors.first_name" class="mt-1 text-xs text-red-600">{{ formErrors.first_name }}</p>
              </div>

              <!-- Last Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name <span class="text-red-500">*</span></label>
                <input
                  v-model="form.last_name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.last_name }"
                />
                <p v-if="formErrors.last_name" class="mt-1 text-xs text-red-600">{{ formErrors.last_name }}</p>
              </div>

              <!-- Age -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Age <span class="text-red-500">*</span></label>
                <input
                  v-model.number="form.age"
                  type="number"
                  min="16"
                  max="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.age }"
                />
                <p v-if="formErrors.age" class="mt-1 text-xs text-red-600">{{ formErrors.age }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number <span class="text-red-500">*</span></label>
                <input
                  v-model="form.phone_number"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.phone_number }"
                />
                <p v-if="formErrors.phone_number" class="mt-1 text-xs text-red-600">{{ formErrors.phone_number }}</p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.email }"
                />
                <p v-if="formErrors.email" class="mt-1 text-xs text-red-600">{{ formErrors.email }}</p>
              </div>

              <!-- University Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">University Email <span class="text-red-500">*</span></label>
                <input
                  v-model="form.university_email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.university_email }"
                />
                <p v-if="formErrors.university_email" class="mt-1 text-xs text-red-600">{{ formErrors.university_email }}</p>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Address <span class="text-red-500">*</span></label>
              <input
                v-model="form.full_address"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.full_address }"
              />
              <p v-if="formErrors.full_address" class="mt-1 text-xs text-red-600">{{ formErrors.full_address }}</p>
            </div>

            <!-- Academic Level -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Academic Level <span class="text-red-500">*</span></label>
              <input
                v-model="form.academic_level"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.academic_level }"
                placeholder="e.g. 3rd Year Computer Science"
              />
              <p v-if="formErrors.academic_level" class="mt-1 text-xs text-red-600">{{ formErrors.academic_level }}</p>
            </div>

            <!-- Links -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  v-model="form.github_link"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.github_link }"
                  placeholder="https://github.com/..."
                />
                <p v-if="formErrors.github_link" class="mt-1 text-xs text-red-600">{{ formErrors.github_link }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  v-model="form.linkedin_link"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.linkedin_link }"
                  placeholder="https://linkedin.com/in/..."
                />
                <p v-if="formErrors.linkedin_link" class="mt-1 text-xs text-red-600">{{ formErrors.linkedin_link }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                <input
                  v-model="form.portfolio_link"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  :class="{ 'border-red-300': formErrors.portfolio_link }"
                  placeholder="https://..."
                />
                <p v-if="formErrors.portfolio_link" class="mt-1 text-xs text-red-600">{{ formErrors.portfolio_link }}</p>
              </div>
            </div>

            <!-- Personal Photo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Personal Photo URL</label>
              <input
                v-model="form.personal_photo"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.personal_photo }"
                placeholder="https://example.com/photo.jpg"
              />
              <p v-if="formErrors.personal_photo" class="mt-1 text-xs text-red-600">{{ formErrors.personal_photo }}</p>
            </div>

            <!-- Personal Info -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Personal Info</label>
              <textarea
                v-model="form.personal_info"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.personal_info }"
                placeholder="Additional personal information..."
              ></textarea>
              <p v-if="formErrors.personal_info" class="mt-1 text-xs text-red-600">{{ formErrors.personal_info }}</p>
            </div>

            <!-- Motivation Letter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Motivation Letter</label>
              <textarea
                v-model="form.motivation_letter"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.motivation_letter }"
                placeholder="Write your motivation letter..."
              ></textarea>
              <p v-if="formErrors.motivation_letter" class="mt-1 text-xs text-red-600">{{ formErrors.motivation_letter }}</p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              v-if="!isEditing"
              @click="createCV"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Creating...' : 'Create CV' }}
            </button>
            <button
              v-else
              @click="updateCV"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

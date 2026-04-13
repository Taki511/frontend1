<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'
const authStore = useAuthStore()

// State
const profile = ref<any>(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const hasProfile = ref(false)

// Modal
const showModal = ref(false)
const isEditing = ref(false)

// Form
const form = ref({
  name: '',
  description: '',
  wilaya: '',
  address: '',
  logo: '',
})
const formErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida',
  'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers', 'Djelfa', 'Jijel',
  'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
  'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'El M\'ghair', 'El Menia', 'Ouled Djellal',
  'Bordj Baji Mokhtar', 'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
]

// Fetch profile
const fetchProfile = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/company-profile`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })
    const data = await response.json()

    if (response.ok && data.data) {
      profile.value = data.data
      hasProfile.value = true
    } else {
      profile.value = null
      hasProfile.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load company profile'
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    wilaya: '',
    address: '',
    logo: '',
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
  if (!profile.value) return
  form.value = {
    name: profile.value.name || '',
    description: profile.value.description || '',
    wilaya: profile.value.wilaya || '',
    address: profile.value.address || '',
    logo: profile.value.logo || '',
  }
  formErrors.value = {}
  isEditing.value = true
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
}

// Create profile
const createProfile = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/company-profile`, {
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
      throw new Error(data.message || 'Failed to create profile')
    }

    success.value = 'Company profile created successfully!'
    closeModal()
    await fetchProfile()
  } catch (err: any) {
    error.value = err.message || 'Failed to create profile'
  } finally {
    isSubmitting.value = false
  }
}

// Update profile
const updateProfile = async () => {
  isSubmitting.value = true
  formErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/company-profile`, {
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
      throw new Error(data.message || 'Failed to update profile')
    }

    success.value = 'Company profile updated successfully!'
    closeModal()
    await fetchProfile()
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    isSubmitting.value = false
  }
}

// Delete profile
const deleteProfile = async () => {
  if (!confirm('Are you sure you want to delete your company profile? This action cannot be undone.')) return

  error.value = ''
  success.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/company-profile`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to delete profile')
    }

    success.value = 'Company profile deleted successfully!'
    await fetchProfile()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete profile'
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Company Profile</h2>
        <p class="mt-1 text-gray-600">Manage your company information</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="hasProfile"
          @click="openEditModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Profile
        </button>
        <button
          v-if="hasProfile"
          @click="deleteProfile"
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
          Create Profile
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
      v-else-if="!hasProfile"
      class="text-center py-12 bg-white rounded-xl border border-gray-200"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-1">No company profile yet</h3>
      <p class="text-gray-500 mb-4">Create your company profile to start posting internship offers.</p>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Profile
      </button>
    </div>

    <!-- Profile Card -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Logo -->
          <div class="shrink-0">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
              <img
                v-if="profile.logo"
                :src="profile.logo"
                alt="Company Logo"
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
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-2xl font-bold text-gray-900">{{ profile.name }}</h3>
            <p class="mt-3 text-gray-600 leading-relaxed">{{ profile.description }}</p>

            <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ profile.wilaya }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ profile.address }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Edit Company Profile' : 'Create Company Profile' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company Name <span class="text-red-500">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.name }"
                placeholder="e.g. Tech Solutions Algeria"
              />
              <p v-if="formErrors.name" class="mt-1 text-xs text-red-600">{{ formErrors.name }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.description }"
                placeholder="Describe your company, mission, and culture..."
              ></textarea>
              <p v-if="formErrors.description" class="mt-1 text-xs text-red-600">{{ formErrors.description }}</p>
            </div>

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

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address <span class="text-red-500">*</span></label>
              <input
                v-model="form.address"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.address }"
                placeholder="e.g. 123 Tech Street, Hydra"
              />
              <p v-if="formErrors.address" class="mt-1 text-xs text-red-600">{{ formErrors.address }}</p>
            </div>

            <!-- Logo URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                v-model="form.logo"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                :class="{ 'border-red-300': formErrors.logo }"
                placeholder="https://example.com/logo.png"
              />
              <p v-if="formErrors.logo" class="mt-1 text-xs text-red-600">{{ formErrors.logo }}</p>
              <p class="mt-1 text-xs text-gray-500">Optional — link to your company logo image</p>
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
              @click="createProfile"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Profile' }}
            </button>
            <button
              v-else
              @click="updateProfile"
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

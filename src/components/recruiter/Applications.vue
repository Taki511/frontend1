<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const authStore = useAuthStore()
const offers = ref<any[]>([])
const applications = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const selectedOffer = ref<number | 'all'>('all')
const selectedApplication = ref<any>(null)
const showDetailModal = ref(false)

const fetchOffers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-internship-offers`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch offers')
    const data = await response.json()
    offers.value = data.data || []
  } catch (err: any) {
    console.error('Error fetching offers:', err)
  }
}

const fetchApplications = async () => {
  loading.value = true
  error.value = ''
  applications.value = []
  
  try {
    // Fetch applications for each offer
    const allApplications: any[] = []
    
    for (const offer of offers.value) {
      const response = await fetch(`${API_BASE_URL}/internship-offers/${offer.id}/applications`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
        },
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

// Only show pending applications
const pendingApplications = computed(() => {
  let filtered = applications.value.filter(app => app.status === 'PENDING')
  
  // Filter by offer
  if (selectedOffer.value !== 'all') {
    filtered = filtered.filter(app => app.offer_id === selectedOffer.value)
  }
  
  // Sort by newest first
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const pendingCount = computed(() => {
  return applications.value.filter(app => app.status === 'PENDING').length
})

const acceptApplication = async (applicationId: number) => {
  if (!confirm('Are you sure you want to accept this application?')) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })
    
    if (!response.ok) throw new Error('Failed to accept application')
    await fetchApplications()
    if (selectedApplication.value?.id === applicationId) {
      showDetailModal.value = false
      selectedApplication.value = null
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
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    })
    
    if (!response.ok) throw new Error('Failed to refuse application')
    await fetchApplications()
    if (selectedApplication.value?.id === applicationId) {
      showDetailModal.value = false
      selectedApplication.value = null
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to refuse application'
  }
}

const openDetailModal = (application: any) => {
  selectedApplication.value = application
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedApplication.value = null
}

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
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await fetchOffers()
  await fetchApplications()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;" class="sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827;">Applications</h2>
        <p style="color: #6b7280; margin-top: 0.25rem;">Review and manage pending applications</p>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="padding: 0.5rem 1rem; background-color: #fef3c7; color: #92400e; font-size: 0.875rem; font-weight: 600; border-radius: 9999px; border: 1px solid #fcd34d;">
          {{ pendingCount }} Pending
        </span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" style="margin-bottom: 1.5rem; padding: 1rem; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; color: #b91c1c;">
      {{ error }}
    </div>

    <!-- Filter -->
    <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.5rem;">
      <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">Filter by Offer</label>
      <select
        v-model="selectedOffer"
        style="width: 100%; max-width: 20rem; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background-color: white;"
      >
        <option value="all">All Offers</option>
        <option v-for="offer in offers" :key="offer.id" :value="offer.id">
          {{ offer.title }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" style="display: flex; justify-content: center; padding: 3rem 0;">
      <div style="animation: spin 1s linear infinite; border-radius: 9999px; height: 2rem; width: 2rem; border-bottom: 2px solid #22c55e;"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!pendingApplications.length" style="text-align: center; padding: 3rem 0; background-color: white; border-radius: 0.75rem; border: 1px solid #e5e7eb;">
      <div style="width: 4rem; height: 4rem; background-color: #f3f4f6; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
        <svg style="width: 2rem; height: 2rem; color: #9ca3af;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">No pending applications</h3>
      <p style="color: #6b7280;">
        {{ applications.length === 0 
          ? "You haven't received any applications yet" 
          : "All applications have been reviewed" 
        }}
      </p>
    </div>

    <!-- Applications List -->
    <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
      <div
        v-for="application in pendingApplications"
        :key="application.id"
        @click="openDetailModal(application)"
        style="background-color: white; border-radius: 0.75rem; border: 1px solid #e5e7eb; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s;"
        onmouseover="this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.1)'"
        onmouseout="this.style.boxShadow='none'"
      >
        <!-- Card Header -->
        <div style="padding: 1rem 1.25rem; background: linear-gradient(to right, #fef3c7, #ffffff); border-bottom: 1px solid #f3f4f6;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
            <div style="flex: 1; min-width: 0;">
              <h3 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">
                {{ application.student?.first_name }} {{ application.student?.last_name }}
              </h3>
              <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">{{ application.student?.email }}</p>
            </div>
            <span style="padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; white-space: nowrap;">
              Pending
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div style="padding: 1rem 1.25rem;">
          <div style="margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Applied for</span>
            <p style="font-weight: 600; color: #111827; margin: 0.25rem 0 0 0;">{{ application.offer_title }}</p>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: #6b7280;">
            <span style="display: flex; align-items: center; gap: 0.5rem;">
              <svg style="width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Applied {{ formatDate(application.created_at) }}
            </span>
            <span v-if="application.cv?.academic_level" style="display: flex; align-items: center; gap: 0.5rem;">
              <svg style="width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              {{ application.cv.academic_level }}
            </span>
          </div>
        </div>

        <!-- Card Footer with Actions -->
        <div style="padding: 0.75rem 1.25rem; background-color: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button
            @click.stop="refuseApplication(application.id)"
            style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #dc2626; background-color: white; border: 1px solid #fecaca; border-radius: 0.5rem; cursor: pointer;"
          >
            <svg style="width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Refuse
          </button>
          <button
            @click.stop="acceptApplication(application.id)"
            style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #22c55e; border: none; border-radius: 0.5rem; cursor: pointer;"
          >
            <svg style="width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedApplication" style="position: fixed; inset: 0; z-index: 50; overflow-y: auto;">
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem;">
        <div style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.5);" @click="closeDetailModal"></div>
        <div style="position: relative; background-color: white; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-width: 40rem; width: 100%; max-height: 90vh; overflow-y: auto;">
          <!-- Modal Header -->
          <div style="position: sticky; top: 0; background: linear-gradient(to right, #fef3c7, #ffffff); border-bottom: 1px solid #e5e7eb; padding: 1.25rem 1.5rem;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0;">
                  {{ selectedApplication.student?.first_name }} {{ selectedApplication.student?.last_name }}
                </h2>
                <p style="color: #6b7280; margin: 0.25rem 0 0 0;">{{ selectedApplication.student?.email }}</p>
              </div>
              <button @click="closeDetailModal" style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 0.25rem;">
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style="margin-top: 0.75rem;">
              <span style="padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d;">
                Pending Review
              </span>
            </div>
          </div>

          <!-- Modal Body -->
          <div style="padding: 1.5rem;">
            <!-- Application Info -->
            <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Applied for</h4>
              <p style="font-weight: 600; color: #111827; margin: 0;">{{ selectedApplication.offer_title }}</p>
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0 0;">Applied on {{ formatDateTime(selectedApplication.created_at) }}</p>
            </div>

            <!-- Student Info -->
            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.875rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Student Information</h4>
              <div style="display: grid; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem;">
                  <span style="color: #6b7280;">Name</span>
                  <span style="font-weight: 500; color: #111827;">{{ selectedApplication.student?.first_name }} {{ selectedApplication.student?.last_name }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem;">
                  <span style="color: #6b7280;">Email</span>
                  <span style="font-weight: 500; color: #111827;">{{ selectedApplication.student?.email }}</span>
                </div>
                <div v-if="selectedApplication.student?.university_email" style="display: flex; justify-content: space-between; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem;">
                  <span style="color: #6b7280;">University Email</span>
                  <span style="font-weight: 500; color: #111827;">{{ selectedApplication.student?.university_email }}</span>
                </div>
              </div>
            </div>

            <!-- CV Info -->
            <div v-if="selectedApplication.cv" style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.875rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">CV Information</h4>
              <div style="display: grid; gap: 0.75rem;">
                <div v-if="selectedApplication.cv.academic_level" style="display: flex; justify-content: space-between; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem;">
                  <span style="color: #6b7280;">Academic Level</span>
                  <span style="font-weight: 500; color: #111827;">{{ selectedApplication.cv.academic_level }}</span>
                </div>
                <div v-if="selectedApplication.cv.phone_number" style="display: flex; justify-content: space-between; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem;">
                  <span style="color: #6b7280;">Phone</span>
                  <span style="font-weight: 500; color: #111827;">{{ selectedApplication.cv.phone_number }}</span>
                </div>
                <div v-if="selectedApplication.cv.full_address" style="display: flex; justify-content: space-between; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem;">
                  <span style="color: #6b7280;">Address</span>
                  <span style="font-weight: 500; color: #111827; text-align: right;">{{ selectedApplication.cv.full_address }}</span>
                </div>
              </div>

              <!-- Links -->
              <div v-if="selectedApplication.cv.github_link || selectedApplication.cv.linkedin_link || selectedApplication.cv.portfolio_link" style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.75rem;">
                <a
                  v-if="selectedApplication.cv.github_link"
                  :href="selectedApplication.cv.github_link"
                  target="_blank"
                  style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: #f3f4f6; color: #374151; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; text-decoration: none;"
                >
                  <svg style="width: 1rem; height: 1rem;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  v-if="selectedApplication.cv.linkedin_link"
                  :href="selectedApplication.cv.linkedin_link"
                  target="_blank"
                  style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: #f3f4f6; color: #374151; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; text-decoration: none;"
                >
                  <svg style="width: 1rem; height: 1rem;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  v-if="selectedApplication.cv.portfolio_link"
                  :href="selectedApplication.cv.portfolio_link"
                  target="_blank"
                  style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: #f3f4f6; color: #374151; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; text-decoration: none;"
                >
                  <svg style="width: 1rem; height: 1rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio
                </a>
              </div>
            </div>

            <!-- Motivation Letter -->
            <div v-if="selectedApplication.cv?.motivation_letter" style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.875rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Motivation Letter</h4>
              <div style="padding: 1rem; background-color: #f9fafb; border-radius: 0.5rem;">
                <p style="color: #4b5563; line-height: 1.6; margin: 0; white-space: pre-wrap;">{{ selectedApplication.cv.motivation_letter }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div style="position: sticky; bottom: 0; background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 1rem 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button
              @click="refuseApplication(selectedApplication.id)"
              style="padding: 0.5rem 1.5rem; border: 1px solid #fecaca; color: #dc2626; font-weight: 500; border-radius: 0.5rem; background-color: white; cursor: pointer;"
            >
              Refuse
            </button>
            <button
              @click="acceptApplication(selectedApplication.id)"
              style="padding: 0.5rem 1.5rem; background-color: #22c55e; color: white; font-weight: 500; border-radius: 0.5rem; border: none; cursor: pointer;"
            >
              Accept Application
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

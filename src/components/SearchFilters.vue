<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchQuery = ref('')
const selectedWilaya = ref('')
const selectedSkill = ref('')
const selectedType = ref('')

const wilayas = ref([
  'Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Setif',
  'Sidi Bel Abbes', 'Biskra', 'Tebessa', 'El Oued', 'Skikda', 'Tiaret', 'Bejaia',
  'Tlemcen', 'Ouargla', 'Bechar', 'Mostaganem', 'Bordj Bou Arreridj', 'Chlef',
  'Souk Ahras', 'Medea', 'El Bayadh', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent',
  'Ghardaia', 'Relizane', 'El Mghair', 'El Menia', 'Ouled Djellal', 'Bordj Baji Mokhtar',
  'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
])

const skills = ref<string[]>([])
const types = ref([
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'remote', label: 'Remote' },
])

const fetchSkills = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/internship-offers/skills/list')
    const data = await response.json()
    skills.value = data.data?.map((skill: { name: string }) => skill.name) || []
  } catch (error) {
    console.error('Error fetching skills:', error)
    skills.value = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'PHP', 'Laravel', 'MySQL', 'MongoDB']
  }
}

const handleSearch = () => {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) query.q = searchQuery.value.trim()
  if (selectedWilaya.value) query.wilaya = selectedWilaya.value
  if (selectedSkill.value) query.skill = selectedSkill.value
  if (selectedType.value) query.type = selectedType.value

  router.push({
    path: '/offers',
    query,
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedWilaya.value = ''
  selectedSkill.value = ''
  selectedType.value = ''
}

onMounted(() => {
  fetchSkills()
})
</script>

<template>
  <section class="py-8 -mt-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <!-- Search Input -->
          <div class="md:col-span-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search internships..."
                class="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
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
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
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
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
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
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
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
            class="flex-1 sm:flex-none sm:px-8 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
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
    </div>
  </section>
</template>

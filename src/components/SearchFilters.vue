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
  if (searchQuery.value) query.search = searchQuery.value
  if (selectedWilaya.value) query.wilaya = selectedWilaya.value
  if (selectedSkill.value) query.skill = selectedSkill.value
  if (selectedType.value) query.type = selectedType.value

  router.push({
    path: '/offers',
    query,
  })
}

onMounted(() => {
  fetchSkills()
})
</script>

<template>
  <section class="py-8 -mt-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search Input -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search internships..."
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- Location Dropdown -->
          <div>
            <select
              v-model="selectedWilaya"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="">Location (Wilaya)</option>
              <option v-for="wilaya in wilayas" :key="wilaya" :value="wilaya">
                {{ wilaya }}
              </option>
            </select>
          </div>

          <!-- Skills Dropdown -->
          <div>
            <select
              v-model="selectedSkill"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="">Tech Skills</option>
              <option v-for="skill in skills" :key="skill" :value="skill">
                {{ skill }}
              </option>
            </select>
          </div>

          <!-- Type Dropdown -->
          <div>
            <select
              v-model="selectedType"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="">Type</option>
              <option v-for="type in types" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Search Button (Mobile) -->
        <div class="mt-4 md:hidden">
          <button
            @click="handleSearch"
            class="w-full py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import FeaturedInternships from '../components/FeaturedInternships.vue'
import WhySection from '../components/WhySection.vue'
import StatsSection from '../components/StatsSection.vue'
import TestimonialsSection from '../components/TestimonialsSection.vue'
import Footer from '../components/Footer.vue'

const featuredOffers = ref([])
const stats = ref({
  total_offers: 0,
})

const fetchFeaturedOffers = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/internship-offers?per_page=6')
    const data = await response.json()
    featuredOffers.value = data.data || []
  } catch (error) {
    console.error('Error fetching offers:', error)
  }
}

const fetchStats = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/internship-offers')
    const data = await response.json()
    stats.value.total_offers = data.meta?.total || 100
  } catch (error) {
    console.error('Error fetching stats:', error)
    stats.value.total_offers = 100
  }
}

onMounted(() => {
  fetchFeaturedOffers()
  fetchStats()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <Navbar />
    <HeroSection />
    <FeaturedInternships :offers="featuredOffers" />
    <WhySection />
    <StatsSection :total-offers="stats.total_offers" />
    <TestimonialsSection />
    <Footer />
  </div>
</template>

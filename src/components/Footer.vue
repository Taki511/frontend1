<script setup lang="ts">
const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
]
</script>

<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About Us -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider mb-4">About Us</h4>
          <ul class="space-y-3">
            <li v-for="link in companyLinks" :key="link.label">
              <router-link
                :to="link.href"
                class="text-gray-400 hover:text-white transition-colors"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
          <div class="space-y-3">
            <p class="text-gray-400">support@stageio.com</p>
            <p class="text-gray-400">+213 555 123 456</p>
          </div>
        </div>

        <!-- Follow Us -->
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider mb-4">Follow Us</h4>
          <ul class="space-y-3">
            <li v-for="link in socialLinks" :key="link.label">
              <a
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-white transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-gray-400 text-sm">
          © 2026 Stage.io. All rights reserved. Connecting students with opportunities across Algeria.
        </p>
      </div>
    </div>
  </footer>
</template>

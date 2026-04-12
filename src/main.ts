import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth state before mounting
const init = async () => {
  const { useAuthStore } = await import('./stores/auth')
  const authStore = useAuthStore()
  await authStore.initializeAuth()
  app.mount('#app')
}

init()

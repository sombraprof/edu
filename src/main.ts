import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import { initMaterialTheme } from './theme/material-theme';

// Create a head instance
const head = createHead();

// Initialize Material You theming before mounting the application
initMaterialTheme();

createApp(App).use(router).use(head).mount('#app');

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(swUrl).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

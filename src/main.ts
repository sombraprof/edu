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

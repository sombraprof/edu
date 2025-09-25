import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';
import './assets/styles.css';

// Create a head instance
const head = createHead();

// Restore theme preference with light mode as default
const storedTheme = localStorage.getItem('theme');
const isLight = storedTheme ? storedTheme === 'light' : true;
document.documentElement.classList.toggle('light', isLight);

createApp(App).use(router).use(head).mount('#app');
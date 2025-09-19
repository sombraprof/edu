// Entry file for SPA
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/styles.css';

// Restore theme preference with light mode as default
const storedTheme = localStorage.getItem('theme');
const isLight = storedTheme ? storedTheme === 'light' : true;
document.documentElement.classList.toggle('light', isLight);

createApp(App).use(router).mount('#app');
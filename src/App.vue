<template>
  <!-- App root layout -->
  <div class="app-shell">
    <SiteHeader />
    <main class="md-page">
      <router-view />
    </main>
    <SiteFooter />

    <transition name="fade-expand">
      <Md3Button
        v-if="showScrollTop"
        variant="tonal"
        icon
        class="md3-fab"
        type="button"
        @click="scrollToTop"
        aria-label="Voltar ao topo"
      >
        <template #leading>
          <ArrowUp class="md-icon" aria-hidden="true" />
        </template>
      </Md3Button>
    </transition>
  </div>
</template>

<script setup lang="ts">
// Root shell with a scroll-to-top action and teacher mode shortcut
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArrowUp } from 'lucide-vue-next';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import Md3Button from './components/Md3Button.vue';
import { useTeacherMode } from './composables/useTeacherMode';

const showScrollTop = ref(false);
const { teacherMode, toggleTeacherMode, isAuthoringForced } = useTeacherMode();

function handleScroll() {
  showScrollTop.value = window.scrollY > 320;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleTeacherShortcut(event: KeyboardEvent) {
  if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'p') {
    event.preventDefault();
    if (isAuthoringForced.value) {
      return;
    }
    toggleTeacherMode();
    const message = teacherMode.value ? 'Modo professor ativado.' : 'Modo professor desativado.';
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  window.addEventListener('keydown', handleTeacherShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleTeacherShortcut);
});
</script>

<style scoped>
.fade-expand-enter-active,
.fade-expand-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.fade-expand-enter-from,
.fade-expand-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

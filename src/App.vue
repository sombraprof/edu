<template>
  <!-- App root layout -->
  <div class="min-h-screen text-[var(--md-sys-color-on-background)]">
    <SiteHeader />
    <main class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-10">
      <router-view />
    </main>
    <SiteFooter />

    <transition name="fade-expand">
      <button
        v-if="showScrollTop"
        class="fab btn btn-filled"
        type="button"
        @click="scrollToTop"
        aria-label="Voltar ao topo"
      >
        <ArrowUp
          :style="{
            height: 'var(--md-sys-icon-size-small)',
            width: 'var(--md-sys-icon-size-small)',
          }"
        />
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
// Root shell with a scroll-to-top action
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArrowUp } from 'lucide-vue-next';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';

const showScrollTop = ref(false);

function handleScroll() {
  showScrollTop.value = window.scrollY > 320;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
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

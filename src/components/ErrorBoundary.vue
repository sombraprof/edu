<template>
  <div>
    <!-- Error UI -->
    <div
      v-if="hasError"
      class="error-boundary p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <div class="flex items-center gap-3 mb-4">
        <i class="fa-solid fa-triangle-exclamation text-red-600 dark:text-red-400 text-xl" />
        <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">
          Algo deu errado
        </h3>
      </div>

      <p class="text-red-700 dark:text-red-300 mb-4">
        {{ errorMessage || 'Ocorreu um erro inesperado. Tente recarregar a página.' }}
      </p>

      <div class="flex gap-3">
        <button
          @click="retry"
          class="btn btn-primary"
        >
          <i class="fa-solid fa-rotate-right mr-2" />
          Tentar novamente
        </button>

        <button
          @click="reload"
          class="btn btn-outlined"
        >
          <i class="fa-solid fa-refresh mr-2" />
          Recarregar página
        </button>
      </div>

      <!-- Development error details -->
      <details v-if="isDevelopment" class="mt-4">
        <summary class="cursor-pointer text-sm text-red-600 dark:text-red-400">
          Detalhes técnicos (desenvolvimento)
        </summary>
        <pre class="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded text-xs overflow-auto">{{ errorStack }}</pre>
      </details>
    </div>

    <!-- Normal content -->
    <slot v-else />
  </div>
</template>

<script>
/**
 * Error Boundary component for Vue 3
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export default {
  name: 'ErrorBoundary',

  data() {
    return {
      hasError: false,
      errorMessage: '',
      errorStack: '',
      isDevelopment: import.meta.env.DEV
    }
  },

  errorCaptured(error, instance, info) {
    // Log the error
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      component: instance?.$?.type?.name || 'Unknown',
      info,
      timestamp: new Date().toISOString()
    });

    // Update state
    this.hasError = true;
    this.errorMessage = error.message || 'Erro desconhecido';
    this.errorStack = error.stack || '';

    // Prevent the error from propagating
    return false;
  },

  methods: {
    retry() {
      this.hasError = false;
      this.errorMessage = '';
      this.errorStack = '';

      // Emit event to parent for retry logic
      this.$emit('retry');
    },

    reload() {
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.error-boundary {
  max-width: 600px;
  margin: 2rem auto;
}

details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}

details summary::before {
  content: '▶';
  margin-right: 0.5rem;
  transition: transform 0.2s;
}

details[open] summary::before {
  transform: rotate(90deg);
}
</style>
<template>
  <main class="teacher-guide md-stack md-stack-6">
    <section class="md-stack md-stack-3">
      <header class="md-stack md-stack-2">
        <span class="chip chip--outlined self-start text-primary">Modo professor</span>
        <h1 class="md-typescale-headline-small font-semibold text-on-surface">
          Como usar o editor inline/local
        </h1>
        <p class="text-on-surface-variant md-typescale-body-medium">
          Este ambiente concentra as ferramentas de edição diretamente nas telas de aulas e
          exercícios. Ative o modo professor, escolha um conteúdo e edite com pré-visualização em
          tempo real. Quando precisar sincronizar com arquivos locais, utilize os comandos abaixo.
        </p>
      </header>
    </section>

    <section class="md-stack md-stack-3">
      <h2 class="md-typescale-title-large font-semibold text-on-surface">
        1. Ative o modo professor
      </h2>
      <ul class="md-stack md-stack-2 list-disc pl-6 text-on-surface-variant">
        <li>Use o botão “Professor” no rodapé para habilitar o modo docente.</li>
        <li>
          Em ambientes locais você também pode abrir a URL com
          <code class="chip chip--filled">?teacher=1</code> para acionar o modo automaticamente.
        </li>
        <li>
          Após ativar, acesse qualquer aula ou exercício para visualizar o painel lateral de edição.
        </li>
      </ul>
    </section>

    <section class="md-stack md-stack-3">
      <h2 class="md-typescale-title-large font-semibold text-on-surface">
        2. Edite conteúdos inline
      </h2>
      <ul class="md-stack md-stack-2 list-disc pl-6 text-on-surface-variant">
        <li>
          Ajuste metadados, listas e blocos de conteúdo utilizando o painel “Editar aula” ou “Editar
          exercício”.
        </li>
        <li>
          Os campos aplicam as alterações imediatamente ao modelo em memória, permitindo revisar o
          resultado na mesma página.
        </li>
        <li>Utilize “Reverter alterações” para retornar ao estado carregado do arquivo.</li>
      </ul>
    </section>

    <section class="md-stack md-stack-3">
      <h2 class="md-typescale-title-large font-semibold text-on-surface">
        3. Sincronize com arquivos locais
      </h2>
      <ol class="md-stack md-stack-2 list-decimal pl-6 text-on-surface-variant">
        <li>
          Execute <code class="chip chip--filled">npm run dev:teacher</code> em outro terminal.
        </li>
        <li>
          Informe a variável <code class="chip chip--filled">VITE_TEACHER_API_URL</code> caso a API
          rode em um endereço diferente do padrão.
        </li>
        <li>
          A cada alteração o painel indicará o status de salvamento e enviará o JSON atualizado para
          o serviço local.
        </li>
      </ol>
      <p class="text-sm text-on-surface-variant">
        O serviço de automação apenas manipula arquivos locais. Crie commits e pull requests da
        maneira habitual utilizando sua ferramenta Git favorita.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
// Página informativa sem lógica adicional.
</script>

<style scoped>
.teacher-guide {
  margin: 0 auto;
  padding: 4rem 1.5rem 3rem;
  max-width: 960px;
}

@media (min-width: 768px) {
  .teacher-guide {
    padding-top: 5rem;
  }
}
</style>

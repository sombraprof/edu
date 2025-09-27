<template>
  <div>
    <h3>Os Blocos de Construção da Decisão: Operadores Lógicos</h3>
    <p class="text-body-large">
      Para que um computador possa tomar decisões, ele precisa de avaliar condições. Para isso,
      usamos os operadores lógicos, que são exatamente os mesmos que usamos no nosso raciocínio
      diário.
    </p>

    <!-- Operador AND -->
    <div>
      <h4
        class="text-headline-small font-bold text-on-surface"
        :style="{ marginBottom: 'var(--md-sys-spacing-4)' }"
      >
        Operador E (AND)
      </h4>
      <div class="grid md:grid-cols-2" :style="{ gap: 'var(--md-sys-spacing-8)' }">
        <div class="card shadow-elevation-2 p-6">
          <p :style="{ marginBottom: 'var(--md-sys-spacing-4)' }">
            O operador <strong>E</strong> (ou <code class="inline-code">AND</code>) é exigente. Ele
            só resulta em <strong>verdadeiro</strong> se <strong>TODAS</strong> as condições
            envolvidas forem verdadeiras.
          </p>
          <h5
            class="font-semibold text-body-large"
            :style="{
              marginTop: 'var(--md-sys-spacing-6)',
              marginBottom: 'var(--md-sys-spacing-2)',
            }"
          >
            Exemplo do Dia a Dia:
          </h5>
          <p class="italic">
            "Para a viagem acontecer, preciso que a
            <strong>previsão do tempo seja boa E eu tenha dinheiro</strong>."
          </p>
          <h5
            class="font-semibold text-body-large"
            :style="{
              marginTop: 'var(--md-sys-spacing-6)',
              marginBottom: 'var(--md-sys-spacing-2)',
            }"
          >
            Uso em Programação:
          </h5>
          <p class="italic">
            "Um utilizador só pode fazer login se o
            <strong>username estiver correto E a password estiver correta</strong>."
          </p>
        </div>
        <TruthTable
          class="self-stretch"
          title="Tabela-Verdade do E (AND)"
          description="O resultado só permanece verdadeiro quando todas as entradas são verdadeiras."
          caption="Combinações possíveis para o operador lógico AND."
          :legend="resultLegend"
          :headers="andHeaders"
          :rows="andRows"
          dense
        />
      </div>
    </div>

    <!-- Operador OR -->
    <div class="mt-8">
      <h4
        class="text-headline-small font-bold text-on-surface"
        :style="{ marginBottom: 'var(--md-sys-spacing-4)' }"
      >
        Operador OU (OR)
      </h4>
      <div class="grid md:grid-cols-2" :style="{ gap: 'var(--md-sys-spacing-8)' }">
        <div class="card shadow-elevation-2" :style="{ padding: 'var(--md-sys-spacing-6)' }">
          <p :style="{ marginBottom: 'var(--md-sys-spacing-4)' }">
            O operador <strong>OU</strong> (ou <code class="inline-code">OR</code>) é flexível. Ele
            resulta em <strong>verdadeiro</strong> se <strong>PELO MENOS UMA</strong> das condições
            for verdadeira.
          </p>
          <h5
            class="font-semibold text-body-large"
            :style="{
              marginTop: 'var(--md-sys-spacing-6)',
              marginBottom: 'var(--md-sys-spacing-2)',
            }"
          >
            Exemplo do Dia a Dia:
          </h5>
          <p class="italic">
            "Para o almoço, posso comer no restaurante <strong>OU</strong> levar comida de casa."
          </p>
          <h5
            class="font-semibold text-body-large"
            :style="{
              marginTop: 'var(--md-sys-spacing-6)',
              marginBottom: 'var(--md-sys-spacing-2)',
            }"
          >
            Uso em Programação:
          </h5>
          <p class="italic">
            "O acesso é permitido se o utilizador for um
            <strong>administrador OU o dono do documento</strong>."
          </p>
        </div>
        <TruthTable
          class="self-stretch"
          title="Tabela-Verdade do OU (OR)"
          description="Basta que uma das condições seja verdadeira para que o resultado seja verdadeiro."
          caption="Saídas do operador lógico OR para cada par de entradas."
          :legend="resultLegend"
          :headers="orHeaders"
          :rows="orRows"
          dense
        />
      </div>
    </div>

    <!-- Operador NOT -->
    <div :style="{ marginTop: 'var(--md-sys-spacing-8)' }">
      <h4
        class="text-headline-small font-bold text-on-surface"
        :style="{ marginBottom: 'var(--md-sys-spacing-4)' }"
      >
        Operador NÃO (NOT)
      </h4>
      <div class="grid md:grid-cols-2" :style="{ gap: 'var(--md-sys-spacing-8)' }">
        <div class="card shadow-elevation-2" :style="{ padding: 'var(--md-sys-spacing-6)' }">
          <p :style="{ marginBottom: 'var(--md-sys-spacing-4)' }">
            O operador <strong>NÃO</strong> (ou <code class="inline-code">NOT</code>) simplesmente
            <strong>inverte</strong> o valor de uma condição. O que é verdadeiro torna-se falso, e
            vice-versa.
          </p>
          <h5
            class="font-semibold text-body-large"
            :style="{
              marginTop: 'var(--md-sys-spacing-6)',
              marginBottom: 'var(--md-sys-spacing-2)',
            }"
          >
            Exemplo do Dia a Dia:
          </h5>
          <p class="italic">"Eu vou sair se <strong>NÃO</strong> estiver a chover."</p>
          <h5
            class="font-semibold text-body-large"
            :style="{
              marginTop: 'var(--md-sys-spacing-6)',
              marginBottom: 'var(--md-sys-spacing-2)',
            }"
          >
            Uso em Programação:
          </h5>
          <p class="italic">
            "Executar a ação enquanto o ficheiro <strong>NÃO</strong> chegar ao fim." (<code
              class="inline-code"
              >while NOT end_of_file</code
            >)
          </p>
        </div>
        <TruthTable
          class="self-stretch"
          title="Tabela-Verdade do NÃO (NOT)"
          description="O operador inverte o valor lógico recebido."
          caption="Resultados do operador NOT para cada valor de entrada."
          :legend="resultLegend"
          :headers="notHeaders"
          :rows="notRows"
          dense
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TruthTable, {
  type TruthTableLegendItem,
  type TruthTableRow,
  type TruthTableHeader,
} from './TruthTable.vue';

const resultLegend: TruthTableLegendItem[] = [
  {
    label: 'Verdadeiro',
    state: 'true',
    description: 'Saída igual a 1 (verdadeiro).',
  },
  {
    label: 'Falso',
    state: 'false',
    description: 'Saída igual a 0 (falso).',
  },
];

const andHeaders: TruthTableHeader[] = ['Condição A', 'Condição B', 'Resultado (A e B)'];
const orHeaders: TruthTableHeader[] = ['Condição A', 'Condição B', 'Resultado (A ou B)'];
const notHeaders: TruthTableHeader[] = ['Condição A', 'Resultado (não A)'];

const andRows: TruthTableRow[] = [
  [{ value: 'Verdadeiro' }, { value: 'Verdadeiro' }, { state: 'true', display: 'Verdadeiro' }],
  [{ value: 'Verdadeiro' }, { value: 'Falso' }, { state: 'false', display: 'Falso' }],
  [{ value: 'Falso' }, { value: 'Verdadeiro' }, { state: 'false', display: 'Falso' }],
  [{ value: 'Falso' }, { value: 'Falso' }, { state: 'false', display: 'Falso' }],
];

const orRows: TruthTableRow[] = [
  [{ value: 'Verdadeiro' }, { value: 'Verdadeiro' }, { state: 'true', display: 'Verdadeiro' }],
  [{ value: 'Verdadeiro' }, { value: 'Falso' }, { state: 'true', display: 'Verdadeiro' }],
  [{ value: 'Falso' }, { value: 'Verdadeiro' }, { state: 'true', display: 'Verdadeiro' }],
  [{ value: 'Falso' }, { value: 'Falso' }, { state: 'false', display: 'Falso' }],
];

const notRows: TruthTableRow[] = [
  [{ value: 'Verdadeiro' }, { state: 'false', display: 'Falso' }],
  [{ value: 'Falso' }, { state: 'true', display: 'Verdadeiro' }],
];
</script>

<style scoped>
.inline-code {
  background-color: var(--md-sys-color-surface-variant);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
}
</style>

# Controllers de páginas e fluxos

Os controllers encapsulam a lógica de estado, carregamento de dados e orquestração de fluxos de cada página sem acoplar essas responsabilidades à camada de apresentação. Eles são implementados como composables Vue (`useXController`) e ficam próximos à página correspondente (`src/pages/<feature>/controllers/`). Essa abordagem permite reaproveitar comportamentos em diferentes componentes, facilitar a injeção de dependências em testes e reduzir o acoplamento entre a camada visual e integrações externas.

## Estrutura recomendada

1. **Interface explícita:** exporte um `type` ou `interface` descrevendo o estado (refs/computed) e ações que o controller expõe. Isso documenta o contrato esperado pela página e por eventuais componentes filhos.
2. **Factory única:** exporte apenas uma função `use<Nome>Controller` que instancia o estado e retorna a interface documentada. Dentro dela, centralize watchers, computeds e side effects.
3. **Injeção de dependências:** aceite um parâmetro `options` com overrides para APIs externas (fetchers, automações, loaders). Forneça defaults prontos para produção, mas permita substituição em testes.
4. **Manifests isolados:** para conteúdos versionados (lições, exercícios, suplementos), exponha loaders via `import.meta.glob` e permita substituição via `options` para facilitar fixtures.
5. **Testabilidade:** encapsule efeitos reativos em `effectScope` ou exponha métodos como `refresh()`/`load()` que possam ser aguardados nos testes.

```ts
// Exemplo resumido inspirado no CourseHome
const defaultLessonModules = import.meta.glob('../content/courses/*/lessons.json');

export interface CourseHomeController {
  lessons: Ref<LessonRef[]>;
  displayItems: ComputedRef<CourseHomeItem[]>;
  refreshCourseContent: (courseId: string) => Promise<void>;
}

type CourseHomeOptions = {
  lessonModules?: Record<string, () => Promise<unknown>>;
};

export function useCourseHomeController(options: CourseHomeOptions = {}): CourseHomeController {
  const lessonModules = options.lessonModules ?? defaultLessonModules;
  // ... estado, computeds e ações
  return {
    lessons,
    displayItems,
    refreshCourseContent,
  };
}
```

## Como criar um novo controller

1. **Identifique a página ou fluxo** que precisa de orquestração de dados (dashboard, wizard, relatórios, etc.).
2. **Crie o diretório `controllers/`** ao lado da página, caso ainda não exista.
3. **Defina a interface pública** (refs e métodos) antes de implementar a lógica interna.
4. **Implemente dependências padrão** (ex.: loaders via `import.meta.glob`, funções de fetch, adapters HTTP).
5. **Exponha overrides em `options`** para permitir mocks nos testes.
6. **Escreva testes de unidade** que cobrem os caminhos principais, com fixtures injetadas via `options`.
7. **Conecte o controller à página** via `<script setup>` importando `useXController()`.

## Injetando manifests e outras dependências

Controllers que consomem manifests (JSON) usam `import.meta.glob` para mapear arquivos para funções de import dinâmico. Ao expor esse mapa em `options`, conseguimos substituir apenas os manifests relevantes durante testes.

```ts
const defaultExerciseModules = import.meta.glob('../content/courses/*/exercises.json');

export function useCourseHomeController(options: CourseHomeOptions = {}) {
  const exerciseModules = options.exerciseModules ?? defaultExerciseModules;

  async function loadExercises(courseId: string) {
    const path = `../content/courses/${courseId}/exercises.json`;
    const importer = exerciseModules[path];
    if (!importer) throw new Error(`Exercises manifest not found for ${path}`);
    const module = await importer();
    const { entries } = normalizeManifest(module, { context: `CourseHome:exercises:${courseId}` });
    exercises.value = entries;
  }
  // ...
}
```

### Fixture mínima para testes

```ts
const lessonModules = {
  '../content/courses/demo/lessons.json': async () => ({
    default: {
      entries: [{ id: 'lesson-01', title: 'Introdução', available: true }],
    },
  }),
};
```

Ao passar essa fixture para `useCourseHomeController({ lessonModules })`, os métodos de carregamento usarão o manifest falso, permitindo testar filtragens e transformações sem acessar o filesystem real.

## Exemplo em componente Vue

```vue
<script setup lang="ts">
import { useCourseHomeController } from './CourseHome.logic';

const controller = useCourseHomeController();
const { displayItems, isLoading, updateSection } = controller;
</script>

<template>
  <section :aria-busy="isLoading.value">
    <button type="button" @click="updateSection('lesson')">Aulas</button>
    <article v-for="item in displayItems" :key="item.key">
      <h3>{{ item.title }}</h3>
    </article>
  </section>
</template>
```

_Boa prática:_ sempre exponha `controller` explicitamente (em vez de desestruturar direto) para facilitar testes de unidade ou migrações futuras que precisem acessar o contrato completo.

## Exemplo de teste com Vitest

```ts
import { describe, expect, it } from 'vitest';
import { effectScope } from 'vue';
import { useCourseHomeController } from '../CourseHome.logic';

describe('CourseHome controller', () => {
  it('carrega manifestos injetados', async () => {
    const lessonModules = {
      '../content/courses/demo/lessons.json': async () => ({
        default: {
          entries: [{ id: 'lesson-01', title: 'Introdução', available: true }],
        },
      }),
    };

    const scope = effectScope();
    let controller;

    scope.run(() => {
      controller = useCourseHomeController({ lessonModules });
    });

    await controller.refreshCourseContent('demo');

    expect(controller.lessons.value).toHaveLength(1);
    expect(controller.displayItems.value[0].title).toBe('Introdução');

    scope.stop();
  });
});
```

O uso de `effectScope()` garante que as reações criadas pelo controller sejam descartadas ao final do teste, evitando vazamentos. Sempre que o controller oferecer métodos assíncronos (`load`, `refresh`), aguarde-os com `await` para garantir que os asserts enxerguem o estado estabilizado.

## Checklist rápido antes do PR

- [ ] Interface pública tipada e documentada.
- [ ] Dependências externas encapsuladas e com overrides via `options`.
- [ ] Testes de unidade cobrindo casos felizes e falhas.
- [ ] Página ou componente consome apenas a interface exposta.
- [ ] Manifestos/fixtures utilizados nos testes vivem próximo ao teste ou em `fixtures/` dedicadas.

Essa convenção mantém controllers previsíveis, facilita colaboração entre squads e reduz o custo de manutenção ao longo da evolução da plataforma.

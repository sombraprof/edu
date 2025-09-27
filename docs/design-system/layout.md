# Layouts de Navegação e App Bars MD3

Os layouts principais foram atualizados com variantes e componentes alinhados ao Material Design 3 para suportar a migração dos blocos didáticos.

## Md3TopAppBar

- **Propriedades**: `variant` (`small`, `center-aligned`, `medium`, `large`), `density` (`default`, `comfortable`, `compact`), `sticky` e `observeScroll`.
- **Comportamento**: aplica elevação automática quando `observeScroll` está ativo e `scrollY > 4`. O dataset `data-theme` controla tokens dinâmicos.
- **Slots de suporte**: `supporting`, `breadcrumbs` e `search` habilitam a linha contextual exigida pelo MD3 para breadcrumbs, campos de busca e filtros auxiliares.
- **Uso recomendado**:
  - `small`/`center-aligned` para cabeçalhos principais e navegação global.
  - `medium` para páginas de disciplina com contexto adicional.
  - `large` para unidades de curso e hero blocks.
- **Acessibilidade**: slots `leading`, `default` e `actions` preservam ordem semântica e os IDs são gerados quando o título visual existe.

## Md3NavigationRail

- **Props**: `items`, `activeId`, `density`, `variant` (`expanded` ou `collapsed`).
- **Slots**: `header` e `footer` para ações secundárias (ex.: filtros ou atalhos rápidos).
- **Interação**: emite `update:activeId` e `select`; itens desabilitados ignoram cliques.
- **Colapso**: a variante `collapsed` oculta rótulos e badges mantendo apenas ícones, útil em telas menores ou dashboards.

## Md3NavigationDrawer

- **Props**: `items`, `activeId`, `density`, `variant` (`standard` ou `modal`).
- **Corpo do item**: suporta rótulo, descrição e badge opcional para destacar pendências.
- **Modal**: aplica sombra elevada (`--md-sys-elevation-level3`) e remove a borda para uso sobreposto.

## Md3BottomAppBar

- **Props**: `actions`, `activeId` e `ariaLabel`.
- **Comportamento**: exibe até cinco ações principais com ícone + rótulo, emitindo `select` e `update:activeId` para sincronizar com o estado global.
- **Uso**: exibido automaticamente no `Md3AppShell` em telas menores para garantir paridade de navegação com o rail/drawer.

## Md3AppShell

- **Composição**: orquestra `Md3TopAppBar`, `Md3NavigationRail`, `Md3NavigationDrawer` (modal em telas pequenas) e `Md3BottomAppBar`, além de slots `main`/`secondary` com grids responsivos.
- **Slots adicionais**: `brand`, `actions`, `top-supporting`, `drawer-header/footer`, `rail-header/footer` e `secondary` para conteúdos contextuais do painel docente.
- **Acessibilidade**: encerra o drawer modal com scrim, propaga labels ARIA e mantém o `aria-current` sincronizado entre rail, drawer e bottom bar.
- **Integração**: já alimenta o layout de cursos (`CourseLayout.vue`) com breadcrumbs, busca contextual e contagens dinâmicas de aulas/exercícios.

## Storybook

As histórias cobrem toda a família de layout no Storybook: top app bar, rail, drawer, breadcrumbs, campo de busca, bottom app bar e o `Md3AppShell` responsivo. Os arquivos em `src/components/layout/*.stories.ts` simulam a navegação docente com roteador em memória, permitindo validar densidades, badges, estados ativos e o hand-off entre rail/drawer e a barra inferior antes de levar os layouts para produção. 【F:src/components/layout/Md3AppShell.stories.ts†L1-L200】【F:src/components/layout/Md3BottomAppBar.stories.ts†L1-L83】【F:src/components/layout/Md3Breadcrumbs.stories.ts†L1-L74】【F:src/components/layout/Md3SearchField.stories.ts†L1-L61】

## Próximos passos

1. Mapear cenários mobile/desktop no Storybook usando o addon de viewport para registrar transições de drawer/rail/bottom bar.
2. Conectar o rail/drawer aos dados reais do painel docente (metas, jornadas, exercícios em revisão) para validar copy e badges.
3. Adicionar testes visuais (Chromatic/Playwright) após estabilizar as histórias de layout e dos novos breadcrumbs/busca.

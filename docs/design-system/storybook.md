# Storybook do portal docente

Foi configurado o Storybook 8 para Vue 3 com Vite, permitindo documentar e validar visualmente o design system.

## Scripts

- `npm run storybook` – inicia o ambiente local em `http://localhost:6006`.
- `npm run build-storybook` – gera a versão estática em `storybook-static/` para publicação.

## Addons habilitados

- **Essentials** (`controls`, `docs`, `actions`, `backgrounds`, `viewport`).
- **A11y** – verifica automaticamente contrastes e landmarks.
- **Interactions** – suporte a testes baseados em `@storybook/test`.
- **Links** – conecta histórias relacionadas.

## Integração com o tema

O `preview.ts` inicializa o `initMaterialTheme` e expõe o seletor de tema (claro, escuro, sistema) via toolbar. Cada mudança aciona `setMaterialTheme`, mantendo o Storybook alinhado à aplicação real.

## Estrutura de histórias

- `src/components/layout/Md3TopAppBar.stories.ts` – demonstra variantes da barra superior.
- `src/components/layout/Md3NavigationRail.stories.ts` – navegação lateral com modo colapsado e badges.
- `src/components/layout/Md3NavigationDrawer.stories.ts` – gaveta padrão/modal com descrições e contadores.
- `src/components/layout/Md3BottomAppBar.stories.ts` – barra inferior móvel com seleção interativa e estados desabilitados.
- `src/components/layout/Md3Breadcrumbs.stories.ts` – breadcrumbs com ícones, links externos e feedback de seleção.
- `src/components/layout/Md3SearchField.stories.ts` – campo de busca com rótulo opcional, limpeza e envio.
- `src/components/layout/Md3AppShell.stories.ts` – shell responsivo orquestrando rail, drawer, breadcrumbs, busca e barra inferior.

## Próximos passos

1. Adicionar histórias para os componentes didáticos (Flowchart, TruthTable, BlockDiagram) com estados de carga real e presets disciplinares.
2. Publicar builds do Storybook na mesma esteira do `preview` (GitHub Pages/Cloudflare Pages) para aprovação docente.
3. Incluir testes de acessibilidade automatizados (`storybook test --watch`) e capturas visuais por viewport no pipeline CI.

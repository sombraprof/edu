# Tokens do Design System Material 3

Os tokens do tema Material You foram centralizados em `src/theme/tokens.ts` para garantir que aplicações, Storybook e scripts compartilhem a mesma fonte de verdade. A inicialização do tema (`initMaterialTheme`) injeta os tokens dinamicamente na raiz do documento e mantém aliases legados (`--shadow-elevation-*`) durante a transição.

## Estrutura dos tokens

- **Cores** – `COLOR_ROLE_TOKENS` cobre todos os papéis gerados pelo Material Color Utilities (primários, superfícies container, tons inversos, outline etc.).
- **Camadas de estado** – `STATE_LAYER_OPACITY` e `STRONG_STATE_LAYER_OPACITY` controlam as opacidades para hover/focus de acordo com o modo claro/escuro.
- **Elevação** – `ELEVATION_SHADOWS` gera `--md-sys-elevation-level{1..3}` e mantém compatibilidade com `--shadow-elevation-*`.
- **Tipografia** – `TYPOGRAPHY_SCALE` define tamanhos, pesos e tracking para display/headline/title/body/label, aplicados como variáveis CSS.
- **Espaçamento e dimensões** – `SPACING_SCALE` e `DIMENSION_SCALE` criam variáveis `--md-sys-spacing-*` e `--md-sys-icon-size-*` alinhadas às diretrizes MD3.
- **Layout responsivo** – `BREAKPOINTS`, `LAYOUT_CONTAINERS` e `APP_BAR_HEIGHTS` publicam `--md-sys-breakpoint-*`, `--md-sys-layout-container-*` e `--md-sys-app-bar-height-*`, sincronizando grids, app bars e shells responsivos.
- **Curvas** – `SHAPE_SCALE` publica `--md-sys-shape-*` e `--md-sys-shape-corner-*`, permitindo migrações graduais dos componentes antigos.

## Convenções de uso

1. **Sempre consumir variáveis CSS** em componentes Vue ou Tailwind (`var(--md-sys-spacing-4)`, `var(--md-sys-typescale-headline-small-size)`).
2. **Evitar valores mágicos**; quando um novo token for necessário, adicione-o ao arquivo `tokens.ts` para manter rastreabilidade.
3. **Aplicar tokens via JS apenas uma vez** – `applyStaticTokens` roda durante a inicialização do tema e não precisa ser reexecutado.
4. **Suporte a modo automático** – `setMaterialTheme('system' | 'light' | 'dark')` mantém a sincronização com o Storybook e com o app.

## Próximos passos

- Expandir o mapa para tokens de motion (easing/duração) e densidade adaptativa.
- Remover gradualmente os aliases `--shadow-elevation-*` quando os componentes estiverem migrados para `--md-sys-elevation-level*`.
- Publicar tokens JSON exportáveis para automações externas (Figma, documentação pública).

# Tokens do Design System Material 3

Os tokens do tema Material You foram centralizados em `src/theme/tokens.ts` para garantir que aplicações, Storybook e scripts compartilhem a mesma fonte de verdade. A inicialização do tema (`initMaterialTheme`) injeta os tokens dinamicamente na raiz do documento e agora publica apenas variáveis MD3 (`--md-sys-*`), eliminando os aliases legados de elevação.

## Estrutura dos tokens

- **Cores** – `COLOR_ROLE_TOKENS` cobre todos os papéis gerados pelo Material Color Utilities (primários, superfícies container, tons inversos, outline etc.).
- **Camadas de estado** – `STATE_LAYER_OPACITY` e `STRONG_STATE_LAYER_OPACITY` controlam as opacidades para hover/focus de acordo com o modo claro/escuro.
- **Elevação** – `ELEVATION_SHADOWS` gera `--md-sys-elevation-level{0..5}` para luz e sombra, cobrindo cards planos e componentes flutuantes sem depender de aliases.
- **Motion** – `MOTION_TOKENS` publica durações e curvas canônicas (`--md-sys-motion-duration-*`, `--md-sys-motion-easing-*`) alinhadas às animações do Material 3.
- **Densidade** – `DENSITY_SCALE` documenta os ajustes em dp para barras, navegação e escala de referência (`--md-sys-density-*`).
- **Tipografia** – `TYPOGRAPHY_SCALE` define tamanhos, pesos e tracking para display/headline/title/body/label, aplicados como variáveis CSS.
- **Espaçamento e dimensões** – `SPACING_SCALE` e `DIMENSION_SCALE` criam variáveis `--md-sys-spacing-*` e `--md-sys-icon-size-*` alinhadas às diretrizes MD3.
- **Layout responsivo** – `BREAKPOINTS`, `LAYOUT_CONTAINERS` e `APP_BAR_HEIGHTS` publicam `--md-sys-breakpoint-*`, `--md-sys-layout-container-*` e `--md-sys-app-bar-height-*`, sincronizando grids, app bars e shells responsivos.
- **Curvas** – `SHAPE_SCALE` publica `--md-sys-shape-*` e `--md-sys-shape-corner-*`, permitindo migrações graduais dos componentes antigos e habilitando utilitárias como `.md-shape-large`/`.md-shape-extra-large` e variantes de card (`card--compact`).

## Convenções de uso

1. **Sempre consumir variáveis CSS** em componentes Vue ou Tailwind (`var(--md-sys-spacing-4)`, `var(--md-sys-typescale-headline-small-size)`).
2. **Evitar valores mágicos**; quando um novo token for necessário, adicione-o ao arquivo `tokens.ts` para manter rastreabilidade.
3. **Aplicar tokens via JS apenas uma vez** – `applyStaticTokens` roda durante a inicialização do tema e não precisa ser reexecutado.
4. **Suporte a modo automático** – `setMaterialTheme('system' | 'light' | 'dark')` mantém a sincronização com o Storybook e com o app.
5. **Curvaturas consistentes** – superfícies principais usam `card` (raio extra-large por padrão) e widgets compactos usam `card card--compact`; tons personalizados podem aplicar `.md-shape-*` para aproveitar `--md-sys-shape-corner-*` sem estilos inline.
6. **Exportar para Figma/automação** – rode `npm run tokens:export` para gerar `reports/design-tokens.json` com o snapshot mais recente.

## Próximos passos

- Expor presets de animação no Storybook usando `MOTION_TOKENS` como fonte de verdade.
- Auditar componentes para aproveitar `DENSITY_SCALE` em controles responsivos (rail, drawer, barras).
- Conectar o build de tokens JSON ao pipeline de design para sincronizar Figma e automações externas.

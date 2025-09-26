# Status das Atividades de Melhoria

## O que já foi entregue

1. **Revisão de arquitetura e manutenção** (`docs/ARCHITECTURE_REVIEW.md`)
   - Diagnóstico da estrutura atual (Vue 3 + Vite) e mapeamento dos principais pontos fortes e fragilidades.
   - Plano de ação para testes, validação de conteúdo e redução de boilerplate.
   - Roadmap priorizado com foco em automação de lições, aderência ao Material Design 3 (MD3) e governança de conteúdo.
2. **Playbook de prompts para LLMs** (`docs/LLM_PROMPT_PLAYBOOK.md`)
   - Conjunto de prompts reutilizáveis para criação, migração e revisão de aulas.
   - Checklist para garantir que a geração automatizada mantenha o padrão esperado (IDs, blocos válidos, bibliografia, etc.).
   - Diretrizes específicas para ajustes visuais alinhados ao MD3.
3. **Automação inicial de conteúdo**
   - CLI `npm run scaffold:lesson` para criar JSON, wrapper Vue e atualizar `lessons.json` em um único passo.
   - Validador `npm run validate:content` baseado em Ajv/TypeBox para garantir ids únicos e esquema mínimo antes do deploy.
4. **Padronização de lições publicadas**
   - IDs, arquivos JSON/Vue e índices `lessons.json` migrados para o padrão `lesson-XX` (zero-padding) em todos os cursos.
   - `validate:content` reforça correspondência entre id, nome do arquivo e esquema, evitando divergências futuras.
5. **Validação automática no fluxo de commits**
   - O pre-commit configurado com `simple-git-hooks` agora executa `npm run validate:content` sempre que arquivos de `src/content/` são modificados.
   - Previne que lições inconsistentes (ids diferentes do arquivo, blocos sem `type`, bibliografias vazias) cheguem ao repositório remoto.

6. **Renderer modular e validação reforçada de blocos**
   - `LessonRenderer` passou a usar um registry centralizado para mapear cada `block.type` ao componente Vue correspondente, eliminando o encadeamento de `v-if` e facilitando lazy-loading futuro.
   - O mesmo catálogo sustenta `validate:content`, que agora bloqueia blocos desconhecidos ou componentes customizados não registrados, reduzindo erros em contribuições humanas ou geradas por LLM.
7. **Campos obrigatórios por tipo de bloco**
   - `validate:content` agora verifica estrutura mínima para blocos MD3 críticos (`videos`, `callout`, `accordion`, `bibliography`, `truthTable`, etc.) e acusa quando faltam arrays, ids de vídeo ou bibliografias.
   - Os erros apontam o índice no `content[]`, o arquivo afetado e a dica em português, facilitando correção rápida por autores humanos ou assistidos por IA.

8. **Relatório agregado de validação**
   - `npm run validate:report` gera um JSON consolidando totais de lições avaliadas, quantidade de problemas/avisos e a lista de arquivos afetados por curso.
   - O relatório facilita a priorização de blocos legados ou inconsistências e pode ser redirecionado para outros caminhos com `--report <arquivo>`.

Esses materiais dão visibilidade sobre o estado atual do projeto e aceleram a colaboração humana ou assistida por IA ao documentar expectativas, fluxos e boas práticas.

## O que ainda pode ser feito

A partir das recomendações listadas na revisão de arquitetura, seguem frentes prioritárias:

1. **Automação e validação**
   - Integrar `npm run validate:content` ao pipeline de CI/CD, incluindo a publicação automática do relatório em cada execução.
   - Adotar lint customizado para garantir nomenclatura consistente nos campos livres.
2. **Refinamento do front-end**
   - Criar utilitários de estilo MD3 (tipografia, espaçamentos, elevações) para substituir estilos inline e classes ad hoc.
   - Montar Storybook ou Chromatic para validar visualmente componentes críticos.
   - Converter wrappers `.vue` redundantes para carregamento dinâmico baseado em JSON, reduzindo retrabalho.
3. **Fluxo de conteúdo e observabilidade**
   - Versionar manifestos de cursos e suplementos (exercícios, labs, leituras) para facilitar expansão do acervo.
   - Adicionar metadados de geração (`generatedBy`, `model`, `timestamp`) aos JSONs para auditar produções via LLM.
4. **Documentação viva**
   - Criar um diretório de ADRs (`docs/decisions/`) para registrar decisões técnicas.
   - Atualizar os guias periodicamente com aprendizados de novas migrações ou evoluções de design.

Seguir essas etapas transforma a revisão em plano operacional, permitindo que a equipe avance com segurança tanto em melhorias estruturais quanto na expansão contínua do conteúdo.

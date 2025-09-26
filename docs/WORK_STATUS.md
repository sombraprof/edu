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

9. **Validação contínua no CI/CD**
   - O workflow de deploy executa `npm run validate:report` em todas as execuções, anexa o relatório agregado como artefato e interrompe a publicação quando houver problemas.
   - Permite baixar rapidamente o diagnóstico via GitHub Actions, mantendo o histórico das execuções anteriores para auditoria.

10. **Lint de nomenclatura para blocos chave**

- `validate:content` agora acusa valores fora do padrão em `callout.variant` e ícones de `lessonPlan`, garantindo que apenas tokens documentados sejam aceitos.
- `Callout.vue` passou a reconhecer o variant `task` com visual alinhado ao MD3 e `LessonPlan.vue` interpreta diferentes variações de nomes de ícones sem quebrar retrocompatibilidade.
- Guias de autoria e prompts de LLM foram atualizados para reforçar os nomes canônicos aceitos pelos validadores.

11. **Validação de cardGrid e manifestos de exercícios**

- `validate:content` passou a verificar que cada card do `cardGrid` tem título, conteúdo renderizável, ações válidas e variantes canônicas (aceitando apenas tons MD3 ou os mesmos tokens de `callout`).
- Campos numéricos como `columns` agora precisam ser inteiros entre 1 e 4, evitando grids quebrados.
- Os manifestos `exercises.json` passam por validação de esquema, prefixo de link (`courses/<curso>/exercises/`) e correspondência entre `id` e nome do arquivo, garantindo que wrappers/JSON existam quando a atividade estiver marcada como disponível.

12. **Proveniência e manifestos complementares**

- `validate:content` exige `metadata.generatedBy`, `metadata.model` e `metadata.timestamp` em cada exercício e passou a validar `supplements.json` (tipos permitidos, links/arquivos e duplicidades).
- Índices de exercícios foram atualizados com metadados de geração e cada curso agora possui um manifesto inicial de suplementos para registrar materiais extras.
- Guias de autoria e prompts de LLM descrevem como preencher os metadados e como versionar esses materiais opcionais.

13. **Relatório com metadados de geração**

- `npm run validate:report` passou a consolidar, por curso, quem gerou cada exercício/suplemento, qual modelo foi usado e os timestamps registrados, mantendo totais por autor/modelo e intervalo temporal das entregas.
- O snapshot em `reports/content-validation-report.json` facilita auditorias rápidas sem abrir os manifestos individuais.

Esses materiais dão visibilidade sobre o estado atual do projeto e aceleram a colaboração humana ou assistida por IA ao documentar expectativas, fluxos e boas práticas.

14. **Metadados canônicos por curso**

- `npm run validate:content` agora bloqueia `meta.json` sem `id` alinhado ao diretório do curso, títulos curtos ou descrições abaixo de 60 caracteres.
- O campo `institution` precisa usar nomes padronizados (`Unichristus`, `Unifametro`), evitando variações que quebrariam filtros e badges na interface.

15. **Painel do relatório de validação**

- Página dedicada no site (`/relatorios/validacao-conteudo`) resume totais da última execução do validador e lista lições com problemas/avisos.
- O cabeçalho ganhou atalho permanente para o painel, permitindo acompanhar os apontamentos sem rodar scripts manualmente.

16. **Proveniência no painel de relatório**

- A seção "Proveniência dos materiais gerados" apresenta cobertura de metadados por curso, autores mais frequentes e modelos usados em exercícios e suplementos.
- Ajuda a priorizar lacunas de rastreabilidade antes de liberar novos materiais e dá visibilidade a contribuições humanas ou assistidas por IA.

17. **Biblioteca MD3 avançada**

- Centralizamos os tokens de tipografia, superfícies, elevações e contrastes (`.md-typescale-*`, `.md-surface*`, `.md-elevation-*`, `.text-on-*`, `.md-icon--*`) em `src/assets/styles.css`.
- Atualizamos componentes-chave (painel de validação, cards de curso e blocos de lição) para consumir os novos utilitários e eliminar estilos inline divergentes.

18. **Observabilidade automatizada do conteúdo**

- `npm run report:observability` gera `reports/content-observability.json` com métricas por curso (lições publicadas, blocos MD3 vs. legados e cobertura de metadados em exercícios/suplementos).
- O relatório destaca as lições e exercícios que ainda usam blocos legados, facilitando priorizar migrações no roadmap de MD3.
- README e documentação de fluxo foram atualizados para divulgar o comando e incentivar a revisão contínua dos indicadores.

19. **Observabilidade integrada ao CI/CD**

- O workflow de deploy agora roda `npm run report:observability:check` após a validação, publica `reports/content-observability.json` como artefato e falha quando há exercícios ou suplementos sem metadados obrigatórios.
- Mantém os snapshots de validação e observabilidade disponíveis para download direto no GitHub Actions, reforçando a rastreabilidade das métricas a cada execução.

## O que ainda pode ser feito

A partir das recomendações listadas na revisão de arquitetura, seguem frentes prioritárias:

1. **Automação e validação**
   - Disparar notificações ou abrir issues automaticamente quando a pipeline falhar, destacando o curso afetado e o tipo de problema (validação vs. metadados).
   - Estender os relatórios para cruzar métricas de observabilidade com progresso de migrações MD3 (ex.: evolução semanal de blocos legados).
2. **Refinamento do front-end**
   - Montar Storybook ou Chromatic para validar visualmente componentes críticos e garantir regressão visual sobre os novos utilitários.
   - Converter wrappers `.vue` redundantes para carregamento dinâmico baseado em JSON, reduzindo retrabalho.
3. **Fluxo de conteúdo**
   - Versionar manifestos de cursos e suplementos (exercícios, labs, leituras) para facilitar expansão do acervo.
   - Criar rotinas de revisão trimestrais usando o relatório de observabilidade para checar pendências de migração.
4. **Documentação viva**
   - Criar um diretório de ADRs (`docs/decisions/`) para registrar decisões técnicas.
   - Atualizar os guias periodicamente com aprendizados de novas migrações ou evoluções de design.

Seguir essas etapas transforma a revisão em plano operacional, permitindo que a equipe avance com segurança tanto em melhorias estruturais quanto na expansão contínua do conteúdo.

## Visão geral (tabela)

| Frente prioritária                            | Status       | Observações                                                                                                                        |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Validação de `meta.json`                      | ✅ Concluída | Guardrails adicionados em `validate:content` garantem slug, instituição canônica e descrição robusta.                              |
| Painel para relatório consolidado             | ✅ Concluída | Página dedicada publica o JSON agregado com totais, status por curso e detalhes das lições afetadas.                               |
| Biblioteca MD3 avançada (tipografia/elevação) | ✅ Concluída | Tipos de letra, superfícies, elevações e helpers de contraste consolidados em `src/assets/styles.css` e adotados no painel/blocks. |
| Observabilidade de conteúdo                   | ✅ Concluída | `npm run report:observability` gera métricas sobre blocos MD3 x legados, lições disponíveis e cobertura de metadados.              |
| Observabilidade automatizada no CI            | ✅ Concluída | Workflow gera o relatório, publica artefato dedicado e falha quando faltam metadados obrigatórios em exercícios/suplementos.       |
| Proveniência exibida no painel                | ✅ Concluída | Painel traz cobertura de metadados, autores recorrentes e modelos utilizados por curso.                                            |

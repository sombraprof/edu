# Plano de implementação do módulo administrativo "Professor"

Documento vivo descrevendo o estado atual do módulo `/professor` e como operá-lo após a simplificação do serviço auxiliar. A superfícia atual foca exclusivamente em leitura e gravação de JSON diretamente no repositório por meio do editor inline.

## Resumo executivo

- ✅ Roteamento dedicado `/professor` com proteção via modo professor.
- ✅ Editor visual em `/professor/editor` com carregamento e salvamento automático dos arquivos JSON de conteúdo.
- ✅ Serviço auxiliar local `npm run teacher:service` reduzido a `GET/PUT /api/teacher/content` + `GET /health`, responsável apenas por servir o editor inline.
- ✅ Documentação atualizada para orientar a operação manual (validações, Git e PRs ocorrem via CLI convencional).
- 🚧 Revisão de fluxos de validação/governança considerando a retirada dos painéis automáticos.

> **Importante:** Workbenches de ingestão, painéis de validação, automações Git e abertura de PRs foram descontinuados. Preserve este documento por perto para não comunicar funcionalidades que não existem mais.

## Superfície disponível

### Editor inline (`/professor/editor`)

- Carrega arquivos de `src/content` usando `GET /api/teacher/content?path=...`.
- Salva alterações por meio de `PUT /api/teacher/content` com autosave (conteúdo formatado com `JSON.stringify(..., 2)`).
- Mostra feedback de sucesso/erro baseado nas respostas JSON do serviço auxiliar.
- Permanece bloqueado quando `VITE_TEACHER_API_URL` não está configurada ou o serviço está offline.
- Workspace desktop dividido em grid 30/70: a barra lateral mantém largura mínima de 20rem e pode ocupar até 30% da tela, deixando 70% para o canvas de edição.

> **Formulários dedicados:** o painel carrega automaticamente editores visuais para `checklist`, `timeline`, `stepper`, `glossary`, `flashcards`, `videos`/`videosBlock`, `bibliography`/`bibliographyBlock`, `interactiveDemo`, `codeSubmission`, `promptTip`, `flightPlan`, `accordion`, `representations`, `parsons` e `parsonsPuzzle`. Os campos seguem os `defaultBlockTemplates` e qualquer alteração dispara `update:block` para o serviço de autosave.

> **Fallback JSON:** blocos avançados (`scenarioMatrix`, `spriteSheet`, `crcCards`, `apiEndpoints`, `definitionCard`, `comparativeTable`, `systemDiagram`, `codeChallenge`, `memoryVisualizer`, `caseStudy`, `statCard`, `dualAssessment`, `pedagogicalNote`, `dragAndDrop`, `conceptMapper`, `bugFixChallenge`, `dataEntryForm`, `scenarioBuilder`, `peerReviewTask`, `testGenerator`, `rubricDisplay`, `selfAssessment`, `truthTable`, `blockDiagram`, `md3Flowchart`, `classDesigner`, `audio`, `md3Table`, `pipelineCanvas`, `systemMapper`, `balancedScorecard`, `component`, `legacySection`) permanecem no editor genérico. Clique em **Editar JSON** para ajustá-los mantendo o formato original.

### Serviço auxiliar simplificado (`npm run teacher:service`)

- Implementado em `scripts/teacher-automation-server.mjs`.
- Endpoints expostos:
  - `GET /health` → diagnóstico rápido.
  - `GET /api/teacher/content` → leitura de JSON (requer `path` relativo a `src/content`).
  - `PUT /api/teacher/content` → gravação de JSON existente (ecoando `path`, `content` e `savedAt`).
- Autenticação opcional via `TEACHER_SERVICE_TOKEN` / header `X-Teacher-Token`.
- Não possui fila de scripts, histórico, integrações Git ou criação de PRs.

## Operação recomendada

1. **Preparar ambiente:**
   - `npm install`
   - Configurar `.env.local` (ou variável de ambiente) com `VITE_TEACHER_API_URL=http://127.0.0.1:4178` e, se desejar, `VITE_TEACHER_API_TOKEN`.
2. **Iniciar serviços locais:**
   - `npm run teacher:service`
   - Em outro terminal, `npm run dev:teacher` para abrir a SPA com o modo professor habilitado.
3. **Editar conteúdo:**
   - Acesse `/professor/editor`.
   - Escolha o arquivo desejado e faça ajustes; o autosave chamará `PUT /api/teacher/content`.
4. **Validar e publicar manualmente:**
   - Execute os scripts CLI (`npm run validate:content`, `npm run report:observability`, etc.) conforme o checklist de governança.
   - Utilize Git manualmente (`git status`, `git add`, `git commit`, `git push`) e abra PRs diretamente pela linha de comando ou GitHub.

## Governança e próximos passos

- Atualizar fluxos operacionais para garantir que revisores saibam executar validações e publicar conteúdo manualmente.
- Revisitar métricas de observabilidade/governança para apontar fontes alternativas de visibilidade (ex.: dashboards fora da SPA).
- Avaliar oportunidades futuras para reintroduzir automações específicas (por exemplo, relatórios agendados) sem expandir o serviço além da leitura/gravação de JSON.
- Manter sincronizado com o [Playbook de Prompts para LLM](../LLM_PROMPT_PLAYBOOK.md), que agora orienta explicitamente o uso do editor inline e do serviço simplificado.

---

> **Status:** documento vivo. Atualize ao ajustar o escopo do módulo ou ao reintroduzir funcionalidades adicionais.

# Plano de implementação do módulo administrativo "Professor"

Este documento acompanha a implementação incremental da nova área administrativa voltada a professores e revisores. Ele se apoia nos guias e scripts já existentes no repositório e detalha entregáveis por iteração, artefatos esperados e insumos necessários.

## Resumo executivo

- **O que já foi entregue**
  - ✅ Roteamento dedicado `/professor` com dashboard inicial protegido pelo modo professor.
  - ✅ _Workbench_ de ingestão em `/professor/ingestao` com validação AJV, upload/cola de JSON e checklist operacional.
  - ✅ Documentação viva acompanhando decisões, rotinas de governança e aprendizados da iteração 2.
  - ✅ Editor visual em `/professor/editor` com edição de metadados e blocos (`lessonPlan`, `callout`, `cardGrid`, `contentBlock`).
  - ✅ Validação automática no editor reaproveitando o `lesson.schema.json` para alertar violações do schema durante a edição.
  - ✅ Painel `/professor/validacao` com registro de execuções, notas da rodada e importação de relatórios oficiais.
- ✅ Pacote de publicação em `/professor/publicacao` para planejar branches, commits, validações e gerar resumo de PR.
- ✅ Botão "Buscar atualizações da main" sincroniza o workspace via backend antes da rodada de commits.
- ✅ Botão "Criar branch automaticamente" prepara a branch de trabalho a partir da `main` diretamente na SPA.
- ✅ Automação de `git add` e `git commit` a partir dos caminhos cadastrados no painel de publicação.
- ✅ Envio automático de `git push` com configuração de upstream direto do painel de publicação.
- ✅ Serviço auxiliar `npm run teacher:service` expõe API local para executar scripts oficiais e sincronizar relatórios com o painel.
  - ✅ Histórico de execuções remotas disponível diretamente no painel de validação ao integrar com o `teacher:service`.
  - ✅ Autenticação por token no serviço auxiliar para permitir exposição controlada além do ambiente local.

- **Próximos passos imediatos**
- 🧩 Automatizar abertura de PRs diretamente pelo painel de publicação.
  - 🗃️ Definir estratégia de permissões e governança para expor a API em ambientes compartilhados.
  - 🔐 Definir política de rotação/armazenamento seguro do token do serviço auxiliar.

## Atualização em curso — Iteração 2 (Ingestão de JSON)

- ✅ Criada a rota `/professor/ingestao` com o _workbench_ de ingestão protegido pelo `TeacherModeGate`.
- ✅ Validação client-side via AJV usando os schemas oficiais (`lesson`, manifestos de aulas/exercícios/suplementos).
- ✅ Checklist operacional para garantir `git checkout main && git pull --rebase` antes de cada rodada.
- ✅ Exportação em JSON formatado + cópia rápida para facilitar commits e revisão cruzada.
- 📓 Registro contínuo de aprendizados em [`iteration-02.md`](./iteration-02.md).

## Atualização em curso — Iteração 3 (Editor visual)

- ✅ Lançado o editor em `/professor/editor` com importação de arquivos e parsing com mensagens de erro amigáveis.
- ✅ Formulários dedicados para metadados e blocos principais (`lessonPlan`, `callout`, `cardGrid`, `contentBlock`).
- ✅ Exportação com cópia rápida e _download_ de arquivo para reaproveitar em commits ou na ingestão.
- 🚧 Ampliação da cobertura para blocos avançados e pré-visualização renderizada ainda em análise.
- 📓 Registro contínuo em [`iteration-03.md`](./iteration-03.md).

## Atualização em curso — Iteração 4 (Validações & relatórios)

- ✅ Adicionado o painel `/professor/validacao` com campos para anotações, saída dos scripts e registro de execuções.
- ✅ Importação de `content-validation-report.json`, `content-observability.json` e `governance-alert.json` com resumos automáticos.
- ✅ Serviço backend local (`npm run teacher:service`) permite disparar scripts oficiais e baixar relatórios sem sair da SPA.
- ✅ Histórico de execuções remotas consumido direto da API (`/api/teacher/scripts/history`).
- ✅ Editor visual sincroniza os alertas registrados e bloqueia exportações com falhas críticas.
- 🚧 Autenticação e fila de execução do backend auxiliar em planejamento.
- 📓 Registro contínuo em [`iteration-04.md`](./iteration-04.md).

## Atualização em curso — Iteração 5 (Integração com Git)

- ✅ Lançado o pacote `/professor/publicacao` com checklist de validações e geração de comandos para Git/PR.
- ✅ Sugestão automática de mensagem de commit e corpo do PR a partir dos conteúdos cadastrados.
- ✅ Integração com o serviço backend para sincronizar status dos scripts obrigatórios e download dos relatórios.
- ✅ Botão "Buscar atualizações da main" aciona `git fetch` via backend e atualiza divergências automaticamente.
- ✅ Checkout automático de branch a partir da `main` via backend para alinhar o workspace antes dos commits.
- ✅ Painel executa `git add` e `git commit` diretamente pela API, reaproveitando o checklist de conteúdos cadastrados.
- ✅ Painel envia a branch ativa com `git push`, configurando o upstream na primeira execução quando necessário.
- 🚧 Backend para abertura de PRs automatizados permanece no roadmap.
- 📓 Registro contínuo em [`iteration-05.md`](./iteration-05.md).

## 1. Mapeamento de requisitos e workflows

### Artefatos de referência

- [Guia de autoria de conteúdo](../CONTENT_AUTHORING_GUIDE.md)
- [Playbook de prompts para LLM](../LLM_PROMPT_PLAYBOOK.md)
- Scripts CLI em [`package.json`](../package.json) (`scaffold:lesson`, `validate:content`, `validate:reports`, etc.)
- Relatórios consolidados em [`reports/`](../../reports)

### Ações

1. Levantar campos obrigatórios, blocos suportados e metadados de proveniência exigidos pelos validadores.
2. Mapear papéis envolvidos (professor, revisor, coordenação) e decisões que exigem dupla checagem.
3. Identificar integrações externas (repositório Git, pipeline de validação) e permissões necessárias.

### Entregáveis

- Inventário de schemas/blocos com indicação de uso no portal atual.
- Matriz RACI preliminar para autoria, revisão e publicação.
- Checklist de validações obrigatórias antes do commit.

## 2. Arquitetura da solução

### Decisões iniciais

- A nova área residirá em `/professor` dentro da SPA Vue existente.
- O estado de “modo professor” continua controlado por `useTeacherMode`, garantindo acesso condicionado.
- Um backend auxiliar será avaliado para orquestrar validações e operações Git; por ora, os scripts locais permanecem como fonte de verdade.

### Próximos passos

1. Desenhar diagrama de componentes (frontend + backend auxiliar) destacando fluxos de dados.
2. Definir estratégia de workspace local (branches temporárias / patches) para edição antes do commit.
3. Mapear chamadas aos scripts existentes e requisitos de observabilidade (logs, metadados de execução).

## 3. Especificação de UX

### Abordagem

- Reutilizar componentes Material Design 3 já adotados (cartões, chips, tabelas responsivas).
- Guiar ações críticas com mensagens orientadas por governança (proveniência, validações obrigatórias).

### Entregáveis

- Wireframes das sub-rotas principais: dashboard, ingestão de JSON, editor de blocos, revisão/publicação.
- Fluxo de navegação incluindo estados vazios e mensagens de erro.
- Lista de componentes reutilizáveis e lacunas a preencher (ex.: uploader com pré-validação).

## 4. Backend de suporte

### Demandas previstas

- Endpoints REST/CLI para listar cursos e status dos conteúdos (aproveitando relatórios existentes).
- Serviço para validar JSONs sob demanda reaproveitando `npm run validate:content`.
- Funções para gerar diffs, preparar pacotes e abrir PRs (ex.: integração com `simple-git`).

### Próximos passos

1. Publicar contrato das APIs expostas pelo serviço local [`teacher:service`](./automation-backend.md) e evoluir autenticação.
2. Avaliar hospedagem do backend auxiliar (serverless vs. Node dedicado) e impacto em DevOps.
3. Definir política de auditoria/logs para ações críticas (upload, commit, publicação).

## 5. Plano de implementação incremental

| Iteração | Escopo                         | Entregáveis principais                                                                                | Status          |
| -------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------- |
| 1        | Roteamento + dashboard inicial | Rota `/professor`, cartão de boas-vindas, visão geral das disciplinas e links para guias existentes.  | ✅ Concluída    |
| 2        | Ingestão/validação de JSON     | Workbench `/professor/ingestao`, validação AJV, checklist operacional e documentação viva atualizada. | ✅ Concluída    |
| 3        | Editor visual                  | Editor baseado em blocos com suporte aos tipos mais comuns e validação inline com Ajv.                | ✅ Concluída    |
| 4        | Validações & relatórios        | Painel `/professor/validacao` com registro de execuções, notas e importação de relatórios oficiais.   | 🚧 Em andamento |
| 5        | Integração Git                 | Pacote `/professor/publicacao` + automações para branches, diffs e PRs com metadados de proveniência. | 🚧 Em andamento |

## 6. Testes e governança

### Estratégia de testes

- Unitários para componentes de formulário/blocos.
- Testes e2e cobrindo ingestão → edição → validação → publicação.
- Monitoramento de regressões usando stories/documentação viva.

### Governança

- Checklist obrigatório antes da publicação (metadados, validações rodadas, revisão cruzada).
- Auditoria das ações realizadas via painel (logs com usuário, horário, artefatos gerados).
- Política de rollback para conteúdos inválidos identificados pós-publicação.

---

> **Status:** documento vivo. Atualize a cada iteração concluída adicionando evidências, decisões revisadas e aprendizados.

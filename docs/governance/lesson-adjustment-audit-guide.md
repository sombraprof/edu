# Guia Operacional do Ciclo de Auditoria de Ajuste

Este documento padroniza as rodadas de auditoria após ajustes curriculares, garantindo que as aulas atualizadas sejam exportadas, registradas na planilha compartilhada e revisadas quanto à consistência pedagógica e técnica.

## 1. Passo a passo da auditoria

### 1.1 Exportar aulas ajustadas

- **Objetivo:** gerar evidências atualizadas (JSON, relatórios e capturas) para análise.
- **Procedimentos:**
  1. Executar `npm run validate:content` para confirmar que não há erros de schema.
  2. Rodar `npm run report:observability` e baixar o snapshot gerado em `reports/content-observability.json`.
  3. Exportar os arquivos das aulas ajustadas (`src/content/courses/<curso>/lessons/lesson-XX.json`) e organizar em pasta datada dentro de `reports/exports/`.
- **Responsáveis:** Ana Paula (Governança) coordena; apoio da Squad de Conteúdo na verificação de logs.

### 1.2 Preencher a planilha de acompanhamento

- **Objetivo:** registrar status, pendências e evidências por aula.
- **Procedimentos:**
  1. Abrir a planilha "Plano de Ajuste" (aba "Auditoria") no workspace compartilhado.
  2. Preencher colunas `responsável`, `status`, `evidências`, `validação técnica` e `observações` com base nos arquivos exportados.
  3. Vincular os relatórios gerados (`content-validation-report.json`, `content-observability.json`) usando links permanentes do repositório.
- **Responsáveis:** Rafael Nogueira (PMO) realiza o preenchimento; suporte de Ana Paula para dúvidas de governança.

### 1.3 Revisar consistência pedagógica e técnica

- **Objetivo:** validar alinhamento com planos de ensino, rubricas e integrações.
- **Procedimentos:**
  1. Docentes responsáveis revisam objetivos, competências e blocos avaliativos das aulas exportadas.
  2. Equipe técnica confere funcionamento de componentes MD3, links externos e integrações Moodle.
  3. Consolidar decisões e ajustes na ata padrão (`docs/governance/professor-validation-meeting.md`).
- **Responsáveis:**
  - Revisão pedagógica: Profa. Laura Mendes e docentes de cada disciplina.
  - Revisão técnica: Squad de Conteúdo, com Tiago Sombra liderando validação de integrações.

## 2. Encerramento de cada ciclo

1. Atualizar `docs/WORK_STATUS.md` com o progresso das aulas auditadas, destacando conclusões e pendências migradas para o backlog.
2. Registrar as decisões de coordenação (aprovações, ajustes adicionais, riscos escalados) na pasta `docs/decisions/`, seguindo a estrutura de atas existente.
3. Anexar links para relatórios e planilhas preenchidas no comentário final do ciclo (issue ou canal de comunicação oficial).

## 3. Riscos e mitigação

| Risco                                          | Impacto | Mitigação                                                                                  |
| ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| Exportações incompletas ou desatualizadas      | Alto    | Validar hashes das exportações e guardar checklist assinado pelo responsável.              |
| Planilha sem atualização em tempo hábil        | Médio   | Agendar lembretes pós-exportação e indicar suplente quando o PMO estiver ausente.          |
| Divergência entre revisão pedagógica e técnica | Alto    | Reunir pedagogia e tecnologia no mesmo dia e registrar deliberações na ata de coordenação. |
| Decisões não refletidas em `WORK_STATUS`       | Médio   | Checar o checklist de encerramento e solicitar dupla conferência antes de fechar o ciclo.  |

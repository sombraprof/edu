# Monitoramento de Entregas Pós-Módulo

Para acompanhar as entregas e ajustes necessários após cada módulo, foi criada uma planilha centralizada com indicadores quantitativos e qualitativos.

## Estrutura da planilha de métricas

- **Local:** `https://docs.google.com/spreadsheets/d/1PostModuloDDM-monitoramento` (acesso restrito à equipe acadêmica).
- **Aba 1 – Panorama Geral:**
  - Código da turma
  - Módulo / Aula
  - Responsável pela revisão
  - Data da entrega no Moodle
  - Status da validação (`Pendente`, `Em análise`, `Validado`)
- **Aba 2 – Evidências:**
  - ID da evidência
  - Tipo (vídeo, checklist, rubrica, fórum)
  - Link ou caminho no repositório
  - Última atualização (`ISO 8601`)
  - Responsável por anexar
- **Aba 3 – Ações corretivas:**
  - Referência da lição
  - Problema identificado
  - Ação sugerida
  - Responsável e prazo
  - Data de revalidação (`metadata.updatedAt`)

## Indicadores acompanhados

| Indicador            | Descrição                                                       | Meta    |
| -------------------- | --------------------------------------------------------------- | ------- |
| Entregas auditadas   | Percentual de TEDs revisadas nas duas semanas após cada módulo. | ≥ 90%   |
| Evidências anexadas  | Proporção de TEDs com evidências registradas na aba 2.          | 100%    |
| Correções concluídas | Percentual de ações corretivas finalizadas dentro do prazo.     | ≥ 85%   |
| Satisfação docente   | Nota média coletada no formulário pós-módulo.                   | ≥ 4,5/5 |

## Rotina de atualização

1. Atualizar a planilha após cada reunião de acompanhamento (`docs/governance/professor-validation-meeting.md`).
2. Gerar relatório semanal com `npm run validate:content` para garantir que não existam regressões de metadata.
3. Registrar evidências relevantes nas lições correspondentes (`metadata.evidences`).
4. Compartilhar resumo semanal com a coordenação e arquivar em `docs/governance/lesson-audit-plan.md`.

## Responsáveis

- **Gestão da planilha:** Rafael Nogueira (PMO)
- **Atualização de evidências:** Ana Paula (Governança)
- **Validação pedagógica:** Prof. Tiago Sombra
- **Escalonamento de riscos:** Coordenação acadêmica

## Próximas ações

- Automatizar ingestão das métricas usando `scripts/report-content-metrics.mjs`.
- Integrar a planilha com alertas por e-mail para TEDs com prazo próximo.
- Revisar indicadores após a primeira rodada de monitoramento e ajustar metas conforme necessidade.

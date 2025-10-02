# Plano de Auditoria Pós-Ajustes das Lições

## Objetivos

- Confirmar que todos os blocos MD3 refletem as decisões pedagógicas mais recentes.
- Garantir que cada lição possua `metadata` atualizado (`owners`, `updatedAt`, `sources` e evidências anexas).
- Registrar responsáveis, decisões e evidências para facilitar auditorias futuras e relatórios de governança.

## Escopo

| Curso | Lições priorizadas | Motivo                                                             |
| ----- | ------------------ | ------------------------------------------------------------------ |
| DDM   | Aulas 02, 06 e 12  | Ajustes em TEDs e validação de links/submissões no Moodle.         |
| LPOO  | Aulas 04 e 07      | Revisão de rubricagem e integração com fórum de dúvidas.           |
| TGS   | Aulas 03 e 36      | Alinhamento com estudos de caso ESG e monitoramento de evidências. |

## Fluxo de Auditoria

1. **Preparação (Governança + Pedagogia)**
   - Rodar `npm run validate:content` e anexar o relatório gerado em `reports/content-validation-report.json`.
   - Atualizar o quadro de pendências em `docs/governance/moodle-ted-crosswalk.md`.
2. **Revisão técnica (Squad de conteúdo)**
   - Conferir componentes interativos e assets descritos nas lições (capturas, vídeos e links externos).
   - Validar consistência dos `callouts` com orientações operacionais.
3. **Revisão pedagógica (Docentes responsáveis)**
   - Checar alinhamento das instruções com os planos de ensino e cronogramas avaliativos.
   - Aprovar ajustes de rubricas e descrições de TEDs.
4. **Registro e aprovação**
   - Consolidar decisões no template de ata (`docs/governance/professor-validation-meeting.md`).
   - Atualizar `metadata.updatedAt` e incluir novas evidências/documentos referenciados.

## Responsáveis

| Etapa                  | Responsável primário            | Apoio                       |
| ---------------------- | ------------------------------- | --------------------------- |
| Validação de schema    | Ana Paula (Governança)          | Squad de conteúdo           |
| Conferência de links   | Prof. Tiago Sombra (DDM)        | Equipe Moodle               |
| Rubricas e critérios   | Profa. Laura Mendes (Pedagogia) | Docentes de cada disciplina |
| Registro de evidências | Rafael Nogueira (PMO)           | Analista de dados           |

## Documentação e Evidências

- Planilha de controle: `docs/governance/post-module-monitoring.md` (link para planilha de métricas).
- Ata das reuniões com docentes: `docs/governance/professor-validation-meeting.md`.
- Ajustes de Moodle x TED: `docs/governance/moodle-ted-crosswalk.md`.
- Logs de validação: `reports/content-validation-report.json` anexado no repositório após cada rodada.

## Checklist de Conclusão

- [ ] Relatório de validação anexado e sem erros críticos.
- [ ] `metadata` atualizado nas lições auditadas.
- [ ] Evidências registradas e referenciadas.
- [ ] Ata aprovada e assinada digitalmente.
- [ ] Pendências migradas para o backlog do MD3 com responsáveis e prazos.

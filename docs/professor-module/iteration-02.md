# Iteração 2 — Ingestão e validação de JSON

> Documento vivo. Atualize sempre que novos fluxos forem testados ou surgirem pendências relevantes.

## Objetivo da iteração

- Habilitar um ambiente seguro para ingestão de aulas, exercícios e suplementos em JSON, permitindo validação imediata contra os schemas oficiais.
- Formalizar um checklist operacional que reduza conflitos de merge e garanta alinhamento com a branch `main` antes de cada rodada de autoria.
- Criar uma base para futuras iterações (editor visual, integração Git) coletando feedback de usabilidade sobre o fluxo atual.

## Entregas concluídas

- Rota dedicada `/professor/ingestao` com proteção via `TeacherModeGate`.
- Validação client-side usando AJV + `ajv-formats`, cobrindo `lesson.schema.json` e manifestos (`lessons`, `exercises`, `supplements`).
- Suporte a upload de arquivos `.json`, colagem de texto bruto, formatação automática e cópia rápida do payload higienizado.
- Painel de status com erros humanizados (path, propriedade obrigatória, enums aceitos) e cartão de próximos passos.
- Checklist operacional destacando `git checkout main && git pull --rebase` e criação de branches temáticas.

### Linha do tempo

- **2024-06-03** — Kick-off da iteração, definição do escopo e desenho do fluxo de ingestão.
- **2024-06-05** — Criação da rota `/professor/ingestao` e integração inicial do `TeacherModeGate`.
- **2024-06-07** — Inclusão da validação AJV com schemas oficiais e mensagens humanizadas.
- **2024-06-10** — Documentação do checklist operacional e alinhamento com o fluxo Git existente.
- **2024-06-12** — Publicação das primeiras notas de uso e coleta de feedback com o time de conteúdo.

## Fluxo sugerido (1ª rodada)

1. **Sincronizar branch principal**
   ```bash
   git checkout main
   git pull --rebase
   ```
2. **Criar branch temática**
   ```bash
   git checkout -b feature/<curso>-<conteudo>-iter2
   ```
3. **Gerar JSON com LLM ou script CLI** (`npm run scaffold:lesson` etc.).
4. **Validar no workbench**
   - Acessar `/professor/ingestao` (modo professor ativo).
   - Selecionar o schema correspondente.
   - Fazer upload do arquivo ou colar o JSON.
   - Corrigir erros apontados pelo painel (campos obrigatórios, tipos, enums).
5. **Rodar validação na CLI**
   ```bash
   npm run validate:content -- src/content/courses/<curso>/<artefato>
   ```
6. **Atualizar manifestos/wrappers** conforme necessário.
7. **Registrar metadados de proveniência** no JSON (`generatedBy`, `model`, `sourceMaterials`).
8. **Abrir PR** descrevendo contexto, arquivos incluídos e anexando relatórios.

## Feedback coletado até agora

- ✅ Erros `required` e `enum` são facilmente interpretados com as dicas sugeridas.
- ⚠️ Payloads muito grandes (>1MB) podem ser difíceis de manipular apenas via textarea; considerar upload com streaming ou quebra por blocos na iteração 3.
- ⚠️ Manifestos grandes exigem visão tabular para comparar ordem; sugerido criar pré-visualização dedicada no editor visual.

## Próximos passos / pendências

- [ ] **Pré-visualização dos blocos** — Edição textual disponível no [editor da iteração 3](./iteration-03.md); renderização visual permanece pendente.
- [ ] **Integração com validadores CLI** — Prototipar serviço auxiliar que execute `npm run validate:content` e devolva logs estruturados para exibir no painel.
- [ ] **Discovery do editor visual** — Conduzir entrevistas com autores/revisores para priorizar funcionalidades (duplicar blocos, histórico de alterações, comparação lado a lado).
- [ ] **Persistência temporária** — Investigar uso de IndexedDB ou workspace em disco para salvar rascunhos enquanto o usuário navega entre telas.

## Referências úteis

- [Plano geral do módulo](./README.md)
- [Schemas oficiais](../../schemas)
- [Guia de autoria](../CONTENT_AUTHORING_GUIDE.md)
- [Scripts CLI](../../package.json)

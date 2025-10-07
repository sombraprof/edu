# Iteração 3 — Editor visual de blocos (Legado)

> **Documento legado:** As rotas, painéis e automações descritos abaixo foram aposentados. O fluxo vigente utiliza o editor inline do modo professor e o serviço `teacher:service` limitado a `GET/PUT`. Consulte o [estado atual](../status-overview.md#estado-atual) para fontes de verdade atualizadas.
>
> Registro histórico preservado apenas para consulta. Não representa o fluxo atual.

## Objetivo da iteração

- Transformar o JSON validado na etapa de ingestão em uma experiência de edição visual para os blocos mais utilizados (`lessonPlan`, `callout`, `cardGrid`, `contentBlock`).
- Permitir ajustes rápidos de metadados (título, objetivo, duração, tags e listas) diretamente na interface, sem depender de edições manuais no arquivo.
- Preparar terreno para a automação das validações, garantindo que o editor exporte payloads alinhados aos schemas existentes.

## Entregas concluídas

- Rota `/professor/editor` com proteção via `TeacherModeGate`, contemplando importação por arquivo ou _paste_ e feedbacks de parsing.
- Formulários dedicados aos principais blocos (`lessonPlan`, `callout`, `cardGrid`, `contentBlock`) com suporte a adição/remoção de itens e edição direta dos textos.
- Editor de metadados com controle de listas por linha (objetivos, competências, habilidades, resultados, pré-requisitos e tags).
- Exportação do JSON revisado com botões de cópia rápida e _download_ para reaproveitar na ingestão ou em commits.
- Seção de dicas operacionais reforçando o uso do validador antes e depois da edição.
- Validação automática reaproveitando o `lesson.schema.json`, com painel de erros e dicas contextuais.

### Linha do tempo

- **2024-06-17** — Validação da proposta UX com autores e definição dos blocos de alto impacto para a iteração.
- **2024-06-19** — Implementação da nova rota `/professor/editor` com importação e parsing de JSON.
- **2024-06-21** — Entrega dos formulários de edição para `lessonPlan`, `callout`, `cardGrid` e `contentBlock` com pré-visualização textual.
- **2024-06-24** — Exportação com cópia/baixa de arquivo e ajustes no dashboard/menus para divulgar o editor.
- **2024-06-27** — Adição da validação inline com Ajv e painel de feedback automático dentro do editor.

## Fluxo sugerido (1ª rodada com o editor)

1. **Validar o JSON na ingestão**
   - Garantir que o payload passou pelo workbench `/professor/ingestao` e pelos scripts CLI (`npm run validate:content`).
2. **Carregar no editor visual**
   - Acessar `/professor/editor` com o modo professor ativo.
   - Importar o arquivo `.json` ou colar o conteúdo formatado.
   - Resolver eventuais erros de parsing antes de prosseguir.
3. **Ajustar metadados**
   - Revisar título, resumo, objetivo geral, duração, modalidade e tags.
   - Atualizar listas (objetivos específicos, competências, habilidades, resultados, pré-requisitos) linha a linha.
4. **Editar blocos principais**
   - Navegar pelo painel lateral e selecionar os blocos relevantes.
   - Usar os formulários dedicados para cartões, callouts e parágrafos.
   - Para estruturas avançadas, recorrer à edição em JSON bruto fornecida pelo editor.
5. **Exportar e versionar**
   - Copiar ou baixar o JSON revisado.
   - Revalidar com `npm run validate:content` antes do commit.
   - Atualizar manifestos/wrappers conforme necessário e abrir PR.

## Feedback inicial

- ✅ Autores relataram ganho de tempo ao ajustar `lessonPlan` e cartões, evitando busca manual por chaves no JSON.
- ✅ O suporte a listas por linha reduziu erros comuns (vírgulas, aspas) nas seções de objetivos e competências.
- ⚠️ Blocos complexos (por exemplo, `subBlock` com componentes embutidos) ainda dependem do editor em JSON bruto.
- ⚠️ Validações personalizadas do CLI (`npm run validate:content`) ainda precisam de integração via backend auxiliar.

## Próximos passos / pendências

- [ ] Integrar o editor com um backend auxiliar que execute `npm run validate:content` e traga logs estruturados para o painel.
- [ ] Adicionar pré-visualização renderizada para parágrafos e cartões, aproximando o resultado final do portal público.
- [ ] Investigar persistência local (IndexedDB) para rascunhos e histórico de alterações.
- [ ] Expandir suporte visual para blocos adicionais (`flightPlan`, `interactiveBlock`, `assessment`).

## Referências úteis

- [Plano geral do módulo](./README.md)
- [Registro da Iteração 2](./iteration-02.md)
- [Guia de autoria](../CONTENT_AUTHORING_GUIDE.md)
- [Schemas oficiais](../../schemas)

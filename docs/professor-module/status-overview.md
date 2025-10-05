# Status do módulo administrativo "Professor"

Este resumo apresenta exclusivamente as funcionalidades que permanecem ativas após a simplificação do modo professor. O foco atual é o editor inline nas páginas de aula/exercício e o serviço auxiliar mínimo que apenas lê e grava JSON.

## Estado atual

- [Plano de implementação do módulo](./README.md) — fonte principal com instruções de operação, passos de setup e decisões recentes.
- [Guia dentro da SPA](../../src/pages/TeacherGuide.vue) — interface que orienta professores a ativarem o modo professor e trabalharem inline.
- [Serviço auxiliar documentado](./automation-backend.md) — referência sobre o `npm run teacher:service`, seus endpoints (`GET/PUT`) e parâmetros de execução.

Consulte estes materiais ao comunicar o estado do módulo; qualquer funcionalidade além do editor inline e do serviço simplificado é considerada fora de escopo.

## Fluxo atual de autoria

1. **Iniciar o modo professor**
   - Suba o front-end com `npm run dev:teacher`.
   - Garanta que `VITE_TEACHER_API_URL` aponte para o serviço auxiliar ativo (por padrão `http://127.0.0.1:4178`).
2. **Editar conteúdo inline**
   - Acesse `/professor/editor` ou navegue para uma aula/exercício com o modo professor habilitado.
   - Use os painéis "Editar aula" ou "Editar exercício" para ajustar campos, com pré-visualização em tempo real.
   - Utilize "Reverter alterações" sempre que quiser descartar modificações locais.
3. **Persistir alterações**
   - Cada ajuste válido aciona `PUT /api/teacher/content`, gravando o JSON no arquivo correspondente em `src/content`.
   - Erros de escrita ou validação de JSON são exibidos imediatamente para correção.
4. **Publicar manualmente**
   - Execute os scripts CLI (`npm run validate:content`, relatórios) conforme a governança vigente.
   - Utilize Git manualmente para `status`, `add`, `commit`, `push` e criação de PRs.

## Serviço auxiliar simplificado (`teacher:service`)

- Executado via `npm run teacher:service`, ouvindo na porta `4178` (configurável).
- Endpoints disponíveis:
  - `GET /health` para diagnóstico.
  - `GET /api/teacher/content` para carregar JSON existente.
  - `PUT /api/teacher/content` para sobrescrever conteúdo já versionado.
- Opcionalmente exige `X-Teacher-Token` quando configurado.
- Não executa scripts, não manipula Git, não agenda automações.

## Itens fora de escopo

Painéis de ingestão, dashboards de validação, automações Git, criação de PRs e qualquer outro fluxo descrito nas iterações anteriores foram aposentados. Os registros completos permanecem em [`docs/professor-module/legacy/`](./legacy/) apenas como histórico.

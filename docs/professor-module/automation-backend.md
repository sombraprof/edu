# Serviço auxiliar do módulo Professor (`teacher:service`)

> Documento vivo descrevendo a API local responsável por executar scripts oficiais e sincronizar relatórios com o painel `/professor/validacao`.

## Visão geral

O serviço exposto pelo script `npm run teacher:service` roda um servidor HTTP em Node (porta padrão `4178`) e disponibiliza uma API leve para:

- executar os scripts oficiais (`validate:content`, `validate:report`, `report:observability:check`, `report:governance`);
- centralizar os logs retornados pelos scripts e informar código de saída, duração e horários;
- permitir que a SPA baixe os relatórios gerados diretamente do diretório `reports/` sem precisar subir arquivos manualmente.
- armazenar um histórico leve das execuções disparadas remotamente para consulta na SPA.
- consultar o status atual do workspace Git (branch, divergências e alterações locais) para orientar o fluxo de publicação.
- acionar `git fetch` controlado para sincronizar a branch principal antes de gerar commits e PRs.
- preparar checkout/abertura de branch a partir da `main` para alinhar o fluxo da iteração 5.
- adicionar arquivos ao staging com `git add` validando caminhos informados na SPA.
- registrar commits reutilizando a mensagem configurada no painel de publicação.
- enviar a branch ativa ao remoto com `git push`, configurando upstream quando necessário.

A configuração padrão atende ao desenvolvimento local. Para expor o serviço em ambientes compartilhados, habilite o token descrito abaixo e acompanhe as diretrizes de governança registradas na [iteração 4](./iteration-04.md#próximos-passos--pendências).

## Como executar

```bash
# 1. Atualize o repositório normalmente
npm install

# 2. Inicie o serviço auxiliar (porta padrão 4178)
npm run teacher:service
```

Variáveis de ambiente suportadas:

| Variável                                   | Descrição                                                                                  | Padrão      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------- |
| `TEACHER_SERVICE_PORT`                     | Porta TCP usada pelo servidor HTTP.                                                        | `4178`      |
| `TEACHER_SERVICE_HOST`                     | Host/interface de escuta. Ajuste para `0.0.0.0` se quiser receber chamadas externas.       | `127.0.0.1` |
| `TEACHER_SERVICE_HISTORY_LIMIT`            | Quantidade máxima de execuções armazenadas no histórico local.                             | `50`        |
| `TEACHER_SERVICE_TOKEN`                    | Token obrigatório para autenticar chamadas da SPA.                                         | _(vazio)_   |
| `TEACHER_SERVICE_PR_TOKEN`                 | Token pessoal de GitHub usado pelo serviço para abrir PRs via API.                         | _(vazio)_   |
| `TEACHER_SERVICE_PR_TOKEN_FILE`            | Caminho para arquivo protegido contendo o token de GitHub (permissões recomendadas `600`). | _(vazio)_   |
| `TEACHER_SERVICE_PR_ALLOWLIST`             | Lista de atores autorizados (header `X-Teacher-Actor`) a criar PRs automaticamente.        | _(vazio)_   |
| `TEACHER_SERVICE_PR_DEFAULT_BASE`          | Branch base padrão usada ao criar PRs quando não informada pela SPA.                       | `main`      |
| `TEACHER_SERVICE_PR_ALLOW_MAINTAINER_EDIT` | Controla o envio de `maintainer_can_modify` para o GitHub (`true` ou `false`).             | `true`      |

Para que a SPA utilize a API é necessário definir `VITE_TEACHER_API_URL` apontando para o endereço exposto pelo serviço. Exemplo: `VITE_TEACHER_API_URL=http://127.0.0.1:4178`.
Quando o token estiver habilitado, defina também `VITE_TEACHER_API_TOKEN` para que a SPA envie o header `X-Teacher-Token` automaticamente.

## Endpoints disponíveis

### `GET /health`

Retorna `{"status":"ok"}` para diagnóstico rápido.

### `GET /api/teacher/scripts`

Lista os scripts suportados, com comando recomendado e relatório associado (quando existir).

### `POST /api/teacher/scripts/run`

Recebe um JSON com a chave do script a ser executado:

```json
{ "key": "report" }
```

Retorna payload com `exitCode`, `output`, `startedAt`, `finishedAt`, `durationMs`, `reportKey`, `recordedAt` e `success`. Quando há mais de uma solicitação em paralelo, o serviço enfileira a execução e inclui `queuePosition`, `queueDurationMs` e `queuedAt`, permitindo sinalizar o tempo de espera antes do script iniciar. A SPA usa o resultado para preencher os logs automaticamente e atualizar o histórico local.

### `GET /api/teacher/reports/:id`

Disponibiliza o conteúdo JSON mais recente dos relatórios gerados.

- `validation` → `reports/content-validation-report.json`
- `observability` → `reports/content-observability.json`
- `governance` → `reports/governance-alert.json`

### `GET /api/teacher/scripts/history`

Retorna o histórico das execuções registradas pelo serviço. Aceita filtro opcional por `key`, por exemplo:

```
/api/teacher/scripts/history?key=report
```

Cada item inclui os mesmos campos do retorno de execução (`key`, `exitCode`, `output`, `durationMs`, `recordedAt`, `success`, etc.). O arquivo é persistido em `reports/teacher-script-history.json` com limite configurável via `TEACHER_SERVICE_HISTORY_LIMIT`.

### `GET /api/teacher/git/status`

Realiza um `git status --short --branch` no workspace do serviço e retorna um resumo com:

- branch atual e upstream configurado;
- contagem de commits à frente/atrás do remoto;
- lista dos arquivos com alterações pendentes (incluindo renomes);
- saída completa do comando para depuração.

A SPA usa esses dados para preencher o painel de publicação com o estado atual antes de gerar os comandos sugeridos.

### `POST /api/teacher/git/fetch`

Executa um `git fetch` direcionado e retorna o resultado consolidado. O corpo aceita parâmetros opcionais:

```json
{
  "remote": "origin",
  "branch": "main"
}
```

- `remote` – nome do remote a ser consultado (padrão `origin`).
- `branch` – branch remota a ser atualizada (padrão `main`). Informe `null` para executar `git fetch <remote>` sem branch específica.

O retorno inclui `success`, `exitCode`, `stdout`, `stderr`, `command` e, quando o comando conclui com sucesso, o status atualizado do workspace (`status`) já no mesmo formato de `/api/teacher/git/status`.

Na interface de publicação, o botão **Buscar atualizações da main** utiliza este endpoint para sincronizar a `main` antes de seguir com a rodada de commits.

### `POST /api/teacher/git/checkout`

Permite criar ou alternar para uma branch de trabalho controlada pelo serviço. Exemplo de corpo:

```json
{
  "branch": "feat/ajustes-aula-calculo",
  "create": true,
  "startPoint": "main"
}
```

- `branch` – obrigatório. Nome da branch local desejada.
- `create` – opcional. Quando `true`, executa `git checkout -b` criando a branch a partir do ponto informado.
- `startPoint` – opcional. Caso omitido em conjunto com `create: true`, o serviço usa `main` como base. Informe `null` para reutilizar o HEAD atual.

O retorno replica o padrão dos demais comandos Git: `success`, `exitCode`, `stdout`, `stderr`, `command` e, quando bem-sucedido, o status atualizado do workspace (`status`). O painel de publicação usa essa rota para gerar a branch informada no formulário sem sair da SPA.

### `POST /api/teacher/git/stage`

Executa `git add` controlado pelo serviço. O corpo aceita:

```json
{
  "paths": ["src/content/courses/.../lessons/introducao.json"],
  "all": false
}
```

- `paths` – lista de caminhos a serem adicionados ao staging. O serviço valida se cada entrada aponta para dentro do workspace e remove duplicados.
- `all` – opcional. Quando `true`, executa `git add --all` ignorando a lista de caminhos.

O retorno segue o padrão de `success`, `exitCode`, `stdout`, `stderr`, `command`, `paths` e `status` (com o `git status` atualizado quando o comando conclui com sucesso). A SPA usa esta rota para replicar o `git add` dos conteúdos listados na rodada diretamente pelo painel.

### `POST /api/teacher/git/commit`

Gera um commit reutilizando a mensagem configurada no painel de publicação. Exemplo de corpo:

```json
{
  "message": "feat: atualizar plano de aula de limites",
  "stagePaths": ["src/content/courses/calculo-1/lessons/limites.json"]
}
```

- `message` – obrigatório. O serviço higieniza a mensagem e suporta múltiplos parágrafos separados por linhas em branco.
- `stagePaths` – opcional. Quando informado, executa `git add -- <paths>` antes do commit, reaproveitando a mesma validação do endpoint anterior.
- `allowEmpty` – opcional. Quando `true`, repassa `--allow-empty` para permitir commits vazios controlados.

O retorno inclui `success`, `skipped` (indica se o commit foi abortado por falha no `git add`), `exitCode`, `stdout`, `stderr`, `command`, `messageParts`, `stage` (resultado do `git add` quando executado) e `status` com o `git status` após a tentativa. O painel usa esse endpoint para registrar commits sem sair da SPA.

### `POST /api/teacher/git/push`

Envia a branch atual para o remoto configurado.

```json
{
  "remote": "origin",
  "branch": "feat/professor-publicacao",
  "setUpstream": true
}
```

- `remote` – opcional. Padrão `origin`. O serviço higieniza o valor para evitar parâmetros inválidos.
- `branch` – obrigatório. Nome da branch local que será enviada.
- `setUpstream` – opcional. Quando `true`, acrescenta `-u` para configurar o upstream durante o primeiro push.

O retorno segue o padrão de `success`, `exitCode`, `stdout`, `stderr`, `command`, `remote`, `branch`, `setUpstream` e `status` (quando o comando conclui com sucesso). O painel marca `setUpstream: true` apenas quando o workspace ainda não possui upstream configurado.

### `POST /api/teacher/git/pull-request`

Abre um pull request reutilizando a branch local já publicada com `git push`. O serviço usa o token configurado no ambiente (via `TEACHER_SERVICE_PR_TOKEN` ou `TEACHER_SERVICE_PR_TOKEN_FILE`) e nunca expõe o segredo à SPA.

Exemplo de corpo:

```json
{
  "remote": "origin",
  "head": "feat/professor-publicacao",
  "base": "main",
  "title": "feat: preparar rodada do módulo do professor",
  "body": "## Resumo...",
  "draft": false
}
```

- `remote` – opcional. Padrão `origin`.
- `head` – obrigatório. Nome da branch que será usada como origem do PR.
- `base` – opcional. Padrão `TEACHER_SERVICE_PR_DEFAULT_BASE` (tipicamente `main`).
- `title` – obrigatório. Título enviado à API do GitHub.
- `body` – opcional. Descrição completa do PR no formato Markdown.
- `draft` – opcional. Quando `true`, cria o PR como rascunho.
- `allowMaintainerEdit` – opcional. Sobrescreve o valor de `maintainer_can_modify` (padrão definido pela variável de ambiente).

Além do `X-Teacher-Token`, o endpoint aceita o header opcional `X-Teacher-Actor`. Quando `TEACHER_SERVICE_PR_ALLOWLIST` está configurado, apenas os atores listados podem abrir PRs automaticamente.

Resposta típica:

```json
{
  "success": true,
  "number": 128,
  "htmlUrl": "https://github.com/org/repo/pull/128",
  "repository": "org/repo",
  "head": "feat/professor-publicacao",
  "base": "main",
  "draft": false,
  "command": "gh pr create --title \"feat: preparar rodada do módulo do professor\" --base main --head feat/professor-publicacao --web"
}
```

Em caso de falha, o serviço devolve `success: false`, detalhes do erro retornado pelo GitHub e o comando equivalente sugerido para executar manualmente.

## Autenticação

- Defina `TEACHER_SERVICE_TOKEN` ao iniciar o serviço; requisições aos endpoints `/api/teacher/` passam a exigir o header `X-Teacher-Token` com o mesmo valor.
- Configure `VITE_TEACHER_API_TOKEN` na SPA para que as chamadas automáticas incluam o token.
- Para auditoria, o painel envia `X-Teacher-Actor` com o identificador do responsável pela rodada. Quando `TEACHER_SERVICE_PR_ALLOWLIST` é definido, apenas valores presentes na lista podem criar PRs.
- O endpoint `/health` continua público para diagnósticos locais. Avalie reverse proxy ou VPN caso exponha o serviço externamente.

## Integração com a SPA

- Quando `VITE_TEACHER_API_URL` está configurada, o painel `/professor/validacao` mostra o botão **Executar via backend** para cada script.
- Ao finalizar a execução com sucesso, os logs são preenchidos automaticamente e o painel busca os relatórios correspondentes.
- Também é possível acionar manualmente o download via botões **Baixar do backend** em cada card de relatório.
- O painel exibe uma linha do tempo com as últimas execuções registradas, carregada a partir de `/api/teacher/scripts/history` e atualizada automaticamente a cada nova rodada.

## Próximas evoluções

- Autenticação e autorização antes de expor o serviço além do ambiente local.
- Auditoria enriquecida com identificação do usuário, branch e artefatos publicados.
- Cancelamento seguro e monitoramento detalhado das execuções enfileiradas.
- Evoluir das operações atuais para incluir anexos, rótulos e revisão cruzada ao abrir PRs, alinhando com a [Iteração 5](./iteration-05.md).
  - ✅ `git add`, `git commit` e `git push` já expostos na API e integrados ao painel de publicação.
  - ✅ Abertura automática de PRs integrada ao painel de publicação, com controle de permissões e token protegido.

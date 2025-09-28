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

A configuração padrão atende ao desenvolvimento local. Para expor o serviço em ambientes compartilhados, habilite o token descrito abaixo e acompanhe as diretrizes de governança registradas na [iteração 4](./iteration-04.md#próximos-passos--pendências).

## Como executar

```bash
# 1. Atualize o repositório normalmente
npm install

# 2. Inicie o serviço auxiliar (porta padrão 4178)
npm run teacher:service
```

Variáveis de ambiente suportadas:

| Variável                        | Descrição                                                                            | Padrão      |
| ------------------------------- | ------------------------------------------------------------------------------------ | ----------- |
| `TEACHER_SERVICE_PORT`          | Porta TCP usada pelo servidor HTTP.                                                  | `4178`      |
| `TEACHER_SERVICE_HOST`          | Host/interface de escuta. Ajuste para `0.0.0.0` se quiser receber chamadas externas. | `127.0.0.1` |
| `TEACHER_SERVICE_HISTORY_LIMIT` | Quantidade máxima de execuções armazenadas no histórico local.                       | `50`        |
| `TEACHER_SERVICE_TOKEN`         | Token obrigatório para autenticar chamadas da SPA.                                   | _(vazio)_   |

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

Retorna payload com `exitCode`, `output`, `startedAt`, `finishedAt`, `durationMs`, `reportKey`, `recordedAt` e `success`. A SPA usa o resultado para preencher os logs automaticamente e atualizar o histórico local.

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

## Autenticação

- Defina `TEACHER_SERVICE_TOKEN` ao iniciar o serviço; requisições aos endpoints `/api/teacher/` passam a exigir o header `X-Teacher-Token` com o mesmo valor.
- Configure `VITE_TEACHER_API_TOKEN` na SPA para que as chamadas automáticas incluam o token.
- O endpoint `/health` continua público para diagnósticos locais. Avalie reverse proxy ou VPN caso exponha o serviço externamente.

## Integração com a SPA

- Quando `VITE_TEACHER_API_URL` está configurada, o painel `/professor/validacao` mostra o botão **Executar via backend** para cada script.
- Ao finalizar a execução com sucesso, os logs são preenchidos automaticamente e o painel busca os relatórios correspondentes.
- Também é possível acionar manualmente o download via botões **Baixar do backend** em cada card de relatório.
- O painel exibe uma linha do tempo com as últimas execuções registradas, carregada a partir de `/api/teacher/scripts/history` e atualizada automaticamente a cada nova rodada.

## Próximas evoluções

- Autenticação e autorização antes de expor o serviço além do ambiente local.
- Auditoria enriquecida com identificação do usuário, branch e artefatos publicados.
- Suporte a filas de execução e cancelamento seguro.
- Evoluir das operações de checkout para automações completas de `git add`, `commit`, `push` e abertura de PR alinhadas à [Iteração 5](./iteration-05.md).

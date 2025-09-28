# Serviço auxiliar do módulo Professor (`teacher:service`)

> Documento vivo descrevendo a API local responsável por executar scripts oficiais e sincronizar relatórios com o painel `/professor/validacao`.

## Visão geral

O serviço exposto pelo script `npm run teacher:service` roda um servidor HTTP em Node (porta padrão `4178`) e disponibiliza uma API leve para:

- executar os scripts oficiais (`validate:content`, `validate:report`, `report:observability:check`, `report:governance`);
- centralizar os logs retornados pelos scripts e informar código de saída, duração e horários;
- permitir que a SPA baixe os relatórios gerados diretamente do diretório `reports/` sem precisar subir arquivos manualmente.
- armazenar um histórico leve das execuções disparadas remotamente para consulta na SPA.

A configuração padrão atende ao desenvolvimento local. Antes de expor o serviço em ambientes compartilhados, ainda será necessário adicionar autenticação e governança (ver [próximos passos](./iteration-04.md#próximos-passos--pendências)).

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

Para que a SPA utilize a API é necessário definir `VITE_TEACHER_API_URL` apontando para o endereço exposto pelo serviço. Exemplo: `VITE_TEACHER_API_URL=http://127.0.0.1:4178`.

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

## Integração com a SPA

- Quando `VITE_TEACHER_API_URL` está configurada, o painel `/professor/validacao` mostra o botão **Executar via backend** para cada script.
- Ao finalizar a execução com sucesso, os logs são preenchidos automaticamente e o painel busca os relatórios correspondentes.
- Também é possível acionar manualmente o download via botões **Baixar do backend** em cada card de relatório.
- O painel exibe uma linha do tempo com as últimas execuções registradas, carregada a partir de `/api/teacher/scripts/history` e atualizada automaticamente a cada nova rodada.

## Próximas evoluções

- Autenticação e autorização antes de expor o serviço além do ambiente local.
- Auditoria enriquecida com identificação do usuário, branch e artefatos publicados.
- Suporte a filas de execução e cancelamento seguro.
- Extensão da API para cobrir operações Git (branches, commits, criação de PRs) alinhadas à [Iteração 5](./iteration-05.md).

# Serviço auxiliar do módulo Professor (`teacher:service`)

> Documento vivo descrevendo o servidor HTTP mínimo que atende o editor inline do modo professor.

## Visão geral

O script `npm run teacher:service` expõe um servidor Node (porta padrão `4178`) responsável apenas por ler e gravar arquivos JSON em `src/content`. Ele não executa scripts, não interage com Git e não cria pull requests.

### Capacidades

- Restringe o acesso a arquivos dentro de `src/content` (somente `.json`).
- Normaliza caminhos recebidos, evita escapes para diretórios superiores e rejeita caracteres inválidos.
- Retorna erros claros para caminhos inexistentes, JSON inválido ou falhas de escrita.
- Opcionalmente exige autenticação por token (`TEACHER_SERVICE_TOKEN` + header `X-Teacher-Token`).

## Como executar

```bash
# Instalar dependências (uma vez)
npm install

# Iniciar o serviço auxiliar (porta padrão 4178)
npm run teacher:service
```

Variáveis de ambiente suportadas:

| Variável                | Descrição                                                         | Padrão      |
| ----------------------- | ----------------------------------------------------------------- | ----------- |
| `TEACHER_SERVICE_PORT`  | Porta TCP usada pelo servidor HTTP.                               | `4178`      |
| `TEACHER_SERVICE_HOST`  | Host/interface de escuta (use `0.0.0.0` para aceitar outras LAN). | `127.0.0.1` |
| `TEACHER_SERVICE_TOKEN` | Token opcional exigido pelo header `X-Teacher-Token`.             | _(vazio)_   |

Para que a SPA utilize a API, defina `VITE_TEACHER_API_URL` apontando para o endereço do serviço (`http://127.0.0.1:4178`, por exemplo). Quando o token estiver habilitado, configure também `VITE_TEACHER_API_TOKEN` para que o editor envie o header automaticamente.

## Endpoints disponíveis

### `GET /health`

Retorna `{ "status": "ok" }` para diagnóstico rápido. Não requer autenticação.

### `GET /api/teacher/content`

- Parâmetros: `path` (query string) apontando para um arquivo existente em `src/content`.
- Retorno: `{ "path": "...", "content": { ... } }` com o JSON parseado.
- Erros: `400` para caminhos inválidos, `401` quando o token está ausente, `404` se o arquivo não existir, `500` para exceções ao ler/parsear.

### `PUT /api/teacher/content`

- Corpo JSON: `{ "path": "src/content/.../file.json", "content": { ... } }`.
- Requisitos: o arquivo precisa existir e continuar dentro de `src/content`.
- Retorno: `{ "path": "...", "content": { ... }, "savedAt": "2025-..." }`.
- Erros: `400` para corpo inválido, `401` sem token, `404` quando o arquivo não é encontrado, `500` em falhas de escrita.

## Integração com a SPA

- O hook `useTeacherContentEditor` usa esses endpoints para carregar e salvar conteúdo.
- Sem o serviço ativo (ou sem `VITE_TEACHER_API_URL`), o editor permanece desabilitado e exibe instruções para ativá-lo.
- Validações, geração de relatórios e operações Git devem ser executadas manualmente via CLI (ex.: `npm run validate:content`, `git commit`).

## Próximos passos

- Documentar experiências de uso após a simplificação e coletar feedback dos revisores.
- Avaliar se novos endpoints são realmente necessários antes de reintroduzir automações.
- Manter o serviço pequeno para facilitar manutenção e auditoria.

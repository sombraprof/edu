# Estação 5 — Auditoria e Atualizações TechParts

## Objetivo
Finalizar o módulo de estoque garantindo buscas confiáveis, atualizações auditadas e documentação completa.

## Operações obrigatórias
- **Busca composta**: implemente `int buscarProduto(Produto estoque[], int total, int sku, const char *lote)` retornando índice ou -1.
- **Atualização auditada**: crie função `bool atualizarProduto(Produto *p, float novoPreco, int novoMinimo, FILE *log)` que grava motivo e horário da alteração.
- **Remoção**: desenvolva `bool removerProduto(Produto estoque[], int *total, int sku)` permitindo remoção lógica (flag) ou física (compactação).

## Perguntas-guia
1. Como garantir que o log contenha usuário, campo alterado e justificativa?
2. Quais políticas da TechParts precisam aparecer no relatório textual final?
3. Como organizar rollback caso a atualização comprometa indicadores?

## Checklist rápido
- [ ] Funções de busca cobrem casos inexistentes com mensagens claras.
- [ ] Atualizações rejeitam valores incoerentes (preço negativo, estoque mínimo maior que capacidade).
- [ ] Logs armazenados no formato `YYYY-MM-DD;SKU;campo;valor_antigo;valor_novo;responsavel`.

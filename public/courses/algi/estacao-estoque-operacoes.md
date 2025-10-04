# Estação 4 — Operações em Vetor de Produtos

## Objetivo
Ampliar o catálogo TechParts para suportar ordenações, cálculos de reposição e relatórios executivos.

## Operações obrigatórias
- **Inserção**: implemente função `bool inserirProduto(Produto estoque[], int *total, Produto novo)` que valida capacidade e SKU duplicado.
- **Ordenação**: aplique Bubble ou Insertion Sort ordenando por `quantidade` ascendente e registre o número de trocas.
- **Relatórios**: gere resumo com produtos abaixo do `estoqueMinimo`, valor total para reposição e top 3 itens com maior giro.

## Perguntas-guia
1. Como reutilizar o vetor inicial da Aula 35 sem perder registros já cadastrados?
2. Quais métricas devem alimentar o relatório textual e o fórum da Aula 36?
3. Como estruturar o código para facilitar as buscas e atualizações da Aula 37?

## Checklist rápido
- [ ] Inserções e ordenações atualizam o contador corretamente.
- [ ] Relatórios exportados em CSV ou texto com data/hora.
- [ ] Logs de ordenação anexados ao diretório do projeto.

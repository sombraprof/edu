# Estação 3 — Catálogo Inicial TechParts

## Objetivo
Modelar o registro `Produto` e montar o catálogo base que servirá de insumo para as aulas 36 e 37.

## Operações obrigatórias
- **Declaração**: defina `typedef struct { int sku; char nome[40]; int quantidade; int estoqueMinimo; float preco; } Produto;`.
- **Cadastro**: leia entradas do arquivo `estoque-techparts.csv` populando um vetor local com até 20 itens.
- **Impressão**: crie função `void imprimirProduto(const Produto*)` exibindo SKU, nome, quantidade atual e alerta de reposição.

## Perguntas-guia
1. Quais campos adicionais serão necessários para as próximas aulas (ex.: categoria, fornecedor)?
2. Como validar entradas repetidas de SKU antes de inserir no vetor?
3. Quais registros devem ser destacados no relatório textual da Aula 35?

## Checklist rápido
- [ ] Vetor inicializado com contador separado de capacidade.
- [ ] Função de impressão utilizada no mini-CRUD da aula.
- [ ] Log textual descrevendo cada cadastro realizado.

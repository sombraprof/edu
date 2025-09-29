# Laboratório Integrado: CRUD e Ordenação

1. **Modelagem:** defina uma `struct Produto` com campos `codigo`, `descricao`, `categoria` e `preco`.
2. **Carga inicial:** leia os dados de um arquivo CSV (pode ser gerado manualmente) para um vetor de `Produto`.
3. **Operações CRUD:**
   - Inserir novo produto validando unicidade do `codigo`.
   - Atualizar preço ou categoria a partir do `codigo` informado.
   - Remover registro deslocando elementos subsequentes.
4. **Busca:** implemente busca linear por `codigo` e por prefixo da `descricao`.
5. **Ordenação:** disponibilize ordenação crescente/decrescente por preço utilizando Bubble Sort ou Insertion Sort reutilizável.
6. **Menu interativo:** ofereça um menu textual com opções numeradas para manipular o vetor em memória.
7. **Relatórios:** gere um resumo com ticket médio por categoria e exporte para CSV.

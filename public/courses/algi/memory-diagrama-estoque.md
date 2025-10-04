# Diagrama de Memória — Vetor de Produtos TechParts

```
Endereço base -> estoque[0]
+---------------------------------------------------------+
| Produto[0]                                              |
|  sku:101 | nome:"Kit Sensor" | qtd:12 | min:5 | preço:189.90 |
+---------------------------------------------------------+
| Produto[1]                                              |
|  sku:205 | nome:"Controlador" | qtd:4 | min:6 | preço:249.00  |
+---------------------------------------------------------+
| Produto[2]                                              |
|  sku:310 | nome:"Cabo HDMI"   | qtd:25 | min:8 | preço:39.90  |
+---------------------------------------------------------+
| ...                                                      |
+---------------------------------------------------------+
```

- Cada bloco `Produto` ocupa espaço contínuo contendo campos primitivos e strings.
- O ponteiro para `estoque` é utilizado nas aulas 35-37: Aula 35 (cadastro), Aula 36 (ordenação/reposição), Aula 37 (busca/atualização).
- Nos slides, represente ponteiros retornados por funções de busca apontando para o bloco correspondente.

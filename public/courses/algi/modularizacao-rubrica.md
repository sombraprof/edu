# Rubrica de Modularização (Funções em C)

| Critério | Excelente (3) | Adequado (2) | Em Desenvolvimento (1) |
| --- | --- | --- | --- |
| Clareza do propósito | Cada função tem nome expressivo, responsabilidade única e documentação curta de uso. | Maioria das funções é clara, com pequenos desvios de responsabilidade ou nomenclatura. | Funções genéricas, com múltiplas responsabilidades ou nomes ambíguos. |
| Interface (parâmetros/retorno) | Parâmetros minimamente necessários, tipos corretos e retorno consistente com a regra. | Pequenos excessos ou omissões em parâmetros; correções simples resolvem. | Parâmetros incoerentes, tipos incorretos ou uso indevido de globais. |
| Encadeamento e testes | Funções são chamadas em fluxo legível, cobertas por testes automatizados relevantes. | Chamadas funcionam com testes parciais. | Falta organização das chamadas ou cobertura mínima de testes. |
| Tratamento de erros | Valida entradas críticas e sinaliza condições inesperadas de forma previsível. | Tratar erros simples; faltam mensagens ou códigos detalhados. | Não trata erros ou causa comportamento indefinido. |

## Orientações de uso
- Utilize durante revisões de código em dupla.
- Marque evidências em comentários do repositório ou planilhas de acompanhamento.
- Revise antes das avaliações para alinhar expectativas de qualidade.

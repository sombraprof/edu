# Playbook: Laço `do-while`

## Quando usar
- Necessidade de executar o corpo **ao menos uma vez**.
- Menus de repetição com validação de saída.
- Processamento de lotes que dependem da primeira leitura para definir continuidade.

## Boas práticas
1. Registre as variáveis lidas dentro do corpo antes da condição.
2. Documente claramente a condição de permanência (início com verbo no infinitivo).
3. Faça checklist de casos limite: saída imediata, ciclo mínimo e repetição prolongada.

## Exercício sugerido
Implemente um menu de caixa eletrônico com `do-while` que oferece opções de depósito, saque e extrato. Garanta que as entradas inválidas informem o usuário sem encerrar o laço.

# Laboratório: Passagem de Parâmetros em C

1. Implemente `double calcular_desconto(double valor, double percentual)` garantindo validação de faixa (0 a 100).
2. Reescreva um cálculo de IMC separando funções `ler_dados_paciente`, `calcular_imc` e `classificar_imc`.
3. Compare passagem por valor e ponteiro reescrevendo `void atualizar_saldo(double *saldo, double deposito)`.
4. Registre testes no arquivo `tests/test_parametros.c` chamando cada função com casos limite.

> Sugestão: compile com `gcc -Wall -Wextra -Werror tests/test_parametros.c src/*.c` para garantir uso correto dos parâmetros.

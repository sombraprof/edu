#include <assert.h>
#include <stdio.h>

/* Protótipos esperados para a suíte de testes */
double calcular_media(double soma, int quantidade);
int validar_idade(int idade);
int converter_minutos_para_segundos(int minutos);

static void testar_calcular_media(void) {
  assert(calcular_media(10.0, 2) == 5.0);
  assert(calcular_media(0.0, 1) == 0.0);
  assert(calcular_media(7.5, 3) - 2.5 < 0.0001);
  assert(calcular_media(15.0, 0) == 0.0 && "deve proteger divisao por zero");
}

static void testar_validar_idade(void) {
  assert(validar_idade(18) == 1);
  assert(validar_idade(0) == 0);
  assert(validar_idade(135) == 0);
}

static void testar_converter_minutos_para_segundos(void) {
  assert(converter_minutos_para_segundos(5) == 300);
  assert(converter_minutos_para_segundos(0) == 0);
  assert(converter_minutos_para_segundos(-2) == -1 && "retornar codigo de erro para minutos negativos");
}

int main(void) {
  testar_calcular_media();
  testar_validar_idade();
  testar_converter_minutos_para_segundos();
  puts("✅ Todos os testes passaram. Ajuste as implementações para falhas.");
  return 0;
}

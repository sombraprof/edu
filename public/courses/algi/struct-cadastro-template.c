#include <stdio.h>
#include <string.h>

#define MAX_NOME 64

typedef struct {
    int id;
    char nome[MAX_NOME];
    char setor[32];
    float faturamentoMensal;
} Empresa;

void imprimirEmpresa(const Empresa *empresa) {
    printf("[%d] %s | Setor: %s | Faturamento: R$ %.2f\n",
           empresa->id, empresa->nome, empresa->setor, empresa->faturamentoMensal);
}

int main(void) {
    Empresa exemplo = {1, "Cooperativa Horizonte", "Serviços", 18500.0f};

    imprimirEmpresa(&exemplo);

    return 0;
}

# Canvas de Design Modular

| Módulo | Responsabilidades | Funções expostas | Dependências |
| --- | --- | --- | --- |
| Entrada | Validar e normalizar dados dos usuários. | `ler_menu`, `solicitar_inteiro` | `<stdio.h>`, `<ctype.h>` |
| Domínio | Encapsular regras de negócio e cálculos. | `calcular_pontos`, `avaliar_risco` | `entrada.h`, `math.h` |
| Relatórios | Apresentar resultados com formatação consistente. | `imprimir_relatorio`, `exportar_csv` | `dominio.h`, `<stdio.h>` |

## Passos sugeridos
1. Liste módulos candidatos e responsabilidades.
2. Defina protótipos em headers dedicados.
3. Escreva testes por módulo antes de integrar.
4. Atualize o README do projeto com instruções de compilação modular.

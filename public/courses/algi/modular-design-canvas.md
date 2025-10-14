# Canvas de Design Modular

| Módulo | Responsabilidades | Funções expostas | Dependências |
| --- | --- | --- | --- |
| Entrada | Validar e normalizar dados dos usuários. | `ler_menu`, `solicitar_inteiro` | `<stdio.h>`, `<ctype.h>` |
| Domínio | Encapsular regras de negócio e cálculos. | `calcular_pontos`, `avaliar_risco` | `entrada.h`, `math.h` |
| Relatórios | Apresentar resultados com formatação consistente. | `imprimir_relatorio`, `exportar_csv` | `dominio.h`, `<stdio.h>` |

```json
{
  "type": "checklist",
  "title": "Checklist de métodos coesos",
  "description": "Use antes da próxima atividade prática para alinhar a dupla.",
  "items": [
    { "label": "Verifique se cada função tem um nome com verbo que descreve claramente sua responsabilidade principal.", "required": true },
    { "label": "Verifique se as entradas e invariantes críticos são validados antes de delegar para o módulo de domínio.", "required": true },
    { "label": "Verifique se os fluxos excepcionais e erros de I/O estão tratados sem quebrar a execução dos demais módulos.", "required": true },
    { "label": "Verifique se há testes cobrindo os caminhos principais e casos de borda de cada módulo antes de integrar.", "required": true }
  ]
}
```

## Passos sugeridos
1. Liste módulos candidatos e responsabilidades.
2. Defina protótipos em headers dedicados.
3. Escreva testes por módulo antes de integrar.
4. Atualize o README do projeto com instruções de compilação modular.

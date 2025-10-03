# Checklist de Código Limpo – LPOO 2025.2

Use esta lista durante revisões de código e antes de finalizar pull requests no projeto bancário.

## Convenções gerais

- [ ] Nome de classes indica responsabilidade (substantivo) e evita sufixos genéricos como `Manager` ou `Util`.
- [ ] Métodos possuem no máximo 20 linhas e um único nível de abstração.
- [ ] Condicionais complexas usam métodos explicativos (`isSaldoInsuficiente`) ou objetos de estratégia.
- [ ] Duplicações foram eliminadas via extração de métodos/classes.

## Tratamento de exceções

- [ ] Nenhum `catch` vazio ou que apenas imprime stacktrace.
- [ ] Mensagens de erro são claras e traduzidas para o domínio.
- [ ] Uso de `try-with-resources` para streams, conexões e readers.

## Testes

- [ ] Testes seguem o padrão Arrange-Act-Assert.
- [ ] Nomes descritivos (`deveCalcularTarifaQuandoContaEspecial`).
- [ ] Dados mágicos substituídos por constantes ou builders.
- [ ] Cobertura mínima acordada (>= 75%) atingida para módulos críticos.

## Revisão por pares

- [ ] Checklist aplicado e registrado no pull request.
- [ ] Comentários pendentes resolvidos e marcados como `Resolved`.
- [ ] Pipeline de CI executou com sucesso.

## Métricas úteis

| Indicador           | Ferramenta | Meta                                |
| ------------------- | ---------- | ----------------------------------- |
| Cobertura de testes | JaCoCo     | ≥ 75% linhas / 90% classes críticas |
| Bugs estáticos      | SpotBugs   | 0 bugs de alta severidade           |
| Estilo              | Checkstyle | 0 violações bloqueadoras            |

> **Dica:** armazene este checklist no repositório (`docs/checklists/clean-code.md`) e evolua conforme novas regras forem adotadas pela turma.

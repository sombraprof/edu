# Checklist de Boas Práticas em Funções C

- [ ] Nomeia funções com verbos no infinitivo (`calcular`, `validar`).
- [ ] Limita cada função a no máximo 25 linhas ou extrai responsabilidades secundárias.
- [ ] Evita variáveis globais; quando inevitável, documenta o motivo.
- [ ] Documenta contratos em comentários acima do protótipo.
- [ ] Garante testes positivos e negativos para cada função crítica.
- [ ] Configura `-Wall -Wextra -Werror` na compilação.
- [ ] Analisa cobertura com `gcov` ou `llvm-cov` quando disponível.

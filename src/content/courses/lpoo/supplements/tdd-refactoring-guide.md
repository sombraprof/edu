# Guia Rápido de TDD e Refatoração

Este material resume o fluxo utilizado na aula 11 para apoiar ciclos curtos de evolução com segurança.

## 1. Ciclo Red-Green-Refactor

1. **Red** – Escreva o teste que falha explicitando regra de negócio ou bug reproduzido.
2. **Green** – Implemente a solução mínima para passar o teste, evitando refatorações prematuras.
3. **Refactor** – Limpe o código: extraia métodos, reduza duplicações e melhore nomes.

> Registre cada ciclo em commits pequenos (`feat:`/`refactor:`) facilitando code review e rollback.

## 2. Estratégias de refatoração

- **Extract Class:** quando uma classe possui múltiplas responsabilidades.
- **Introduce Parameter Object:** ao passar mais de três parâmetros relacionados.
- **Replace Conditional with Polymorphism:** para reduzir `switch`/`if` baseados em tipo.
- **Encapsulate Collection:** proteja coleções expostas no domínio.

## 3. Suporte de testes

| Cenário                  | Técnica                | Ferramentas                |
| ------------------------ | ---------------------- | -------------------------- |
| Dependências externas    | Mock/stub              | Mockito, WireMock          |
| Código legado sem testes | Characterization Tests | JUnit + Approval Tests     |
| Regressões recorrentes   | Testes parametrizados  | `@ParameterizedTest` + CSV |

## 4. Métricas essenciais

- **Cobertura de linhas:** acompanhar variação a cada refatoração.
- **Complexidade ciclomática:** monitore com Sonar ou PMD (meta <= 10 por método).
- **Tempo de build:** mantenha ciclos abaixo de 10 minutos.

## 5. Checklist antes de abrir PR

- [ ] Todos os testes (novos e antigos) passam localmente e no CI.
- [ ] `TODO` temporários foram removidos ou registrados em issues.
- [ ] Código documentado quando necessário (JavaDoc, ADRs).
- [ ] Métricas antes/depois anexadas no comentário do PR.

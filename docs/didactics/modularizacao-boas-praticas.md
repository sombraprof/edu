# Boas Práticas de Modularização para Moodle

Este material deve ser disponibilizado no Moodle junto com os recursos das aulas 25 a 27 de Algoritmos I.

## 1. Nomes Expressivos

- Use verbos no infinitivo para funções que executam ações (`calcular_media`, `validar_paciente`).
- Prefira substantivos claros para estruturas de dados (`Paciente`, `RelatorioFluxo`).
- Evite abreviações enigmáticas; se precisar abreviar, registre o significado no comentário inicial do arquivo.

## 2. Responsabilidade Única

- Cada função deve ter um único motivo para mudar.
- Evite mesclar leitura, processamento e saída na mesma função.
- Utilize comentários curtos explicando o "porquê" da função, não o "como".

## 3. Escopo Controlado

- Limite variáveis globais a constantes ou configurações imutáveis.
- Prefira variáveis locais e parâmetros explícitos para tornar dependências visíveis.
- Use `static` em funções auxiliares declaradas no mesmo arquivo `.c` quando não forem reutilizadas externamente.

## 4. Contratos Claros

- Documente pré-condições e pós-condições antes da implementação.
- Ao usar ponteiros, explique no comentário quem é responsável por alocar e liberar memória.
- Anote efeitos colaterais relevantes (ex.: "atualiza contador global de pacientes").

## 5. Integração Contínua de Testes

- Inclua chamadas a `assert` imediatamente após implementar uma função para garantir comportamento esperado.
- Mantenha suites de teste curtas dentro do arquivo de implementação enquanto o módulo está em desenvolvimento.
- Registre no relatório de squad quais funções foram validadas automaticamente.

## 6. Checklist para Revisão em Squad

1. Funções nomeadas de forma consistente? (verbo no infinitivo)
2. Responsabilidade única evidenciada no comentário inicial?
3. Escopo das variáveis mais restrito possível?
4. Há asserts cobrindo casos principais e limites?
5. Documentação atualizada no relatório de fluxos e pseudocódigos?

> Atualize este guia conforme feedbacks das squads e publique o link correspondente em cada aula no Moodle.

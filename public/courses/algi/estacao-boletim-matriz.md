# Estação 1 — Boletim TechED (Matriz Base)

## Objetivo
Construir e validar a matriz `boletim[ALUNOS][DISCIPLINAS]` com dados reais da turma TechED.

## Operações obrigatórias
- **Declaração e inicialização**: copie 5 estudantes × 4 disciplinas do arquivo `boletim-tech-ed.csv`.
- **Cálculo de médias**: use dois loops `for` para somar notas por estudante e atualizar a coluna `media`.
- **Classificação de status**: adicione coluna `status` preenchida com `Aprovado`, `Recuperação` ou `Acompanhamento` usando média ≥ 6.0.

## Perguntas-guia
1. Como garantir que índices `[aluno][disciplina]` permaneçam alinhados com os cabeçalhos?
2. Quais campos precisam aparecer no relatório textual da Aula 33?
3. Como registrar no log as alterações feitas manualmente na matriz?

## Checklist rápido
- [ ] Matriz declarada com limites corretos.
- [ ] Médias arredondadas para uma casa decimal (`%.1f`).
- [ ] Status escrito exatamente como solicitado para alimentar o relatório da coordenação.

# Estação 2 — Indicadores do Boletim TechED

## Objetivo
Produzir visões analíticas do boletim consolidando turmas, disciplinas e pesos.

## Operações obrigatórias
- **Transposição**: gere `boletimT[DISCIPLINAS][ALUNOS]` preservando cabeçalhos.
- **Agregações**: some matrizes de turmas A e B armazenando o resultado em `boletimTotal`.
- **Índice ponderado**: calcule `indiceDesempenho[ALUNOS]` multiplicando notas pelos pesos informados em `pesos-bimestres.csv`.

## Perguntas-guia
1. Como os novos indicadores alimentam o relatório textual da Aula 34?
2. Quais validações de dimensão precisam ser logadas antes da multiplicação?
3. Como evidenciar estudantes com maior variação entre bimestres?

## Checklist rápido
- [ ] Transposição validada (`linhas == colunasT`).
- [ ] Somas normalizadas pelo número de turmas agregadas.
- [ ] Índices ponderados registrados com duas casas decimais e explicação de metodologia.

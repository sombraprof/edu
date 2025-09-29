# Briefing da Atividade Assíncrona de Triagem

## Contexto
Uma clínica-escola de enfermagem recebe pacientes por um formulário online antes da chegada presencial. É necessário classificar cada caso em três filas: **emergência**, **prioritário** ou **observação padrão**.

## Dados disponíveis
- Temperatura corporal, frequência cardíaca e saturação de O2.
- Lista de sintomas principais.
- Indicadores de risco: idade > 65, gestação, doenças crônicas marcantes.
- Tempo de deslocamento até a clínica.

## Entregáveis
1. Algoritmo em C que processe até 50 formulários usando laços e condicionais integrados.
2. Registro em arquivo `.csv` com o resumo da triagem (nome, classificação, justificativa).
3. Relatório de testes contendo pelo menos 5 casos, cobrindo extremos.

## Critérios de sucesso
- Condições mutuamente exclusivas com prioridade correta.
- Laços protegidos contra overflow de dados.
- Mensagens claras para cada classificação.

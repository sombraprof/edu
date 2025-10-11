# Interactive Content Blocks Roadmap

## Contexto e objetivo

Este documento consolida os achados das entrevistas e sondagens realizadas com docentes, coordenadores e designers instrucionais entre 8 e 15 de abril de 2024. O objetivo foi identificar quais formatos interativos (slides, quadros, protótipos, simulações etc.) são mais demandados por disciplina, mapear dores prioritárias e orientar a priorização de novos blocos no design system educacional.

As notas completas das entrevistas e formulários foram registradas no espaço **Confluence › Ensino › Blocos Interativos › Levantamento 2024-Q2**.

## Metodologia de coleta

- **Entrevistas semiestruturadas** com 11 docentes/coordenadores representando 6 cursos (Pedagogia, Engenharia de Software, Administração, Enfermagem, Matemática e Design). Tempo médio: 35 minutos.
- **Sondagem assíncrona** com 28 respondentes (docentes e conteudistas) via formulário, com perguntas sobre formatos usados, frequência, dificuldades e sugestões de melhoria.
- **Análise de produções recentes** (17 objetos de aprendizagem publicados em 2024) para identificar blocos reutilizados e customizações recorrentes.

## Demandas por disciplina

| Disciplina/Curso       | Formatos Mais Demandados                           | Frequência de Uso | Principais Dores                                                                   | Blocos Candidatos                                                             |
| ---------------------- | -------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Pedagogia              | Quadros colaborativos, linhas do tempo             | Semanal           | Falta de suporte a coautoria e comentários dos alunos; difícil adaptar para mobile | Quadro colaborativo responsivo; Linha do tempo editável                       |
| Engenharia de Software | Simulações de código, protótipos navegáveis        | Quinzenal         | Integração limitada com repositórios; manutenção manual de exemplos                | Sandbox de código com GitHub import; Visualizador de protótipos com hotspots  |
| Administração          | Planilhas interativas, dashboards                  | Mensal            | Dados desatualizados, dificuldade de incorporar atualizações periódicas            | Planilha conectada a APIs; Dashboard parametrizável                           |
| Enfermagem             | Simulações clínicas, vídeos ramificados            | Mensal            | Configuração complexa, ausência de métricas de decisão                             | Simulação clínica com roteiros predefinidos; Player de vídeo com branching    |
| Matemática             | Quadros brancos digitais, exercícios passo a passo | Semanal           | Ferramenta atual não aceita escrita manual; falta de feedback automatizado         | Quadro branco com reconhecimento de escrita; Exercícios guiados com validação |
| Design                 | Moodboards, galerias de referência                 | Mensal            | Upload manual e falta de comentários estruturados                                  | Moodboard colaborativo; Galeria com curadoria e reações                       |

## Dores consolidadas

1. **Coautoria limitada**: fluxos colaborativos (docente ↔ aluno) inexistentes nos blocos atuais.
2. **Baixa responsividade**: formatos críticos (quadros, simulações) não oferecem experiência satisfatória em mobile.
3. **Atualização manual de dados**: blocos que dependem de datasets precisam ser reconfigurados a cada oferta.
4. **Monitoramento de aprendizagem**: falta captura de métricas de interação que possam alimentar relatórios acadêmicos.
5. **Integrações externas**: necessidade de conectar blocos a fontes externas (GitHub, APIs institucionais) sem trabalho manual.

## Critérios de priorização

| Critério                  | Descrição                                                                                  | Escala               |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| Impacto pedagógico        | Capacidade do bloco de melhorar engajamento e aprendizagem em grande parte das disciplinas | 1 (baixo) a 5 (alto) |
| Esforço técnico           | Estimativa de esforço para projetar, desenvolver e integrar o bloco                        | 1 (alto) a 5 (baixo) |
| Potencial de reutilização | Probabilidade de o bloco ser reutilizado em múltiplas disciplinas e modalidades            | 1 (baixo) a 5 (alto) |

## Matriz de decisão

| Bloco Candidato                             | Impacto pedagógico | Esforço técnico (invertido) | Potencial de reutilização | Nota ponderada\* |
| ------------------------------------------- | ------------------ | --------------------------- | ------------------------- | ---------------- |
| Quadro colaborativo responsivo              | 5                  | 3                           | 4                         | 4,3              |
| Linha do tempo editável                     | 4                  | 4                           | 4                         | 4,1              |
| Sandbox de código com GitHub import         | 5                  | 2                           | 3                         | 3,6              |
| Visualizador de protótipos com hotspots     | 3                  | 3                           | 4                         | 3,4              |
| Planilha conectada a APIs                   | 4                  | 2                           | 5                         | 3,8              |
| Dashboard parametrizável                    | 3                  | 3                           | 4                         | 3,4              |
| Simulação clínica com roteiros predefinidos | 5                  | 2                           | 3                         | 3,6              |
| Player de vídeo com branching               | 4                  | 3                           | 4                         | 3,9              |
| Quadro branco com reconhecimento de escrita | 5                  | 1                           | 3                         | 3,3              |
| Exercícios guiados com validação            | 4                  | 4                           | 4                         | 4,1              |
| Moodboard colaborativo                      | 3                  | 4                           | 4                         | 3,7              |
| Galeria com curadoria e reações             | 3                  | 4                           | 4                         | 3,7              |

\*Notas calculadas com pesos: impacto 50%, esforço técnico (maior é melhor) 30%, reutilização 20%.

## Recomendações prioritárias (2024-Q2)

1. **Quadro colaborativo responsivo** – endereça dores de coautoria e responsividade para Pedagogia e Matemática.
2. **Exercícios guiados com validação** – amplia feedback automatizado, demanda recorrente em Matemática e cursos de exatas.
3. **Linha do tempo editável** – alta aderência a Pedagogia e História; baixo esforço incremental.
4. **Player de vídeo com branching** – atende Enfermagem e outras áreas com roteiros decisórios.

## Validação com stakeholders

- **Revisão pedagógica**: encontro (18/abr) com 4 coordenadores de curso; validação de critérios e priorização dos quatro blocos listados.
- **Revisão técnica**: sessão com time de engenharia (19/abr) para validar esforços; sem bloqueios.
- **Ajustes incorporados**: inclusão de métricas de uso nos requisitos mínimos dos blocos priorizados.

## Próximos passos e épicos criados

Os quatro itens priorizados foram cadastrados como épicos no Jira (projeto **EDU-PLAT**):

- **EDU-PLAT-231** · Quadro colaborativo responsivo
- **EDU-PLAT-232** · Exercícios guiados com validação
- **EDU-PLAT-233** · Linha do tempo editável
- **EDU-PLAT-234** · Player de vídeo com branching

Cada épico inclui descrição, critérios de aceite e dependências. As squads responsáveis foram notificadas no canal `#plataforma-interativa` (Slack) e um checkpoint quinzenal foi agendado para acompanhar a execução.

# Teoria Geral de Sistemas (TGS)

## Plano de ajuste das aulas

Este plano orienta a atualização das aulas de **Teoria Geral de Sistemas (TGS)** para garantir aderência ao plano pedagógico vigente e às diretrizes MD3 utilizadas no repositório. Cada encontro está descrito em `src/content/courses/tgs/lessons/lesson-XX.json`, indexado por `src/content/courses/tgs/lessons.json`, e precisa refletir o encadeamento definido para a Curricularização da Extensão.

- [ ] Consolidar objetivos, competências e resultados esperados em cada `lesson-XX.json`, conectando-os aos projetos extensionistas e às situações de aprendizagem das aulas correspondentes.
- [ ] Mapear dependências com outras frentes curriculares (Extensão, Laboratórios Integradores, projetos multidisciplinares) e registrar responsáveis pedagógicos.
- [ ] Revisar materiais de apoio e pontos de contato com a coordenação e o professor titular de TGS.

## 1. Diretrizes transversais

1. **Metadados e estrutura mínima** – confirmar em cada `lesson-XX.json` os campos `summary`, `objectives`, `competencies`, `skills`, `outcomes`, `duration`, `modality`, `resources`, `assessment` (quando aplicável) e `metadata.updatedAt`/`metadata.owners`; garantir a sequência mínima por aula definida no plano de aprimoramento (contexto + exemplo aplicado + vídeo + exercício/TED + referências do plano de ensino).
2. **Blocos MD3 completos** – assegurar `lessonPlan` e `flightPlan` detalhados, `callouts` para orientações pré/pós-aula, `cardGrid` para sínteses e uso de componentes específicos (`contentBlock`, `md3Table`, `callout.warning`) sempre que necessário para operacionalizar os ajustes.
3. **Substituir "o professor mostrará"** – revisar cada ocorrência e inserir recursos concretos: link ou anexo em `resources`, descrição do passo a passo em `contentBlock` e, se houver demonstração, checklist de observação ou roteiro dentro do `lessonPlan`.
4. **Exemplos escritos e contextualizados** – incluir parágrafos ou `cardGrid` com casos brasileiros (Magalu, TOTVS, Nubank, SUS Digital, gov.br, etc.) que conectem teoria e prática nas aulas introdutórias e nos conteúdos subsequentes.
5. **TEDs e exercícios padronizados** – transformar instruções vagas em blocos com objetivo, formato de entrega, tempo estimado, rubrica compacta (em `callout.info` ou `md3Table`) e alinhamento com o Moodle (título, link e prazo); quando a avaliação substituir o TED, registrar isso em `assessment`.
6. **Recursos em vídeo com propósito** – cada vídeo deve ter fonte, duração e objetivo pedagógico descritos em `resources`, priorizando materiais curtos (≤10 min) e playlists oficiais.
7. **Ativação de exercícios extras** – atualizar blocos adicionais (`exercises`, `extras`) para `available: true` somente após revisão, incluindo critérios de correção e referência direta ao conteúdo trabalhado em aula.
8. **Integração com Moodle** – replicar a abordagem do plano de ALGI usando `callout.info` para indicar uploads obrigatórios, `callout.warning` para prazos e conduta e links diretos para TEDs, fóruns ou avaliações hospedados no AVA.
9. **Referências bibliográficas prioritárias** – garantir que cada aula cite pelo menos uma das obras-chave de TGS (Bertalanffy, 1973; Stair et al., 2021; Meireles & Sordi, 2019; Batista, 2014; Silva et al., 2019; Palmisano & Rosini, 2012; Audy & Brodbeck, 2008; Imoniana, 2016) nas seções de `resources`/`bibliography`, destacando capítulo ou página relevante.

## 2. Ajustes por unidade temática

### Curricularização da Extensão e integração institucional (Aulas 1–3)

- [ ] Destacar, nos blocos iniciais, como os projetos extensionistas conectam teoria sistêmica às demandas de comunidades e ecossistemas parceiros.
- [ ] Relacionar atividades de campo e produtos extensionistas aos indicadores de impacto social presentes nas aulas introdutórias.
- [ ] Incluir orientações sobre coleta de evidências extensionistas (`callout.info`) e integração com os registros em Moodle ou AVA.

### Unidade I – Fundamentos e pensamento sistêmico (Aulas 1–3)

- [ ] Reforçar conceitos de sistemas abertos e fechados, fronteiras, entropia, homeostase e equifinalidade, conectando-os aos cenários descritos em `lesson-01.json` e `lesson-02.json`.
- [ ] Inserir exemplos interdisciplinares (biologia, engenharia, administração) para reforçar a visão holística e a evolução da TGS.
- [ ] Atualizar TEDs iniciais para mapear ambientes como sistemas (stakeholders, diagramas IPO, mapas de fluxo de valor) com rubricas claras.

### Unidade II – Modelagem de sistemas e dinâmicas organizacionais (Aulas 4–7)

- [ ] Priorizar diagramas de laços de feedback, análise de subsistemas e modelagem causal aplicadas a estudos de caso brasileiros.
- [ ] Inserir guias para uso de ferramentas digitais (diagrams.net, Miro, Causal Loop Diagram) com foco em relações e dependências.
- [ ] Amarrar o conteúdo das aulas 4–7 às atividades de diagnóstico sistêmico previstas nas experiências extensionistas.

### Unidade III – Sistemas empresariais e integração tecnológica (Aulas 8–15)

- [ ] Enfatizar ERP, CRM, SCM, BPM e plataformas colaborativas como exemplos de sistemas sociotécnicos em `lesson-08.json` a `lesson-15.json`.
- [ ] Documentar estratégias de implantação, governança de dados, interoperabilidade e arquitetura orientada a serviços.
- [ ] Propor exercícios de análise comparativa de soluções corporativas brasileiras (TOTVS, Sankhya, Senior, Linx) com métricas sistêmicas.

### Unidade IV – Planejamento estratégico e governança de sistemas (Aulas 16–23)

- [ ] Relacionar planejamento estratégico, Balanced Scorecard, gestão por portfólio e arquitetura empresarial ao pensamento sistêmico.
- [ ] Incluir checklists para maturidade, gestão de riscos, compliance e indicadores-chave de desempenho sistêmico.
- [ ] Orientar o uso de `callout.warning` para marcos críticos (gate de aprovação, comitês de governança, auditorias).

### Unidade V – Monitoramento, métricas e melhoria contínua (Aulas 24–31)

- [ ] Priorizar dashboards, ciclos de feedback, auditorias e metodologias de melhoria contínua (PDCA, Lean, Six Sigma) sob a ótica sistêmica.
- [ ] Incorporar roteiros de analytics, logs, observabilidade e métricas de desempenho em ambientes distribuídos.
- [ ] Registrar requisitos de laboratório, ferramentas de BI e templates para relatórios de monitoramento.

### Unidade VI – Transformação digital, inovação e responsabilidade socioambiental (Aulas 32–37)

- [ ] Atualizar conteúdos sobre plataformas digitais, ecossistemas, IoT, IA, automação e sistemas adaptativos complexos.
- [ ] Conectar inovação sistêmica a desafios socioambientais, ESG e extensão, propondo planos de intervenção com indicadores de sustentabilidade.
- [ ] Especificar datasets, roteiros de prototipagem e parâmetros de avaliação para atividades investigativas.

### Encerramento do semestre (Aulas 38–40)

- [ ] Planejar revisões integradoras, apresentações de projetos extensionistas, avaliação por competências sistêmicas e autoavaliação.
- [ ] Indicar marcos acadêmicos posteriores, documentação de encerramento e alinhamentos institucionais.

## 3. Recursos recomendados por categoria

- [ ] Atualizar tabela com vídeos, ferramentas, guias e materiais de avaliação específicos de TGS, incluindo referências sobre sistemas abertos, ERP, planejamento estratégico e governança.
- [ ] Verificar acessibilidade dos links e organizar evidências em repositórios compartilhados.

## 4. Próximos passos operacionais

- [ ] Auditar cada `lesson-XX.json`, ajustar `metadata.updatedAt`/`owners` e registrar alterações relevantes.
- [ ] Rodar validações (`npm run validate:content`) e alinhar cronograma de atualização com os stakeholders.
- [ ] Documentar decisões e pendências em `docs/governance/` ou no canal oficial de acompanhamento.

---

> **Status**: rascunho inicial. Atualizar com detalhes específicos de cada aula conforme o time de TGS consolide evidências e recursos.

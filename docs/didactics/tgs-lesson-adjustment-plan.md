# Plano de Ajuste das Aulas de Teoria Geral de Sistemas (TGS)

## 1. Propósito do documento

Este plano organiza os ajustes necessários nas aulas de **Teoria Geral de Sistemas (TGS)** para manter aderência ao plano pedagógico vigente e às diretrizes MD3 utilizadas no repositório. Todas as aulas residem em `src/content/courses/tgs/lessons/lesson-XX.json`, são indexadas por `src/content/courses/tgs/lessons.json` e precisam refletir o encadeamento proposto para Curricularização da Extensão.

- [ ] Consolidar objetivos, competências e resultados esperados em cada `lesson-XX.json`, relacionando-os às experiências extensionistas planejadas.
- [ ] Mapear dependências com outras frentes curriculares (ex.: Extensão, Laboratórios Integradores) e registrar responsáveis pedagógicos.
- [ ] Revisar materiais de apoio e pontos de contato com o professor titular de TGS.

## 2. Diretrizes transversais

1. **Metadados e estrutura mínima** – confirmar em cada `lesson-XX.json` os campos `summary`, `objectives`, `competencies`, `skills`, `outcomes`, `duration`, `modality`, `resources`, `assessment` (quando aplicável) e `metadata.updatedAt`/`metadata.owners`; garantir a sequência mínima por aula definida no plano de aprimoramento (contexto + exemplo aplicado + vídeo + exercício/TED + referências do plano de ensino).
2. **Blocos MD3 completos** – assegurar `lessonPlan` e `flightPlan` detalhados, `callouts` para orientações pré/pós-aula, `cardGrid` para sínteses e uso de componentes específicos (`contentBlock`, `md3Table`, `callout.warning`) sempre que necessário para operacionalizar os ajustes.
3. **Substituir "o professor mostrará"** – revisar cada ocorrência e inserir recursos concretos: link ou anexo em `resources`, descrição do passo a passo em `contentBlock` e, se houver demonstração, checklist de observação ou roteiro dentro do `lessonPlan`.
4. **Exemplos escritos e contextualizados** – incluir parágrafos ou `cardGrid` com casos brasileiros (Magalu, TOTVS, Nubank, SUS Digital, gov.br, etc.) que conectem teoria e prática nas aulas introdutórias e nos conteúdos subsequentes.
5. **TEDs e exercícios padronizados** – transformar instruções vagas em blocos com objetivo, formato de entrega, tempo estimado, rubrica compacta (em `callout.info` ou `md3Table`) e alinhamento com o Moodle (título, link e prazo); quando a avaliação substituir o TED, registrar isso em `assessment`.
6. **Recursos em vídeo com propósito** – cada vídeo deve ter fonte, duração e objetivo pedagógico descritos em `resources`, priorizando materiais curtos (≤10 min) e playlists oficiais.
7. **Ativação de exercícios extras** – atualizar blocos adicionais (`exercises`, `extras`) para `available: true` somente após revisão, incluindo critérios de correção e referência direta ao conteúdo trabalhado em aula.
8. **Integração com Moodle** – replicar a abordagem do plano de ALGI usando `callout.info` para indicar uploads obrigatórios, `callout.warning` para prazos e conduta e links diretos para TEDs, fóruns ou avaliações hospedados no AVA.
9. **Referências bibliográficas prioritárias** – garantir que cada aula cite pelo menos uma das obras-chave de TGS (Bertalanffy, 1973; Stair et al., 2021; Meireles & Sordi, 2019; Batista, 2014; Silva et al., 2019; Palmisano & Rosini, 2012; Audy & Brodbeck, 2008; Imoniana, 2016) nas seções de `resources`/`bibliography`, destacando capítulo ou página relevante.

## 3. Ajustes por unidade temática

### Curricularização da Extensão e integração institucional

- [ ] Evidenciar, nos blocos iniciais das aulas 1–3, como os projetos extensionistas dialogam com os objetivos formativos e com as comunidades atendidas.
- [ ] Conectar atividades de campo e produtos extensionistas às avaliações somativas e às competências sistêmicas (diagnóstico, intervenção, avaliação).

### Unidade I – Fundamentos e pensamento sistêmico (Aulas 1–3)

- [ ] Revisar conceitos de sistemas abertos e fechados, fronteiras, entropia e homeostase, conectando-os a organizações digitais.
- [ ] Incluir exemplos interdisciplinares (biologia, engenharia, administração) para reforçar a visão holística e a origem da TGS.
- [ ] Garantir que TEDs iniciais estimulem a análise de ambientes como sistemas (mapas de stakeholders, diagramas IPO).

### Unidade II – Modelagem de sistemas e dinâmicas organizacionais (Aulas 4–7)

- [ ] Atualizar fluxos operacionais para enfatizar modelagem sistêmica, diagramas de laços de feedback e análise de subsistemas.
- [ ] Inserir estudos de caso sobre integração entre processos de negócio e arquitetura de sistemas.
- [ ] Detalhar guias para uso de ferramentas digitais de modelagem (ex.: diagrams.net, Miro) com foco em relações e dependências.

### Unidade III – Sistemas empresariais e integração tecnológica (Aulas 8–15)

- [ ] Substituir conteúdos de gestão de serviços por ERP, CRM, SCM e plataformas colaborativas como exemplos de sistemas sociotécnicos.
- [ ] Documentar estratégias de implantação, governança de dados e interoperabilidade entre sistemas corporativos.
- [ ] Alinhar exercícios práticos com análises de casos brasileiros de transformação digital e integração de sistemas.

### Unidade IV – Planejamento estratégico e governança de sistemas (Aulas 16–23)

- [ ] Relacionar planejamento estratégico, Balanced Scorecard e gestão por portfólio ao pensamento sistêmico.
- [ ] Incluir checklists para avaliação de maturidade, gestão de riscos e indicadores-chave de desempenho sistêmico.
- [ ] Orientar uso de `callout.warning` para marcos críticos e alinhamento com comitês de governança.

### Unidade V – Monitoramento, métricas e melhoria contínua (Aulas 24–31)

- [ ] Priorizar dashboards, ciclos de feedback, auditorias e metodologias de melhoria contínua (PDCA, Lean, Six Sigma) sob a ótica sistêmica.
- [ ] Incorporar roteiros para uso de analytics, logs e observabilidade em ambientes distribuídos.
- [ ] Registrar necessidades de laboratórios e materiais para experimentação com métricas de desempenho.

### Unidade VI – Transformação digital, inovação e responsabilidade socioambiental (Aulas 32–37)

- [ ] Atualizar conteúdos sobre plataformas digitais, ecossistemas, IoT, IA e automação, destacando impactos em sistemas abertos.
- [ ] Conectar inovação a desafios socioambientais e à extensão, propondo planos de intervenção sistêmica em comunidades parceiras.
- [ ] Especificar datasets, templates de relatório e parâmetros para atividades investigativas e prototipagem.

### Encerramento do semestre (Aulas 38–40)

- [ ] Planejar revisões integradoras, apresentações de projetos extensionistas e avaliações somativas baseadas em competências sistêmicas.
- [ ] Indicar próximos marcos acadêmicos, documentação de encerramento e alinhamentos institucionais.

## 4. Recursos recomendados por categoria

- [ ] Atualizar tabela com vídeos, ferramentas, guias e materiais de avaliação específicos de TGS, incluindo referências sobre sistemas abertos, ERP, planejamento estratégico e governança.
- [ ] Verificar acessibilidade dos links e organizar evidências em repositórios compartilhados.

## 5. Próximos passos operacionais

- [ ] Auditar cada `lesson-XX.json`, ajustar `metadata.updatedAt`/`owners` e registrar alterações relevantes.
- [ ] Rodar validações (`npm run validate:content`) e alinhar cronograma de atualização com os stakeholders.
- [ ] Documentar decisões e pendências em `docs/governance/` ou no canal oficial de acompanhamento.

---

> **Status**: rascunho inicial. Atualizar com detalhes específicos de cada aula conforme o time de TGS consolide evidências e recursos.

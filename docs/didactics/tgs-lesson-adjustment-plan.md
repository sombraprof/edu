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

### 4.1 Vídeos e playlists

| Foco principal                               | Aulas sugeridas | Recurso (fonte)                                                       | Objetivo pedagógico                                                                  |
| -------------------------------------------- | --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Introdução a sistemas e pensamento sistêmico | 1–4             | Vídeo **"O que é sistema?"** (Cengage)                                | Contextualizar conceitos de sistema aberto/fechado com linguagem acessível.          |
| Logística como sistema sociotécnico          | 3–4             | Reportagem Estadão sobre logística integrada                          | Exemplificar interdependência entre tecnologia, processos e stakeholders.            |
| Processos e fluxos organizacionais           | 5–8             | Vídeo **Sebrae** sobre gestão de processos                            | Apoiar revisão de fluxos e homeostase em organizações reais.                         |
| Transformação digital varejista              | 5–12            | Case Magazine Luiza (YouTube)                                         | Demonstrar adaptação sistêmica a mudanças do mercado e integração omnichannel.       |
| Business Intelligence e tomada de decisão    | 9–12            | Webinar TOTVS sobre BI + dashboards públicos Power BI                 | Relacionar níveis decisórios e indicadores com exemplos de dashboards reais.         |
| Integração ERP/CRM/SCM                       | 14–18           | Vídeo **Salesforce Brasil** "Integração ERP + CRM"                    | Visualizar laços de feedback entre frentes comerciais, operacionais e de suporte.    |
| Implantação de ERP no contexto brasileiro    | 19–27           | Entrevista **TOTVS Labs** / Podcast MIT Sloan Review Brasil sobre ERP | Trazer práticas nacionais de governança, dados mestres e mudança organizacional.     |
| Governança de TI e métricas                  | 29–32           | Canal **ITGI Brasil** (playlist COBIT/ITIL)                           | Sustentar discussões sobre papéis, responsabilidades e indicadores de governança.    |
| Balanced Scorecard aplicado                  | 33–35           | Vídeo **Fundação Dom Cabral** sobre BSC                               | Conectar estratégia, indicadores e mapa estratégico a sistemas organizacionais.      |
| Tendências digitais e observabilidade        | 36–39           | Vídeo **Google Cloud** sobre transformação digital                    | Discutir IA, RPA e cloud sob a ótica de monitoramento sistêmico e inovação contínua. |

### 4.2 Ferramentas e ambientes de apoio

- **diagrams.net** e **Miro** – construção colaborativa de diagramas de laços de feedback, mapas de stakeholders e fluxos.
- **Power BI** (dashboards públicos) – análise guiada de indicadores nas unidades III e V, reforçando leitura de métricas sistêmicas.
- **SystemMapper** (componente MD3) – documentação de loops de feedback e dependências entre subsistemas diretamente nos `lesson-XX.json`.
- **Google Forms** ou bloco `quiz` MD3 – avaliações remotas rápidas (ex.: aula 24) com feedback automático.
- **Planilha de auditoria compartilhada** (Google Sheets/Notion) – registro do status de cada aula, links de recursos e pendências pedagógicas.

### 4.3 Guias e referências escritas

- **Guia de estudos Stair et al. (2021)** – capítulos 1, 3, 7 e 12 com páginas indicadas nos `resources` para revisão antes das provas.
- **Relatórios Gartner/FGVcia sobre transformação digital** – base para análises de tendências e discussão de impacto sistêmico nas aulas 36–39.
- **Template de relatório extensionista** – suplemento para orientar produtos de extensão (metodologia, impacto, checklist de entrega).
- **Checklist de implantação ERP/CRM/SCM** – tabela MD3 com critérios de dados, treinamento, governança e indicadores de sucesso.
- **Mapa Estratégico/Balanced Scorecard** – guia visual com objetivos, indicadores, metas e iniciativas para as aulas 33–35.

### 4.4 Avaliação e TEDs

- **Rubricas compactas em `callout.info`** – três níveis (Excelente, Adequado, Revisar) com foco em análise sistêmica, uso de evidências e clareza na comunicação.
- **TED inicial (aulas 1–4)** – mapa de sistema/diagramas IPO com entrega no Moodle; incluir objetivos, tempo estimado (45 min) e critério de integração com stakeholders.
- **TED de estudos de caso (aulas 14–18)** – análise comparativa de ERP/CRM/SCM com tabela de critérios (dados, processos, pessoas, tecnologia).
- **TED observabilidade (aulas 24–31)** – interpretação de dashboards, identificação de alertas e proposição de ajustes; usar `md3Table` para critérios de acurácia, justificativa e plano de ação.
- **Avaliações somativas (NP1/NP3)** – guias de estudo alinhados às referências bibliográficas, prazos e links do Moodle registrados em `assessment` e `callout.warning`.

## 5. Próximos passos operacionais

1. **Auditoria estruturada dos `lesson-XX.json`**
   - Percorrer cada arquivo em `src/content/courses/tgs/lessons/` verificando campos obrigatórios (`summary`, `objectives`, `resources`, `assessment`, etc.).
   - Atualizar `metadata.updatedAt` e `metadata.owners` conforme responsável pela revisão e registrar evidências (links dos vídeos, rubricas, anexos) na planilha compartilhada.
   - Validar se os recursos indicados na Seção 4 estão vinculados às aulas corretas e se os TEDs possuem critérios explícitos.
2. **Validações automatizadas**
   - Executar `npm run validate:content` para garantir conformidade com os schemas MD3 e corrigir eventuais inconsistências sinalizadas.
   - Após ajustes, rodar `npm run report:observability` para consolidar indicadores de cobertura (vídeos por aula, rubricas, extras ativos) e armazenar o relatório em `reports/`.
3. **Atualização de governança e Moodle**
   - Registrar decisões, pendências e entregas em `docs/governance/` (ata semanal, roadmap, calendário) com links para PRs e commits relevantes.
   - Atualizar o AVA/Moodle com novos links de TED, instruções de entrega e rubricas; garantir correspondência com os `callouts` e campos `assessment` dos JSON.
   - Comunicar docentes e monitoria sobre mudanças via canal oficial, anexando o relatório de observabilidade e checklist de revisão.

## 6. Indicadores de acompanhamento e rotinas de revisão

| Indicador                             | Meta                       | Fonte                                     | Frequência de revisão                                       |
| ------------------------------------- | -------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Aulas com vídeo referenciado          | 100% das aulas de conteúdo | `resources` + relatório de auditoria      | Revisão quinzenal com validação via `report:observability`. |
| Aulas com exemplo aplicado            | 100%                       | Checklist da planilha                     | Revisão quinzenal conjunta (pedagogia + conteudistas).      |
| TEDs com critérios claros             | 95%                        | Blocos `callout`/`md3Table` + Moodle      | Checagem a cada sprint (mensal) e após feedback docente.    |
| Exercícios extras ativos              | ≥4                         | `exercises.json` + `report:observability` | Auditoria mensal com registro em ata de governança.         |
| Referências bibliográficas explícitas | ≥2 por unidade             | Revisão manual + relatório de auditoria   | Revisão bimestral alinhada às sessões com a coordenação.    |

> **Rotina de revisão periódica**: apresentar os indicadores no comitê quinzenal de conteúdo, anexando os relatórios dos scripts (`validate:content`, `report:observability`) e a planilha de auditoria. Pendências alimentam o backlog de ajustes, disparando atualizações em governança e no Moodle.

---

> **Status**: rascunho inicial. Atualizar com detalhes específicos de cada aula conforme o time de TGS consolide evidências e recursos.

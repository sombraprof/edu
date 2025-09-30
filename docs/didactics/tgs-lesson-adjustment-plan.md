# Plano de Ajuste das Aulas de Tecnologia e Gestão de Serviços (TGS)

## 1. Propósito do documento

Este plano centraliza os ajustes necessários nas aulas de **Tecnologia e Gestão de Serviços** para garantir aderência ao plano pedagógico vigente e às diretrizes MD3 utilizadas no repositório. Todas as aulas residem em `src/content/courses/tgs/lessons/lesson-XX.json` e são indexadas por `src/content/courses/tgs/lessons.json`.

- [ ] Consolidar objetivos, competências e resultados esperados em cada `lesson-XX.json`.
- [ ] Mapear dependências com outras frentes curriculares e registrar responsáveis pedagógicos.
- [ ] Revisar materiais de apoio e pontos de contato com o professor titular de TGS.

## 2. Diretrizes transversais

1. **Metadados e estrutura mínima** – confirmar em cada `lesson-XX.json` os campos `summary`, `objectives`, `competencies`, `skills`, `outcomes`, `duration`, `modality`, `resources`, `assessment` (quando aplicável) e `metadata.updatedAt`/`metadata.owners`; garantir a sequência mínima por aula definida no plano de aprimoramento (contexto + exemplo aplicado + vídeo + exercício/TED + referências do plano de ensino).
2. **Blocos MD3 completos** – assegurar `lessonPlan` e `flightPlan` detalhados, `callouts` para orientações pré/pós-aula, `cardGrid` para sínteses e uso de componentes específicos (`contentBlock`, `md3Table`, `callout.warning`) sempre que necessário para operacionalizar os ajustes.
3. **Substituir "o professor mostrará"** – revisar cada ocorrência e inserir recursos concretos: link ou anexo em `resources`, descrição do passo a passo em `contentBlock` e, se houver demonstração, checklist de observação ou roteiro dentro do `lessonPlan`.
4. **Exemplos escritos e contextualizados** – incluir parágrafos ou `cardGrid` com casos brasileiros (Magalu, Nubank, SUS Digital, gov.br, etc.) que conectem teoria e prática nas aulas introdutórias e nos conteúdos subsequentes.
5. **TEDs e exercícios padronizados** – transformar instruções vagas em blocos com objetivo, formato de entrega, tempo estimado, rubrica compacta (em `callout.info` ou `md3Table`) e alinhamento com o Moodle (título, link e prazo); quando a avaliação substituir o TED, registrar isso em `assessment`.
6. **Recursos em vídeo com propósito** – cada vídeo deve ter fonte, duração e objetivo pedagógico descritos em `resources`, priorizando materiais curtos (≤10 min) e playlists oficiais.
7. **Ativação de exercícios extras** – atualizar blocos adicionais (`exercises`, `extras`) para `available: true` somente após revisão, incluindo critérios de correção e referência direta ao conteúdo trabalhado em aula.
8. **Integração com Moodle** – replicar a abordagem do plano de ALGI usando `callout.info` para indicar uploads obrigatórios, `callout.warning` para prazos e conduta e links diretos para TEDs, fóruns ou avaliações hospedados no AVA.
9. **Referências bibliográficas prioritárias** – garantir que cada aula cite pelo menos uma das obras-chave de TGS (Stair et al., 2021; Meireles & Sordi, 2019; Batista, 2014; Silva et al., 2019; Palmisano & Rosini, 2012; Audy & Brodbeck, 2008; Imoniana, 2016) nas seções de `resources`/`bibliography`, destacando capítulo ou página relevante.

## 3. Ajustes por unidade temática

### Unidade I – Fundamentos e ambientação (Aulas 1–3)

- [ ] Listar objetivos introdutórios, materiais de ambientação e expectativas para integração aos ambientes digitais.
- [ ] Indicar warm-ups, TEDs e recursos audiovisuais que contextualizem tecnologia aplicada a serviços.

### Unidade II – Processos e ferramentas de apoio (Aulas 4–5)

- [ ] Revisar fluxos operacionais e representar processos com ferramentas MD3 apropriadas.
- [ ] Selecionar estudos de caso e exercícios guiados para integração com os templates oficiais.

### Unidade III – Planejamento e execução de serviços (Aulas 6–11)

- [ ] Mapear transição da teoria para prática, destacando checklists e planilhas de controle.
- [ ] Registrar orientações sobre uso de `resources`, `callouts` e avaliações formativas.

### Unidade IV – Monitoramento, métricas e melhoria contínua (Aulas 12–24)

- [ ] Enumerar ajustes para dashboards, indicadores-chave e rotinas de feedback estruturado.
- [ ] Documentar necessidades de materiais complementares (planilhas, roteiros de laboratório, rubricas).

### Unidade V – Liderança de equipes e relacionamento com clientes (Aulas 25–29)

- [ ] Organizar atividades colaborativas, dinâmicas de role-play e diretrizes de comunicação.
- [ ] Definir critérios de avaliação para projetos modulares e checkpoints intermediários.

### Unidade VI – Inovação em serviços e transformação digital (Aulas 30–37)

- [ ] Relacionar conteúdos sobre ferramentas digitais, automação e análise de dados aplicadas a serviços.
- [ ] Especificar datasets, templates de relatório e parâmetros para atividades de investigação.

### Encerramento do semestre (Aulas 38–40)

- [ ] Planejar revisões finais, apresentações, avaliações somativas e coleta de feedback 360°.
- [ ] Indicar próximos marcos acadêmicos, documentação de encerramento e alinhamentos institucionais.

## 4. Recursos recomendados por categoria

- [ ] Atualizar tabela com vídeos, ferramentas, guias e materiais de avaliação específicos de TGS.
- [ ] Verificar acessibilidade dos links e organizar evidências em repositórios compartilhados.

## 5. Próximos passos operacionais

- [ ] Auditar cada `lesson-XX.json`, ajustar `metadata.updatedAt`/`owners` e registrar alterações relevantes.
- [ ] Rodar validações (`npm run validate:content`) e alinhar cronograma de atualização com os stakeholders.
- [ ] Documentar decisões e pendências em `docs/governance/` ou no canal oficial de acompanhamento.

---

> **Status**: rascunho inicial. Atualizar com detalhes específicos de cada aula conforme o time de TGS consolide evidências e recursos.

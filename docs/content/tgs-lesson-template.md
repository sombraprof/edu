# Template Base de Aula — Teoria Geral de Sistemas (MD3)

Este template descreve a estrutura mínima recomendada para as aulas de Teoria Geral de Sistemas (TGS) no formato `md3.lesson.v1`. Ele consolida os blocos MD3 citados no plano de aprimoramento e oferece exemplos de preenchimento para garantir consistência entre contexto, exemplos aplicados, vídeos, exercícios/TEDs e referências do plano de ensino.

## 1. Metadados essenciais

Sempre iniciar cada arquivo `lesson-XX.json` com os campos obrigatórios do schema:

```json
{
  "id": "lesson-05",
  "title": "Sistemas abertos e homeostase",
  "formatVersion": "md3.lesson.v1",
  "summary": "Explora o conceito de sistemas abertos, mecanismos de homeostase e implicações para organizações brasileiras.",
  "duration": 90,
  "tags": ["TGS", "Sistemas Abertos", "Homeostase"],
  "resources": [],
  "bibliography": [],
  "content": []
}
```

## 2. Estrutura mínima de blocos

A sequência abaixo cobre o fluxo obrigatório (contexto → exemplos → vídeo → exercício/TED → referências). Adapte títulos e descrições mantendo os blocos MD3 indicados.

### 2.1 Contexto introdutório (`contentBlock`)

Use `contentBlock` para apresentar o problema central da aula. Combine com `lessonPlan` ou `flightPlan` quando houver divisão de tempos/etapas.

```json
{
  "type": "contentBlock",
  "title": "Por que revisitar Teoria Geral de Sistemas?",
  "body": "<p>As organizações brasileiras lidam diariamente com fluxos de informação, feedbacks e processos interdependentes. Nesta aula investigamos como a TGS oferece um vocabulário comum para mapear essas interações e antecipar ajustes.</p>"
}
```

**Orientações:**

- Prefira parágrafos curtos com ênfase no "por que" e "para que".
- Mencione desafios reais (ex.: integração gov.br, logística urbana) para conectar teoria ao cotidiano.
- Quando houver agenda detalhada, inclua um bloco `lessonPlan` com etapas e duração:

```json
{
  "type": "lessonPlan",
  "title": "Roteiro da aula",
  "segments": [
    {
      "label": "Aquecimento",
      "duration": 10,
      "description": "Resgate de conceitos sobre sistemas e fronteiras."
    },
    {
      "label": "Estudo guiado",
      "duration": 40,
      "description": "Discussão sobre homeostase com mapa de stakeholders."
    },
    {
      "label": "Exemplo aplicado",
      "duration": 25,
      "description": "Análise do case Magalu com `systemMapper`."
    },
    {
      "label": "TED orientado",
      "duration": 15,
      "description": "Planejamento da entrega no Moodle."
    }
  ]
}
```

### 2.2 Exemplos aplicados (`cardGrid`, `systemMapper` ou `md3Table`)

Utilize `cardGrid` para listar casos curtos, `systemMapper` para loops de feedback ou `md3Table` quando precisar de comparações estruturadas.

```json
{
  "type": "cardGrid",
  "title": "Casos brasileiros",
  "cards": [
    {
      "title": "Magalu — Orquestração omnichannel",
      "body": "<p>Integração entre estoque físico e digital exigindo monitoramento contínuo de KPIs de entrega.</p>"
    },
    {
      "title": "SUS Digital — Fluxos de atendimento",
      "body": "<p>Uso de prontuário eletrônico para alinhar entradas (triagem), processamento (protocolos) e saídas (alta orientada).</p>"
    }
  ]
}
```

Para visualizar relações de entrada-processamento-saída:

```json
{
  "type": "systemMapper",
  "title": "Loop de feedback no e-commerce",
  "layers": [
    {
      "label": "Entradas",
      "items": ["Pedidos via app", "Base de clientes", "Campanhas de marketing"]
    },
    {
      "label": "Processos",
      "items": ["Gestão de estoque", "Análise de satisfação", "Ajustes de preço dinâmico"]
    },
    {
      "label": "Saídas",
      "items": ["Tempo médio de entrega", "Taxa de recompra", "Nível de NPS"]
    }
  ],
  "feedbackLoops": [
    {
      "source": "Saídas",
      "target": "Processos",
      "description": "KPIs alimentam ajustes diários nos processos logísticos."
    }
  ]
}
```

Quando precisar de comparação direta entre cenários, prefira `md3Table`:

```json
{
  "type": "md3Table",
  "title": "Sistemas fechados x abertos",
  "headers": ["Aspecto", "Fechado", "Aberto"],
  "rows": [
    {
      "cells": [
        { "value": "Interação com o ambiente" },
        { "value": "Mínima, pouca troca de recursos" },
        { "value": "Alta, depende de entradas externas" }
      ]
    },
    {
      "cells": [
        { "value": "Feedback" },
        { "value": "Raramente explorado" },
        { "value": "Elemento central para ajustes" }
      ]
    }
  ]
}
```

### 2.3 Vídeo curado (`videosBlock`)

Registrar o vídeo selecionado com objetivo pedagógico, duração e instrução de acompanhamento.

```json
{
  "type": "videosBlock",
  "title": "Vídeo de apoio",
  "videos": [
    {
      "provider": "youtube",
      "videoId": "dQw4w9WgXcQ",
      "title": "Homeostase aplicada a organizações",
      "duration": "06:12",
      "description": "Como empresas brasileiras monitoram indicadores para manter estabilidade em ambientes dinâmicos.",
      "callToAction": "Assista até 4:30 e anote os exemplos de feedback mencionados."
    }
  ]
}
```

### 2.4 Exercício ou TED (`callout` + `checklist`)

Combine um `callout` para explicar objetivos/datas e um `checklist` com critérios de entrega. Utilize `task` para reforçar ações obrigatórias.

```json
{
  "type": "callout",
  "variant": "task",
  "title": "TED 05 — Mapa de feedback",
  "body": "<p>Entregue no Moodle até 22/08, 23h59. Produza um mapa de feedback do sistema escolhido na aula.</p>"
}
```

```json
{
  "type": "checklist",
  "title": "Critérios de avaliação",
  "items": [
    { "label": "Identificou entradas, processos e saídas do sistema", "required": true },
    { "label": "Descreveu pelo menos um loop de feedback com justificativa", "required": true },
    { "label": "Citou referência do Plano de Ensino com página/capítulo", "required": true },
    { "label": "Apontou risco ou limitação do sistema analisado", "required": false }
  ]
}
```

Quando o exercício for debatido em sala, inclua um `knowledgeCheck` ou `discussionPrompt` (quando disponível) para guiar a conversa.

### 2.5 Referências do Plano de Ensino (`contentBlock` + `md3Table`)

Finalize com referências obrigatórias e leituras recomendadas, apontando capítulo/página conforme o Plano de Ensino.

```json
{
  "type": "contentBlock",
  "title": "Referências essenciais",
  "body": "<p>Leitura obrigatória: Stair et al. (2021), cap. 1, p. 12-18. Complementar: Meireles &amp; Sordi (2019), cap. 3.</p>"
}
```

```json
{
  "type": "md3Table",
  "title": "Mapeamento com o Plano de Ensino",
  "headers": ["Elemento", "Fonte", "Onde encontrar"],
  "rows": [
    {
      "cells": [
        { "value": "Conceito de sistema aberto" },
        { "value": "Stair et al. (2021)" },
        { "value": "Cap. 1, p. 12-18" }
      ]
    },
    {
      "cells": [
        { "value": "Loops de feedback" },
        { "value": "Batista (2014)" },
        { "value": "Cap. 2, p. 45-52" }
      ]
    }
  ]
}
```

## 3. Blocos complementares sugeridos

- `glossary`: use quando novos termos técnicos aparecerem.
- `interactiveDemo` ou `caseStudy`: para explorar simulações rápidas ou estudos de caso mais longos.
- `timeline` ou `pipelineCanvas`: úteis ao descrever evolução histórica da TGS ou fluxos multietapas.

## 4. Checklist rápido de revisão

1. Todos os blocos possuem `title` e descrições significativas.
2. Vídeos informam duração, objetivo e chamada para ação.
3. TEDs apresentam prazo, formato e critérios de avaliação (`callout` + `checklist`).
4. Referências citam capítulo/página conforme Plano de Ensino 2025.2.
5. Recursos externos estão listados em `resources` com `label`, `url` e tipo (`video`, `artigo`, `podcast`, etc.).

Seguindo este template, cada aula de TGS permanecerá alinhada às diretrizes do plano de aprimoramento, oferecerá materiais autossuficientes para estudo assíncrono e manterá compatibilidade com os componentes MD3 do repositório.

# Bloco `videoAnnotation`

O bloco `videoAnnotation` combina um player de vídeo (YouTube, Vimeo ou arquivo HTML5) com uma linha do tempo interativa que revela notas, perguntas e checkpoints sincronizados. Ele é renderizado pelo componente [`VideoAnnotation.vue`](../../src/components/lesson/VideoAnnotation.vue) e validado pelo schema `lesson.schema.json`.

## Campos principais

- `title` e `description`: texto opcional exibido acima do player para contextualizar o recurso.
- `video`: objeto obrigatório com o provedor (`provider`) e os dados de origem.
  - `provider`: `'youtube'`, `'vimeo'` ou `'html5'`.
  - Para HTML5 use `src`, `type` (MIME) e, opcionalmente, `poster` e faixas de legenda (`captions`).
  - Para YouTube/Vimeo forneça `videoId` ou `url` público. O renderer gera automaticamente a URL de embed.
- `annotations`: lista ordenada de marcadores com `label` e `time` (segundos).
  - `type: "note"` mostra o conteúdo HTML sanitizado em `body`.
  - `type: "question"` exige `question` com `prompt`, `options[].{id,text}` e, opcionalmente, `explanation` e `multiple`.
- `checkpoints`: pontos de parada recomendados para mediação. Cada item aceita `description` para instruções ao professor.

## Exemplo de uso

```json
{
  "type": "videoAnnotation",
  "title": "Tour guiado pelo sistema",
  "description": "Revise o fluxo antes da prática supervisionada.",
  "video": {
    "provider": "html5",
    "src": "https://cdn.example.com/lessons/lesson-04.mp4",
    "type": "video/mp4",
    "poster": "https://cdn.example.com/lessons/lesson-04.jpg",
    "captions": [
      {
        "src": "https://cdn.example.com/lessons/lesson-04.vtt",
        "label": "Português",
        "srclang": "pt"
      }
    ]
  },
  "annotations": [
    {
      "id": "introducao",
      "label": "Introdução",
      "time": 12,
      "type": "note",
      "body": "<p>Destaque o problema que o vídeo resolve.</p>"
    },
    {
      "id": "pergunta-api",
      "label": "Checkpoint de API",
      "time": 135,
      "type": "question",
      "question": {
        "prompt": "Qual método HTTP é utilizado para criar registros?",
        "options": [
          { "id": "opt1", "text": "GET" },
          { "id": "opt2", "text": "POST", "correct": true }
        ],
        "explanation": "As operações de criação utilizam POST."
      }
    }
  ],
  "checkpoints": [
    {
      "id": "checkpoint-1",
      "label": "Discuta logs com a turma",
      "time": 180,
      "description": "Peça para os estudantes compartilharem observações antes de prosseguir."
    }
  ]
}
```

## Boas práticas

1. **Organize a linha do tempo** em ordem cronológica; o renderer ordena automaticamente, mas manter a sequência no JSON facilita revisões.
2. **Limite o número de perguntas** a pontos estratégicos. Explique o porquê na propriedade `explanation` para feedback imediato.
3. **Checkpoints funcionam como pausas**: use descrições para orientar a mediação (perguntas disparadoras, tempo sugerido, etc.).
4. **Combine com `captions`** para acessibilidade. Legendas são aceitas apenas para vídeos HTML5 hospedados pela instituição.
5. **URLs externas** (YouTube/Vimeo) devem ser públicas ou não listadas para garantir o carregamento em iFrames.

> Valide o conteúdo com `npm run validate:content` após editar o JSON da aula para garantir conformidade com o schema atualizado.

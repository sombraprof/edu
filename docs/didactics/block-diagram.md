# BlockDiagram (próximo)

O antigo componente de diagrama de blocos foi removido junto com a pasta `src/components/didactics`. Esta nota define os requisitos para a nova implementação MD3.

## Objetivos

- **Layout fluido**: grid responsivo com tokens de espaçamento, evitando coordenadas absolutas e overflow em telas menores.
- **Conectores semântico-visuais**: geração de ligações usando camadas utilitárias (ex.: `elkjs`) ou algoritmos próprios com feedback visual consistente.
- **Acessibilidade**: suporte a navegação por teclado, descrições textuais das relações e estados focáveis.

## Próximos passos

1. Definir schema declarativo (`blocks`, `channels`, `links`) semelhante ao `Md3Flowchart`.
2. Mapear cenários pedagógicos (arquitetura de software, pipelines de dados) para validar o layout.
3. Publicar stories e testes de snapshot após o desenvolvimento inicial.

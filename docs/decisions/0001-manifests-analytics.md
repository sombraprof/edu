# ADR 0001: Versionamento de manifestos e métricas analíticas

## Contexto

Os manifestos `lessons.json`, `exercises.json` e `supplements.json` eram arrays simples, o que dificultava o controle de versão dos índices de conteúdo e impedia anexar metadados temporais. Além disso, os relatórios de observabilidade (`report:observability`) e de governança (`report:governance`) forneciam apenas instantâneos pontuais, sem diffs percentuais nem séries temporais capazes de alimentar painéis ou análises contínuas.

## Decisão

1. **Manifestos versionados**: adotar a estrutura `edu.manifest.v1`, transformando os arquivos em objetos com `version`, `generatedAt` e `entries`. Scripts de validação e geração foram atualizados para ler, validar e persistir esse formato.
2. **Históricos e sparklines**: estender os relatórios de observabilidade e governança para manter históricos normalizados (`content-observability-history.json`, `governance-history.json`) e novos artefatos analíticos (`*-trends.json`) contendo séries temporais e sparklines ASCII dos principais indicadores.
3. **Percentuais e deltas**: calcular e exibir diferenças absolutas e percentuais entre execuções consecutivas, tanto nos logs de console quanto no markdown publicado pela pipeline de governança.
4. **Governança pronta para consumo externo**: anexar sparklines e percentuais ao JSON de metadados (`governance-alert.json`) e ao novo arquivo de tendências, permitindo integração com dashboards ou notificações automatizadas.

## Consequências

- Os manifestos passam a carregar um carimbo de geração e um esquema explícito, simplificando auditorias e futuras migrações.
- A validação de conteúdo agora falha caso os manifestos não estejam na versão `edu.manifest.v1`, garantindo consistência.
- As equipes de produto e conteúdo podem acompanhar a evolução de blocos legados, problemas de validação e cobertura de metadados ao longo do tempo, inclusive via sparklines em markdown ou consumo direto das séries JSON.
- A pipeline do GitHub Actions publica artefatos adicionais e executa Chromatic para regressão visual, reforçando a governança do acervo MD3.

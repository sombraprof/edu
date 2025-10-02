import { promises as fs } from 'fs';
import path from 'path';

const baseDir = path.resolve('src/content/courses/algi/lessons');

const updates = {
  'lesson-01': {
    competencies: ['02', '05', '11'],
    skills: [
      'Identificar estruturas lógicas presentes em problemas cotidianos e classificá-las como condição, sequência ou repetição.',
      'Descrever passo a passo um algoritmo simples utilizando o ciclo entrada → processamento → saída.',
      'Comunicar expectativas da disciplina, critérios de avaliação e canais de apoio em linguagem objetiva.',
    ],
    outcomes: [
      'Entrega quadro comparativo mapeando pelo menos três situações reais para estruturas lógicas básicas.',
      'Produz algoritmo inicial com entradas, processamento e saídas validadas em dupla com o professor.',
      'Apresenta resumo oral ou escrito explicitando cronograma, instrumentos avaliativos e recursos oferecidos na disciplina.',
    ],
  },
  'lesson-02': {
    competencies: ['02', '05', '11'],
    skills: [
      'Classificar operadores lógicos (E, OU, NÃO) conforme o tipo de decisão exigida pelo problema.',
      'Produzir tabelas-verdade completas que comprovem o comportamento de expressões booleanas.',
      'Documentar em pseudocódigo um algoritmo que combine condições compostas com justificativas de cada ramo.',
    ],
    outcomes: [
      'Apresenta quadro de decomposição destacando decisões, operadores escolhidos e alternativas descartadas.',
      'Resolve ao menos três expressões booleanas verificando resultados com tabelas-verdade anotadas.',
      'Publica pseudocódigo revisado em dupla com comentários que explicam o efeito de cada condição lógica.',
    ],
  },
  'lesson-03': {
    competencies: ['02', '05', '12'],
    skills: [
      'Sequenciar instruções em blocos de entrada, processamento e saída mantendo nomes padronizados.',
      'Comparar versões de algoritmos em dinâmicas colaborativas e apontar lacunas ou redundâncias.',
      'Reescrever pseudocódigo incorporando feedback registrado em checklist coletivo.',
    ],
    outcomes: [
      'Entrega algoritmo estruturado com rótulos de blocos e justificativa para a ordem escolhida.',
      'Registra no mural da turma os pontos fortes e ajustes sugeridos para o algoritmo de outra dupla.',
      'Disponibiliza versão revisada destacando trechos alterados após a rodada de feedback.',
    ],
  },
  'lesson-04': {
    competencies: ['05', '08', '11'],
    skills: [
      'Traduzir instruções escritas em Portugol para blocos equivalentes em C garantindo correspondência de variáveis.',
      'Configurar projeto no compilador, compilar e interpretar mensagens de erro para ajustar o código.',
      'Documentar evidências de testes iniciais registrando entradas utilizadas e resultados esperados.',
    ],
    outcomes: [
      'Entrega tabela comparativa destacando trecho em Portugol e versão final em C sem divergências semânticas.',
      'Compila programa no laboratório sem erros e relata as correções aplicadas para eliminar warnings.',
      'Anexa registro de execução com ao menos três cenários testados e respectivas saídas.',
    ],
  },
  'lesson-05': {
    competencies: ['02', '11', '12'],
    skills: [
      'Selecionar símbolos de fluxo adequados para início, decisões, processamento e término.',
      'Alinhar fluxogramas ao pseudocódigo correspondente destacando equivalências entre blocos.',
      'Conduzir revisão em dupla verificando legibilidade, setas e descrições dos caminhos alternativos.',
    ],
    outcomes: [
      'Produz fluxograma completo com legenda de símbolos e validação feita pelo colega.',
      'Apresenta checklist assinado confirmando correspondência entre fluxograma e algoritmo textual.',
      'Registra ajustes realizados após a revisão cruzada em comentário ou nota compartilhada.',
    ],
  },
  'lesson-06': {
    competencies: ['05', '08', '11'],
    skills: [
      'Declarar variáveis, constantes e tipos coerentes com os dados fornecidos pelo problema.',
      'Validar leituras e escritas utilizando scanf e printf com especificadores compatíveis.',
      'Registrar tabela de testes contendo valores válidos, inválidos e limites para cada variável.',
    ],
    outcomes: [
      'Entrega código comentado que evidencia a escolha de tipos e o uso de constantes nominais.',
      'Demonstra execução correta do programa para dados válidos e sinaliza tratamento de entradas incorretas.',
      'Compartilha planilha ou quadro de testes com resultados observados e ajustes aplicados.',
    ],
  },
  'lesson-07': {
    competencies: ['02', '05', '08'],
    skills: [
      'Organizar expressões utilizando precedência e parênteses para garantir clareza lógica.',
      'Simular avaliações de expressões passo a passo verificando efeitos de operadores relacionais e lógicos.',
      'Criar casos de teste que comprovem limites e exceções dos cálculos implementados.',
    ],
    outcomes: [
      'Entrega quadro com expressões reescritas e justificativas para o posicionamento de parênteses.',
      'Apresenta tabela de rastreamento com valores intermediários e resultado final de cada expressão.',
      'Disponibiliza conjunto de testes documentados cobrindo entradas típicas, limites e valores inválidos.',
    ],
  },
  'lesson-08': {
    competencies: ['05', '08', '11'],
    skills: [
      'Encadear leituras com scanf garantindo o uso correto de endereços e especificadores.',
      'Organizar variáveis intermediárias para cálculos encadeados mantendo nomes significativos.',
      'Formatar saídas com printf destacando resultados, unidades e mensagens interpretáveis.',
    ],
    outcomes: [
      'Entrega programa que registra ao menos três leituras, cálculos associados e recibo formatado.',
      'Documenta tabela relacionando cada variável a seu papel no fluxo entrada → processamento → saída.',
      'Apresenta vídeo curto ou relatório textual explicando como validar dados extremos e ajustar mensagens.',
    ],
  },
  'lesson-09': {
    competencies: ['05', '08', '11'],
    skills: [
      'Modelar problemas sequenciais identificando dados de entrada, fórmulas e mensagens de saída.',
      'Implementar algoritmos encadeados em C validando cálculos com amostras reais.',
      'Comunicar resultados em formato de relatório destacando interpretações relevantes.',
    ],
    outcomes: [
      'Entrega solução funcional para estudo de caso proposto com comentários que justificam cada etapa.',
      'Compartilha registro de testes comparando resultados esperados e obtidos para diferentes cenários.',
      'Publica síntese escrita que explica impactos dos números calculados para o contexto do problema.',
    ],
  },
  'lesson-10': {
    competencies: ['02', '05', '11'],
    skills: [
      'Identificar pontos de decisão que exigem uso de estruturas if e else.',
      'Codificar blocos condicionais com mensagens claras para cada caminho.',
      'Explicar verbalmente ou por escrito o fluxo completo do algoritmo destacando estados finais.',
    ],
    outcomes: [
      'Apresenta diagrama ou tabela que mapeia condições para ações correspondentes.',
      'Entrega código revisado que trata casos verdadeiro e falso com mensagens específicas.',
      'Realiza apresentação curta explicando como o programa responde a pelo menos três entradas diferentes.',
    ],
  },
  'lesson-11': {
    competencies: ['02', '05', '11'],
    skills: [
      'Mapear cenários que justificam uso de switch-case em vez de cadeias de if.',
      'Implementar seleção múltipla com rótulos, blocos bem indentados e cláusula default coerente.',
      'Documentar tabela relacionando opções do menu a ações realizadas pelo programa.',
    ],
    outcomes: [
      'Apresenta fluxograma ou mapa de decisão que evidencia agrupamentos tratados pelo switch-case.',
      'Entrega código funcional com pelo menos quatro casos, incluindo default explicativo.',
      'Disponibiliza tabela de apoio distribuída à turma listando comandos de cada opção implementada.',
    ],
  },
  'lesson-12': {
    competencies: ['02', '05', '11'],
    skills: [
      'Priorizar condições em cadeias else if para garantir cobertura sem sobreposições.',
      'Representar regras compostas por meio de árvores de decisão ou mapas lógicos.',
      'Justificar por escrito o posicionamento de cada condição e suas implicações.',
    ],
    outcomes: [
      'Entrega algoritmo que trata ao menos cinco faixas exclusivas com mensagens específicas.',
      'Apresenta diagrama anotado validando que cada entrada é coberta por apenas um ramo.',
      'Registra texto curto explicando ajustes realizados após testar limites das condições.',
    ],
  },
  'lesson-13': {
    competencies: ['02', '05', '08'],
    skills: [
      'Traduzir requisitos complexos em expressões booleanas utilizando operadores compostos.',
      'Executar testes de mesa para detectar lacunas ou sobreposições em cadeias de decisão.',
      'Refatorar condições com curto-circuito visando clareza e desempenho.',
    ],
    outcomes: [
      'Disponibiliza conjunto de casos de teste que evidenciam cobertura completa do problema.',
      'Entrega código revisado com operadores lógicos apropriados e comentários sobre riscos mitigados.',
      'Apresenta relatório comparando a versão inicial e a refatorada, destacando ganhos observados.',
    ],
  },
  'lesson-14': {
    competencies: ['02', '05', '08'],
    skills: [
      'Organizar tempo e recursos para executar avaliação escrita com foco em lógica e condicionais.',
      'Aplicar estratégias de revisão rápida para validar respostas antes da entrega.',
      'Registrar justificativas concisas que evidenciem raciocínio em cada questão.',
    ],
    outcomes: [
      'Entrega prova preenchida dentro do tempo previsto com todas as questões respondidas.',
      'Revisa itens críticos destacando conferência de fluxogramas, tabelas e códigos escritos.',
      'Anota observações pós-prova apontando pontos fortes e tópicos para revisão.',
    ],
  },
  'lesson-15': {
    competencies: ['05', '08', '11'],
    skills: [
      'Analisar devolutivas da NP1 identificando padrões de erro por tema.',
      'Refatorar respostas e códigos corrigindo falhas lógicas e de comunicação.',
      'Explicar planos de melhoria em apresentação breve para a turma.',
    ],
    outcomes: [
      'Entrega planilha com classificação dos erros cometidos e prioridade de revisão.',
      'Disponibiliza versão corrigida dos exercícios com comentários sobre ajustes implementados.',
      'Realiza pitch de até cinco minutos destacando aprendizados e próximos passos de estudo.',
    ],
  },
  'lesson-16': {
    competencies: ['05', '08', '12'],
    skills: [
      'Planejar lógica de triagem documentando critérios e mensagens de orientação.',
      'Executar bateria de testes registrando evidências e capturas de tela ou logs.',
      'Organizar repositório compartilhado com checklist de entrega e pontos de melhoria colaborativa.',
    ],
    outcomes: [
      'Submete protótipo funcional com documentação de critérios clínicos e fluxos implementados.',
      'Anexa planilha de testes com resultados, screenshots e observações para cada cenário.',
      'Coordena revisão por pares registrando feedback trocado e ajustes planejados.',
    ],
  },
  'lesson-17': {
    competencies: ['05', '08', '11'],
    skills: [
      'Definir invariantes e condições de parada adequadas para laços while.',
      'Implementar sentinelas e validação de entrada garantindo que o loop encerre corretamente.',
      'Documentar rastreamento de variáveis a cada iteração para explicar o comportamento do algoritmo.',
    ],
    outcomes: [
      'Entrega código com while e sentinela documentados, acompanhado de comentários sobre invariantes.',
      'Demonstra execução controlada com dados válidos e inválidos registrando comportamento esperado.',
      'Produz tabela de rastreamento que evidencia atualização de variáveis a cada ciclo.',
    ],
  },
  'lesson-18': {
    competencies: ['05', '08', '11'],
    skills: [
      'Configurar laços for detalhando inicialização, condição e atualização.',
      'Comparar abordagens for e while justificando escolha em função do problema.',
      'Produzir documentação curta com exemplos de uso e testes realizados.',
    ],
    outcomes: [
      'Apresenta programa funcional com pelo menos dois laços for em cenários distintos.',
      'Disponibiliza relatório comparativo entre soluções for e while destacando métricas coletadas.',
      'Entrega registro de testes indicando entradas, saídas e observações para melhorias futuras.',
    ],
  },
  'lesson-19': {
    competencies: ['02', '05', '08'],
    skills: [
      'Avaliar requisitos para decidir entre laços for e while considerando clareza e manutenção.',
      'Refatorar algoritmos convertendo entre estruturas sem alterar resultado final.',
      'Medir impactos da refatoração registrando desempenho, legibilidade e riscos.',
    ],
    outcomes: [
      'Produz tabela comparativa que relaciona critérios do problema ao laço selecionado.',
      'Entrega versões equivalentes em for e while confirmando saídas idênticas.',
      'Anexa relatório com testes de limites, métricas de tempo e análise de riscos mitigados.',
    ],
  },
  'lesson-20': {
    competencies: ['05', '08', '11'],
    skills: [
      'Modelar menus que exigem execução inicial obrigatória utilizando do-while.',
      'Implementar validação de opções garantindo repetição até entrada aceitável.',
      'Justificar escolha do do-while em comparação com outras estruturas de repetição.',
    ],
    outcomes: [
      'Entrega menu funcional que registra ação inicial e controle de saída com clareza.',
      'Documenta testes que comprovam rejeição de entradas inválidas e repetição do menu.',
      'Produz texto curto explicando critérios adotados para escolher o do-while.',
    ],
  },
  'lesson-21': {
    competencies: ['05', '08', '12'],
    skills: [
      'Planejar laços aninhados definindo variáveis de controle e limites para cada nível.',
      'Executar testes que comprovem preenchimento correto de estruturas bidimensionais.',
      'Coordenar revisão entre pares utilizando tabelas de rastreamento para localizar gargalos.',
    ],
    outcomes: [
      'Entrega solução que gera tabela 2D coerente com as regras fornecidas.',
      'Anexa matriz de testes validando comportamentos com dados típicos e extremos.',
      'Registra feedback recebido na revisão colaborativa e ajustes aplicados no código.',
    ],
  },
  'lesson-22': {
    competencies: ['02', '05', '08'],
    skills: [
      'Combinar condicionais e laços para construir fluxos completos de processamento.',
      'Monitorar estados intermediários usando logs ou tabelas de acompanhamento.',
      'Comparar soluções alternativas avaliando clareza e esforço de manutenção.',
    ],
    outcomes: [
      'Entrega protótipo que integra decisões e repetições com resultados consistentes.',
      'Apresenta tabela de estados registrando variáveis críticas ao longo da execução.',
      'Disponibiliza análise escrita justificando a arquitetura final escolhida.',
    ],
  },
  'lesson-23': {
    competencies: ['05', '08', '12'],
    skills: [
      'Documentar passo a passo a atividade assíncrona, incluindo critérios de avaliação.',
      'Executar testes clínicos simulados registrando evidências compartilháveis.',
      'Organizar feedback entre squads sincronizando correções e entregas finais.',
    ],
    outcomes: [
      'Publica guia de entrega com instruções, critérios e prazos acordados.',
      'Anexa pacote de evidências com logs, capturas e resultados de cada cenário simulado.',
      'Coordena sessão de retrospectiva registrando decisões e encaminhamentos do grupo.',
    ],
  },
  'lesson-24': {
    competencies: ['08', '11', '12'],
    skills: [
      'Consolidar métricas e evidências coletadas nas atividades de laços.',
      'Facilitar retrospectiva identificando conquistas, riscos e melhorias.',
      'Comunicar plano de continuidade distribuindo responsabilidades entre os times.',
    ],
    outcomes: [
      'Entrega relatório síntese com indicadores de qualidade e aprendizados da unidade.',
      'Conduz reunião de retrospectiva produzindo ata com itens de ação priorizados.',
      'Apresenta roadmap compartilhado com responsáveis, prazos e recursos necessários.',
    ],
  },
  'lesson-25': {
    competencies: ['05', '08', '11'],
    skills: [
      'Identificar oportunidades de modularização em programas sequenciais.',
      'Desenhar protótipos de funções definindo assinaturas, parâmetros e retorno.',
      'Registrar pré e pós-condições que orientem o uso correto de cada função.',
    ],
    outcomes: [
      'Entrega roteiro que aponta blocos candidatos à extração em funções.',
      'Disponibiliza protótipo documentado em arquivo header ou anotações estruturadas.',
      'Apresenta quadro de pré/pós-condições validado com exemplos práticos.',
    ],
  },
  'lesson-26': {
    competencies: ['05', '08', '11'],
    skills: [
      'Implementar funções com parâmetros por valor e por referência conforme necessidade.',
      'Construir casos de teste que validem contratos de entrada e saída.',
      'Documentar brevemente cada função explicando propósito e efeitos colaterais.',
    ],
    outcomes: [
      'Entrega código com funções parametrizadas e comentários sobre uso de ponteiros.',
      'Anexa suíte de testes cobrindo cenários positivos, negativos e limites.',
      'Registra documentação resumida disponível para colegas reutilizarem as funções.',
    ],
  },
  'lesson-27': {
    competencies: ['05', '08', '12'],
    skills: [
      'Estruturar projeto modular com separação entre arquivos fonte e cabeçalhos.',
      'Configurar fluxo de compilação incremental verificando dependências.',
      'Orquestrar revisão cruzada garantindo que cada módulo siga padrões definidos.',
    ],
    outcomes: [
      'Entrega projeto com múltiplos arquivos e build script funcionando.',
      'Documenta pipeline de compilação destacando passos e ferramentas utilizadas.',
      'Registra atas de revisão compartilhadas com responsáveis por cada módulo.',
    ],
  },
  'lesson-28': {
    competencies: ['05', '08', '12'],
    skills: [
      'Aplicar padrões de escrita e nomenclatura que favoreçam manutenção.',
      'Executar checklist de revisão identificando dívidas técnicas e riscos.',
      'Planejar ações de melhoria contínua distribuindo tarefas entre os membros da equipe.',
    ],
    outcomes: [
      'Apresenta relatório de revisão com itens conformes e não conformes registrados.',
      'Entrega código atualizado com correções priorizadas durante a sessão de pair review.',
      'Compartilha plano de manutenção com responsáveis, prazos e métricas de acompanhamento.',
    ],
  },
  'lesson-29': {
    competencies: ['05', '08', '11'],
    skills: [
      'Gerenciar tempo de avaliação aplicando estratégias para problemas longos.',
      'Resolver questões integrando condicionais, laços e modularização.',
      'Documentar raciocínio das respostas justificando escolhas algorítmicas.',
    ],
    outcomes: [
      'Entrega avaliação NP2 completa dentro do tempo estipulado.',
      'Registra checagem final garantindo que cada programa atende aos requisitos informados.',
      'Anota lições aprendidas e tópicos para estudo complementar após a prova.',
    ],
  },
  'lesson-30': {
    competencies: ['05', '08', '11'],
    skills: [
      'Declarar vetores dimensionando corretamente e inicializando com dados de teste.',
      'Implementar percursos que calculem estatísticas básicas validando limites de índice.',
      'Comunicar resultados obtidos destacando interpretações para o contexto analisado.',
    ],
    outcomes: [
      'Entrega código que lê dados em vetor, calcula métricas e apresenta relatório formatado.',
      'Apresenta tabela de testes comprovando acesso seguro aos elementos do vetor.',
      'Publica síntese que explica decisões tomadas e resultados alcançados com os dados coletados.',
    ],
  },
  'lesson-31': {
    competencies: ['05', '08', '11'],
    skills: [
      'Projetar transformações sobre vetores utilizando acumuladores e normalizações.',
      'Validar resultados comparando totais, médias e discrepâncias detectadas.',
      'Registrar experimentos realizados descrevendo parâmetros e impactos observados.',
    ],
    outcomes: [
      'Disponibiliza script que gera tabela derivada do vetor original com indicadores calculados.',
      'Entrega planilha de verificação comprovando consistência dos resultados obtidos.',
      'Documenta relatório curto explicando como ajustes no algoritmo afetaram os indicadores.',
    ],
  },
  'lesson-32': {
    competencies: ['05', '08', '11'],
    skills: [
      'Implementar funções de busca linear com e sem sentinela.',
      'Medir quantidade de comparações executadas em diferentes cenários.',
      'Documentar recomendações de uso destacando limites e vantagens de cada variação.',
    ],
    outcomes: [
      'Entrega biblioteca com funções de busca retornando índices corretos ou -1.',
      'Anexa relatório com gráficos ou tabelas que mostram o número de comparações por caso.',
      'Publica nota técnica explicando quando utilizar sentinela e implicações para desempenho.',
    ],
  },
  'lesson-33': {
    competencies: ['05', '08', '11'],
    skills: [
      'Mapear dados tabulares para estruturas de matrizes em C.',
      'Construir laços aninhados que preencham e apresentem tabelas formatadas.',
      'Explicar resultados obtidos conectando-os ao problema de negócio proposto.',
    ],
    outcomes: [
      'Entrega programa que gera matriz 2D com cabeçalhos e alinhamento adequado.',
      'Registra checklist de validação garantindo preenchimento correto por linha e coluna.',
      'Realiza apresentação breve relacionando a tabela gerada com decisões possíveis no cenário estudado.',
    ],
  },
  'lesson-34': {
    competencies: ['05', '08', '11'],
    skills: [
      'Implementar transposição, somas e multiplicação de matrizes controlando dimensões.',
      'Testar compatibilidade entre matrizes antes de executar operações.',
      'Comparar desempenho e precisão das operações realizadas em cenários distintos.',
    ],
    outcomes: [
      'Disponibiliza funções que executam operações matriciais retornando resultados corretos.',
      'Entrega conjunto de testes automatizados ou planilhas que validam dimensões e saídas.',
      'Documenta análise descrevendo tempo de execução e limitações observadas.',
    ],
  },
  'lesson-35': {
    competencies: ['05', '08', '11'],
    skills: [
      'Definir structs representando registros compostos com campos coerentes.',
      'Implementar operações CRUD em memória validando entrada e saída de dados.',
      'Registrar casos de teste que comprovem a integridade do fluxo de operações.',
    ],
    outcomes: [
      'Entrega módulo com definição de struct e funções para criar, ler, atualizar e remover registros.',
      'Anexa log de testes cobrindo operações bem-sucedidas e tratamento de erros.',
      'Apresenta documentação resumida orientando como utilizar o CRUD implementado.',
    ],
  },
  'lesson-36': {
    competencies: ['05', '08', '12'],
    skills: [
      'Organizar vetores de structs definindo estratégias de inserção e busca.',
      'Garantir consistência dos dados ao realizar atualizações em lote.',
      'Conduzir revisão em pares verificando aderência a padrões de dados da turma.',
    ],
    outcomes: [
      'Entrega repositório em memória com operações de listagem e inserção validadas.',
      'Registra testes que comprovam manutenção da integridade após múltiplas atualizações.',
      'Documenta feedback trocado com o par e ajustes implementados na estrutura de dados.',
    ],
  },
  'lesson-37': {
    competencies: ['05', '08', '12'],
    skills: [
      'Implementar buscas flexíveis em vetores de structs utilizando filtros variados.',
      'Aplicar auditoria registrando histórico de alterações e validações.',
      'Facilitar revisão coletiva alinhando critérios de atualização e rollback.',
    ],
    outcomes: [
      'Disponibiliza módulo que localiza e atualiza registros com base em múltiplos campos.',
      'Entrega log de auditoria descrevendo cada alteração realizada e testes associados.',
      'Coordena reunião de alinhamento documentando decisões sobre políticas de atualização.',
    ],
  },
  'lesson-38': {
    competencies: ['05', '11', '12'],
    skills: [
      'Preparar desafios que revisem conteúdos do semestre em formato gamificado.',
      'Compartilhar explicações rápidas das soluções adotadas pela equipe.',
      'Colaborar na facilitação da dinâmica registrando pontuações e feedbacks.',
    ],
    outcomes: [
      'Entrega quiz ou jogo com questões alinhadas às competências trabalhadas.',
      'Realiza apresentação de insights destacando estratégias usadas pela equipe para resolver desafios.',
      'Consolida feedback do grupo em ata compartilhada com próximos passos de estudo.',
    ],
  },
  'lesson-39': {
    competencies: ['05', '08', '11'],
    skills: [
      'Integrar conteúdos de lógica, estruturas e modularização em avaliação final.',
      'Aplicar verificação sistemática das respostas durante a NP3.',
      'Registrar justificativas técnicas para cada solução implementada.',
    ],
    outcomes: [
      'Entrega avaliação NP3 completa demonstrando domínio dos tópicos do semestre.',
      'Executa checklist de conferência antes da entrega garantindo cobertura dos requisitos.',
      'Produz relatório pós-prova destacando raciocínios utilizados e temas a reforçar.',
    ],
  },
  'lesson-40': {
    competencies: ['05', '11', '12'],
    skills: [
      'Sistematizar aprendizados do semestre conectando-os a trilhas futuras de estudo.',
      'Comunicar devolutivas finais e orientações personalizadas aos colegas.',
      'Planejar ações coletivas de continuidade envolvendo estudos e projetos complementares.',
    ],
    outcomes: [
      'Apresenta painel síntese com recomendações de recursos e próximos conteúdos a explorar.',
      'Registra devolutivas individuais ou em grupo destacando conquistas e desafios.',
      'Co-constrói plano coletivo de desenvolvimento com responsáveis e marcos definidos.',
    ],
  },
};

async function main() {
  await Promise.all(
    Object.entries(updates).map(async ([lessonId, data]) => {
      const filePath = path.join(baseDir, `${lessonId}.json`);
      const raw = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(raw);
      json.competencies = data.competencies;
      json.skills = data.skills;
      json.outcomes = data.outcomes;
      await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n');
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

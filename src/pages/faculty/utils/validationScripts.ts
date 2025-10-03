export const validationScriptOrder = ['content', 'report', 'observability', 'governance'] as const;

export type ValidationScriptKey = (typeof validationScriptOrder)[number];

export type ValidationReportKey = 'validation' | 'observability' | 'governance';

export interface ValidationScriptDefinition {
  key: ValidationScriptKey;
  title: string;
  command: string;
  description: string;
  hint: string;
  placeholder: string;
  reportKey?: ValidationReportKey;
}

export const validationScripts: Record<ValidationScriptKey, ValidationScriptDefinition> = {
  content: {
    key: 'content',
    title: 'Validação de conteúdo',
    command: 'npm run validate:content',
    description: 'Confere schemas de aulas, exercícios e suplementos antes do commit.',
    hint: 'Executa as validações estruturais obrigatórias e indica problemas bloqueantes.',
    placeholder: 'Cole aqui a saída completa do comando npm run validate:content.',
  },
  report: {
    key: 'report',
    title: 'Relatório de validação',
    command: 'npm run validate:report',
    description: 'Gera o JSON consolidado com problemas, avisos e metadados por curso.',
    hint: 'Produz reports/content-validation-report.json e arquivos auxiliares no diretório reports/.',
    placeholder: 'Cole aqui a saída completa do comando npm run validate:report.',
    reportKey: 'validation',
  },
  observability: {
    key: 'observability',
    title: 'Observabilidade de conteúdo',
    command: 'npm run report:observability:check',
    description: 'Compara blocos legados vs. MD3 e sinaliza lacunas de disponibilidade.',
    hint: 'Atualiza reports/content-observability.json com métricas agregadas por disciplina.',
    placeholder: 'Cole aqui a saída completa do comando npm run report:observability:check.',
    reportKey: 'observability',
  },
  governance: {
    key: 'governance',
    title: 'Alerta de governança',
    command: 'npm run report:governance',
    description:
      'Resume pendências críticas para publicação (validação, observabilidade, metadados).',
    hint: 'Atualiza reports/governance-alert.json e outputs derivados (MD/JSON).',
    placeholder: 'Cole aqui a saída completa do comando npm run report:governance.',
    reportKey: 'governance',
  },
};

export const validationScriptsList = validationScriptOrder.map((key) => validationScripts[key]);

export function getValidationScript(key: ValidationScriptKey) {
  return validationScripts[key];
}

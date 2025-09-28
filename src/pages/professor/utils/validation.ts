import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

export interface FormattedAjvError {
  message: string;
  instancePath: string;
  hint?: string;
}

export function createAjvInstance() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv;
}

export function formatAjvErrors(errors: ErrorObject[] = []): FormattedAjvError[] {
  return errors.map((error) => ({
    message: humanizeError(error),
    instancePath: error.instancePath ?? '',
    hint: buildHint(error),
  }));
}

function humanizeError(error: ErrorObject) {
  const path = error.instancePath ? `${error.instancePath} ` : '';
  return `${path}${error.message ?? 'Violação do schema detectada.'}`.trim();
}

function buildHint(error: ErrorObject) {
  if (error.keyword === 'required' && typeof error.params?.missingProperty === 'string') {
    return `Adicione a propriedade "${error.params.missingProperty}" ao objeto.`;
  }

  if (error.keyword === 'type' && typeof error.params?.type === 'string') {
    return `Verifique se o valor segue o tipo esperado: ${error.params.type}.`;
  }

  if (error.keyword === 'enum' && Array.isArray(error.params?.allowedValues)) {
    return `Valores permitidos: ${error.params.allowedValues.join(', ')}.`;
  }

  return undefined;
}

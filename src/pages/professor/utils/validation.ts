import Ajv2020 from 'ajv/dist/2020';
import type { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import draft2020Schema from 'ajv/dist/refs/json-schema-2020-12/schema.json';

export interface FormattedAjvError {
  message: string;
  instancePath: string;
  hint?: string;
}

export function createAjvInstance() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const metaSchemaId =
    typeof draft2020Schema === 'object' && draft2020Schema && '$id' in draft2020Schema
      ? String((draft2020Schema as { $id?: unknown }).$id ?? '')
      : '';

  if (!metaSchemaId || !ajv.getSchema(metaSchemaId)) {
    ajv.addMetaSchema(draft2020Schema);
  }
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

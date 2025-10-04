import { describe, expect, it } from 'vitest';
import { createAjvInstance, formatAjvErrors } from '../validation';
import type { ErrorObject } from 'ajv';

describe('validation utils', () => {
  it('cria instância do AJV com suporte a formatos de data', () => {
    const ajv = createAjvInstance();
    const schema = {
      type: 'object',
      properties: {
        generatedAt: { type: 'string', format: 'date-time' },
      },
      required: ['generatedAt'],
    } as const;
    const validate = ajv.compile(schema);

    expect(validate({ generatedAt: '2024-07-01T10:30:00Z' })).toBe(true);
    expect(validate({ generatedAt: 'invalido' })).toBe(false);
  });

  it('humaniza erros do AJV e gera dicas específicas', () => {
    const errors: ErrorObject[] = [
      {
        keyword: 'required',
        instancePath: '/content',
        schemaPath: '#/required',
        params: { missingProperty: 'title' },
        message: 'is required',
      },
      {
        keyword: 'type',
        instancePath: '/duration',
        schemaPath: '#/properties/duration/type',
        params: { type: 'number' },
        message: 'must be number',
      },
      {
        keyword: 'enum',
        instancePath: '/status',
        schemaPath: '#/properties/status/enum',
        params: { allowedValues: ['draft', 'published'] },
        message: 'must be equal to one of the allowed values',
      },
    ] as unknown as ErrorObject[];

    const formatted = formatAjvErrors(errors);
    expect(formatted).toHaveLength(3);
    expect(formatted[0]).toMatchObject({
      message: '/content is required',
      hint: 'Adicione a propriedade "title" ao objeto.',
    });
    expect(formatted[1]).toMatchObject({
      message: '/duration must be number',
      hint: 'Verifique se o valor segue o tipo esperado: number.',
    });
    expect(formatted[2]).toMatchObject({
      message: '/status must be equal to one of the allowed values',
      hint: 'Valores permitidos: draft, published.',
    });
  });
});

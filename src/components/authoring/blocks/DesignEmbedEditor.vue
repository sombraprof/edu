<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';
import {
  EMBED_VIEW_MODES,
  getEmbedProviderById,
  type EmbedProviderPreset,
  type EmbedTheme,
  type EmbedViewMode,
} from '@/utils/embedWhitelist';
import type {
  DesignEmbedBlockData,
  DesignEmbedProviderId,
} from '@/components/lesson/DesignEmbed.vue';

const DESIGN_PROVIDERS: readonly DesignEmbedProviderId[] = ['figma', 'miro', 'framer'];

interface DesignEmbedAuthoringBlock extends Partial<DesignEmbedBlockData> {
  type?: string;
}

const props = defineProps<{ block: DesignEmbedAuthoringBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: DesignEmbedAuthoringBlock): void }>();

const providerPresets = DESIGN_PROVIDERS.map((id) => getEmbedProviderById(id)).filter(
  (preset): preset is EmbedProviderPreset => Boolean(preset)
);

const providerOptions = providerPresets.map((preset) => ({
  value: preset.id,
  label: preset.label,
}));

const viewModeLabels: Record<EmbedViewMode, string> = {
  embed: 'Incorporado',
  present: 'Apresentação',
  preview: 'Pré-visualização',
  view: 'Visualização',
  board: 'Quadro',
};

const themeLabels: Record<EmbedTheme, string> = {
  light: 'Claro',
  dark: 'Escuro',
  auto: 'Automático',
};

const schema = computed<BlockSchema>(() => {
  const providerId = isDesignProviderId(props.block.provider)
    ? props.block.provider
    : DESIGN_PROVIDERS[0];
  const provider = getEmbedProviderById(providerId) ?? providerPresets[0] ?? null;

  const supportedPages = provider?.supportedPages?.length
    ? provider.supportedPages
    : EMBED_VIEW_MODES;
  const supportedThemes = provider?.supportedThemes ?? [];

  const fields: BlockSchema['fields'] = [
    {
      type: 'text',
      key: 'title',
      label: 'Título',
      placeholder: 'Exploração do fluxo de onboarding',
    },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 3,
      placeholder: 'Contextualize o objetivo do protótipo e o que observar.',
    },
    {
      type: 'select',
      key: 'provider',
      label: 'Provedor',
      options: providerOptions,
      placeholder: 'Selecione um provedor',
      required: true,
    },
    {
      type: 'url',
      key: 'url',
      label: 'URL do protótipo',
      placeholder: 'https://.../prototype',
      help: 'Utilize o link de compartilhamento com permissão de visualização pública.',
      required: true,
    },
  ];

  if (supportedPages.length) {
    fields.push({
      type: 'select',
      key: 'page',
      label: 'Modo de exibição',
      options: supportedPages.map((mode) => ({ value: mode, label: viewModeLabels[mode] ?? mode })),
      placeholder: 'Padrão do provedor',
      help: 'Escolha como o protótipo será renderizado (apresentação, embed, etc.).',
    });
  }

  if (supportedThemes.length) {
    fields.push({
      type: 'select',
      key: 'theme',
      label: 'Tema',
      options: supportedThemes.map((theme) => ({
        value: theme,
        label: themeLabels[theme] ?? theme,
      })),
      placeholder: 'Automático',
      help: 'Defina o tema claro/escuro quando disponível.',
    });
  }

  fields.push({
    type: 'string-list',
    key: 'hints',
    label: 'Dicas adicionais',
    itemLabel: 'Dica',
    addLabel: 'Adicionar dica',
    help: 'Deixe vazio para usar sugestões padrão do provedor ou personalize instruções.',
    minItems: 0,
  });

  return {
    type:
      props.block?.type === 'designEmbed' ? 'designEmbed' : (props.block?.type ?? 'designEmbed'),
    title: 'Protótipo incorporado',
    description: 'Incorpore protótipos de Figma, Miro ou Framer com controles de visualização.',
    fields,
  } satisfies BlockSchema;
});

function forward(value: DesignEmbedAuthoringBlock) {
  emit('update:block', value);
}

function isDesignProviderId(value: unknown): value is DesignEmbedProviderId {
  return typeof value === 'string' && (DESIGN_PROVIDERS as readonly string[]).includes(value);
}
</script>

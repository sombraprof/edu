<template>
  <section
    class="class-designer card md-stack"
    role="group"
    :aria-label="title ?? 'Diagrama de classes UML'"
  >
    <header v-if="title || summary" class="class-designer__header md-stack">
      <h3
        v-if="title"
        class="class-designer__title text-title-medium font-semibold text-on-surface"
      >
        {{ title }}
      </h3>
      <p v-if="summary" class="class-designer__summary supporting-text">
        {{ summary }}
      </p>
    </header>

    <div class="class-designer__grid" role="list">
      <article
        v-for="umlClass in normalizedClasses"
        :key="umlClass.id"
        class="class-designer__class md-surface"
        role="listitem"
        :aria-labelledby="`${umlClass.id}-name`"
        :aria-describedby="umlClass.descriptionId"
        :data-type="umlClass.type ?? 'class'"
      >
        <header class="class-designer__class-header">
          <div class="class-designer__class-heading md-stack">
            <span v-if="umlClass.stereotype" class="class-designer__stereotype supporting-text">
              «{{ umlClass.stereotype }}»
            </span>
            <h4
              :id="`${umlClass.id}-name`"
              class="class-designer__class-name text-title-small font-semibold"
            >
              {{ umlClass.name }}
            </h4>
            <span
              v-if="umlClass.typeLabel"
              class="class-designer__type-chip"
              :data-type="umlClass.type ?? 'class'"
            >
              {{ umlClass.typeLabel }}
            </span>
          </div>
          <p
            v-if="umlClass.summary"
            :id="umlClass.descriptionId"
            class="class-designer__class-summary supporting-text"
          >
            {{ umlClass.summary }}
          </p>
        </header>

        <section
          v-if="umlClass.attributes.length"
          class="class-designer__section"
          aria-label="Atributos"
          role="list"
        >
          <h5 class="class-designer__section-title text-label-large font-semibold">Atributos</h5>
          <ul class="class-designer__members" role="list">
            <li
              v-for="attribute in umlClass.attributes"
              :key="attribute.id"
              class="class-designer__member"
              role="listitem"
            >
              <span class="class-designer__member-visibility" aria-hidden="true">{{
                attribute.symbol
              }}</span>
              <span class="sr-only">{{ attribute.visibilityLabel }}</span>
              <span class="class-designer__member-signature text-body-medium">{{
                attribute.signature
              }}</span>
              <p v-if="attribute.note" class="class-designer__member-note supporting-text">
                {{ attribute.note }}
              </p>
            </li>
          </ul>
        </section>

        <section
          v-if="umlClass.methods.length"
          class="class-designer__section"
          aria-label="Métodos"
          role="list"
        >
          <h5 class="class-designer__section-title text-label-large font-semibold">Métodos</h5>
          <ul class="class-designer__members" role="list">
            <li
              v-for="method in umlClass.methods"
              :key="method.id"
              class="class-designer__member"
              role="listitem"
            >
              <span class="class-designer__member-visibility" aria-hidden="true">{{
                method.symbol
              }}</span>
              <span class="sr-only">{{ method.visibilityLabel }}</span>
              <span class="class-designer__member-signature text-body-medium">{{
                method.signature
              }}</span>
              <p v-if="method.note" class="class-designer__member-note supporting-text">
                {{ method.note }}
              </p>
            </li>
          </ul>
        </section>

        <section
          v-if="umlClass.responsibilities.length"
          class="class-designer__section"
          aria-label="Responsabilidades"
          role="list"
        >
          <h5 class="class-designer__section-title text-label-large font-semibold">
            Responsabilidades
          </h5>
          <ul class="class-designer__responsibilities" role="list">
            <li
              v-for="responsibility in umlClass.responsibilities"
              :key="responsibility"
              class="class-designer__responsibility"
              role="listitem"
            >
              {{ responsibility }}
            </li>
          </ul>
        </section>

        <section
          v-if="umlClass.notes.length"
          class="class-designer__section"
          aria-label="Notas"
          role="list"
        >
          <h5 class="class-designer__section-title text-label-large font-semibold">Notas</h5>
          <ul class="class-designer__notes" role="list">
            <li
              v-for="note in umlClass.notes"
              :key="note"
              class="class-designer__note supporting-text"
              role="listitem"
            >
              {{ note }}
            </li>
          </ul>
        </section>
      </article>
    </div>

    <section
      v-if="relationshipsWithLabels.length"
      class="class-designer__relationships md-stack"
      aria-label="Relacionamentos"
      role="list"
    >
      <article
        v-for="relationship in relationshipsWithLabels"
        :key="relationship.id"
        class="class-designer__relationship"
        role="listitem"
        :data-type="relationship.type"
      >
        <header class="class-designer__relationship-header">
          <span class="class-designer__relationship-type text-label-large font-semibold">{{
            relationship.typeLabel
          }}</span>
          <p class="class-designer__relationship-link text-body-medium">
            {{ relationship.fromLabel }} {{ relationship.connector }} {{ relationship.toLabel }}
          </p>
        </header>
        <p
          v-if="relationship.description"
          class="class-designer__relationship-description supporting-text"
        >
          {{ relationship.description }}
        </p>
      </article>
    </section>

    <section
      v-if="legendWithDescriptions.length"
      class="class-designer__legend md-stack"
      aria-label="Legenda"
      role="list"
    >
      <article
        v-for="item in legendWithDescriptions"
        :key="item.id"
        class="class-designer__legend-item"
        role="listitem"
      >
        <span class="class-designer__legend-swatch" :data-kind="item.kind ?? 'class'"></span>
        <div class="class-designer__legend-copy md-stack">
          <p class="text-label-large font-semibold">{{ item.label }}</p>
          <p v-if="item.description" class="supporting-text">{{ item.description }}</p>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type UmlVisibility = 'public' | 'private' | 'protected' | 'package';

type UmlMember = {
  id: string;
  signature: string;
  visibility?: UmlVisibility;
  note?: string;
};

type UmlClass = {
  id: string;
  name: string;
  stereotype?: string;
  summary?: string;
  type?: 'class' | 'interface' | 'enum';
  attributes?: UmlMember[];
  methods?: UmlMember[];
  responsibilities?: string[];
  notes?: string[];
};

type UmlRelationship = {
  id: string;
  from: string;
  to: string;
  type:
    | 'association'
    | 'aggregation'
    | 'composition'
    | 'inheritance'
    | 'realization'
    | 'dependency';
  description?: string;
  fromMultiplicity?: string;
  toMultiplicity?: string;
};

type UmlLegendItem = {
  id: string;
  label: string;
  description?: string;
  kind?: UmlRelationship['type'] | UmlClass['type'];
};

interface ClassDesignerProps {
  title?: string;
  summary?: string;
  classes: UmlClass[];
  relationships?: UmlRelationship[];
  legend?: UmlLegendItem[];
}

const props = withDefaults(defineProps<ClassDesignerProps>(), {
  classes: () => [],
  relationships: () => [],
  legend: () => [],
  title: undefined,
  summary: undefined,
});

const visibilitySymbolMap: Record<UmlVisibility, string> = {
  public: '+',
  private: '-',
  protected: '#',
  package: '~',
};

const visibilityLabelMap: Record<UmlVisibility, string> = {
  public: 'Visibilidade pública',
  private: 'Visibilidade privada',
  protected: 'Visibilidade protegida',
  package: 'Visibilidade de pacote',
};

const typeLabelMap: Record<NonNullable<UmlClass['type']>, string> = {
  class: 'Classe',
  interface: 'Interface',
  enum: 'Enumeração',
};

type NormalizedMember = {
  id: string;
  signature: string;
  note?: string;
  symbol: string;
  visibilityLabel: string;
};

type NormalizedClass = {
  id: string;
  name: string;
  summary?: string;
  stereotype?: string;
  type?: UmlClass['type'];
  typeLabel?: string;
  attributes: NormalizedMember[];
  methods: NormalizedMember[];
  responsibilities: string[];
  notes: string[];
  descriptionId?: string;
};

const normalizedClasses = computed<NormalizedClass[]>(() =>
  props.classes
    .map((umlClass) => {
      const attributes = normalizeMembers(umlClass.attributes);
      const methods = normalizeMembers(umlClass.methods);
      const responsibilities = normalizeStrings(umlClass.responsibilities);
      const notes = normalizeStrings(umlClass.notes);
      const summary = cleanString(umlClass.summary);
      const descriptionId =
        summary || responsibilities.length || notes.length
          ? `${umlClass.id}-description`
          : undefined;
      return {
        id: umlClass.id,
        name: umlClass.name,
        stereotype: cleanString(umlClass.stereotype),
        summary: summary || undefined,
        type: umlClass.type,
        typeLabel: umlClass.type ? typeLabelMap[umlClass.type] : undefined,
        attributes,
        methods,
        responsibilities,
        notes,
        descriptionId,
      } satisfies NormalizedClass;
    })
    .filter((umlClass) => umlClass.id && umlClass.name)
);

type RelationshipLabel = {
  id: string;
  type: UmlRelationship['type'];
  typeLabel: string;
  fromLabel: string;
  toLabel: string;
  connector: string;
  description?: string;
};

const relationshipLabelMap: Record<UmlRelationship['type'], string> = {
  association: 'Associação',
  aggregation: 'Agregação',
  composition: 'Composição',
  inheritance: 'Herança',
  realization: 'Realização',
  dependency: 'Dependência',
};

const relationshipsWithLabels = computed<RelationshipLabel[]>(() =>
  props.relationships
    .map((relationship) => {
      const fromMultiplicity = cleanString(relationship.fromMultiplicity);
      const toMultiplicity = cleanString(relationship.toMultiplicity);
      return {
        id: relationship.id,
        type: relationship.type,
        typeLabel: relationshipLabelMap[relationship.type],
        fromLabel: `${relationship.from}${fromMultiplicity ? ` [${fromMultiplicity}]` : ''}`,
        toLabel: `${relationship.to}${toMultiplicity ? ` [${toMultiplicity}]` : ''}`,
        connector: connectorForType(relationship.type),
        description: cleanString(relationship.description),
      } satisfies RelationshipLabel;
    })
    .filter(
      (relationship) =>
        relationship.id && relationship.typeLabel && relationship.fromLabel && relationship.toLabel
    )
);

const legendWithDescriptions = computed(() =>
  props.legend
    .map((item) => ({
      id: item.id,
      label: item.label,
      description: cleanString(item.description) || undefined,
      kind: item.kind,
    }))
    .filter((item) => item.id && item.label)
);

function normalizeMembers(members: UmlMember[] | undefined): NormalizedMember[] {
  if (!Array.isArray(members)) {
    return [];
  }
  return members
    .map((member, index) => {
      const visibility = member.visibility ?? 'public';
      const signature = cleanString(member.signature);
      return {
        id: member.id ?? `${visibility}-${index}`,
        signature,
        note: cleanString(member.note) || undefined,
        symbol: visibilitySymbolMap[visibility],
        visibilityLabel: visibilityLabelMap[visibility],
      } satisfies NormalizedMember;
    })
    .filter((member) => Boolean(member.id) && Boolean(member.signature));
}

function normalizeStrings(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((value) => cleanString(value))
    .filter((value): value is string => Boolean(value));
}

function cleanString(value: string | undefined | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function connectorForType(type: UmlRelationship['type']): string {
  switch (type) {
    case 'inheritance':
    case 'realization':
      return '⇨';
    case 'aggregation':
      return '◊→';
    case 'composition':
      return '◆→';
    case 'dependency':
      return '⇒';
    default:
      return '→';
  }
}
</script>

<style scoped>
.class-designer {
  padding: var(--md-sys-spacing-6);
  border-radius: var(--md-sys-border-radius-3xl);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 65%, transparent);
  gap: var(--md-sys-spacing-6);
}

.class-designer__header {
  gap: var(--md-sys-spacing-2);
}

.class-designer__title {
  margin: 0;
}

.class-designer__summary {
  margin: 0;
}

.class-designer__grid {
  display: grid;
  gap: var(--md-sys-spacing-5);
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}

.class-designer__class {
  display: grid;
  gap: var(--md-sys-spacing-4);
  padding: var(--md-sys-spacing-5);
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-level1);
  transition: box-shadow 160ms ease;
}

.class-designer__class:hover,
.class-designer__class:focus-within {
  box-shadow: var(--md-sys-elevation-level2);
}

.class-designer__class-header {
  display: grid;
  gap: var(--md-sys-spacing-3);
}

.class-designer__class-heading {
  gap: var(--md-sys-spacing-1);
}

.class-designer__stereotype {
  margin: 0;
  color: color-mix(in srgb, var(--md-sys-color-primary) 65%, var(--md-sys-color-on-surface) 35%);
}

.class-designer__class-name {
  margin: 0;
}

.class-designer__type-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.125rem 0.75rem;
  border-radius: 999px;
  font-size: var(--md-sys-typescale-label-small-size);
  font-weight: 600;
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 75%, transparent);
  color: var(--md-sys-color-on-secondary-container);
}

.class-designer__class-summary {
  margin: 0;
}

.class-designer__section {
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.class-designer__section-title {
  margin: 0;
}

.class-designer__members {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.class-designer__member {
  display: grid;
  gap: 0.125rem;
  align-items: start;
}

.class-designer__member-visibility {
  font-family: var(--font-family-monospace);
  font-size: var(--md-sys-typescale-label-large-size);
  color: color-mix(in srgb, var(--md-sys-color-primary) 65%, var(--md-sys-color-on-surface) 35%);
}

.class-designer__member-signature {
  font-family: var(--font-family-monospace);
}

.class-designer__member-note {
  margin: 0;
}

.class-designer__responsibilities,
.class-designer__notes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.class-designer__responsibility,
.class-designer__note {
  padding: var(--md-sys-spacing-2) var(--md-sys-spacing-3);
  border-radius: var(--md-sys-border-radius-large);
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 30%, transparent);
  color: var(--md-sys-color-on-primary-container);
}

.class-designer__notes .class-designer__note {
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 30%, transparent);
  color: var(--md-sys-color-on-secondary-container);
}

.class-designer__relationships {
  gap: var(--md-sys-spacing-3);
}

.class-designer__relationship {
  border-radius: var(--md-sys-border-radius-2xl);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 55%, transparent);
  background: var(--md-sys-color-surface);
  padding: var(--md-sys-spacing-4);
  display: grid;
  gap: var(--md-sys-spacing-2);
}

.class-designer__relationship[data-type='inheritance'],
.class-designer__relationship[data-type='realization'] {
  border-color: color-mix(in srgb, var(--md-sys-color-primary) 45%, transparent);
}

.class-designer__relationship[data-type='composition'] {
  border-color: color-mix(in srgb, var(--md-sys-color-tertiary) 45%, transparent);
}

.class-designer__relationship[data-type='aggregation'] {
  border-color: color-mix(in srgb, var(--md-sys-color-secondary) 45%, transparent);
}

.class-designer__relationship-header {
  display: grid;
  gap: var(--md-sys-spacing-1);
}

.class-designer__relationship-type {
  margin: 0;
}

.class-designer__relationship-link {
  margin: 0;
  font-family: var(--font-family-monospace);
}

.class-designer__relationship-description {
  margin: 0;
}

.class-designer__legend {
  gap: var(--md-sys-spacing-2);
}

.class-designer__legend-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--md-sys-spacing-3);
  align-items: start;
}

.class-designer__legend-swatch {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--md-sys-color-outline) 40%, transparent);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline) 60%, transparent);
}

.class-designer__legend-swatch[data-kind='interface'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary-container) 65%, transparent);
  border-color: color-mix(in srgb, var(--md-sys-color-tertiary) 45%, transparent);
}

.class-designer__legend-swatch[data-kind='enum'] {
  background: color-mix(in srgb, var(--md-sys-color-secondary-container) 65%, transparent);
  border-color: color-mix(in srgb, var(--md-sys-color-secondary) 45%, transparent);
}

.class-designer__legend-swatch[data-kind='composition'] {
  background: color-mix(in srgb, var(--md-sys-color-tertiary) 35%, transparent);
}

.class-designer__legend-swatch[data-kind='aggregation'] {
  background: color-mix(in srgb, var(--md-sys-color-secondary) 35%, transparent);
}

.class-designer__legend-swatch[data-kind='inheritance'],
.class-designer__legend-swatch[data-kind='realization'] {
  background: color-mix(in srgb, var(--md-sys-color-primary) 35%, transparent);
}

.class-designer__legend-copy {
  gap: 0.125rem;
}

@media (max-width: 640px) {
  .class-designer {
    padding: var(--md-sys-spacing-4);
  }

  .class-designer__class {
    padding: var(--md-sys-spacing-4);
  }
}
</style>

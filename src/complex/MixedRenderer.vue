<template>
  <div class="prefixed-input" v-if="control.visible">
    <template v-if="valueType === 'array' || valueType === 'object'">
      <div class="mb-2">
        <div class="flex align-items-center gap-2 mb-2">
          <Select
            v-if="mixedRenderInfos"
            :id="control.id + '-input-selector'"
            :disabled="!control.enabled"
            :readonly="control.readonly"
            :label="computedLabel"
            :required="control.required"
            :model-value="selectedIndex"
            :options="mixedRenderInfos"
            optionLabel="label"
            optionValue="index"
            @update:model-value="handleSelectChange"
            v-bind="primeVueProps('Select')"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </div>
        <div v-if="schema && !(nullable && control.data === null)">
          <dispatch-renderer
            class="input"
            :schema="schema"
            :uischema="uischema"
            :path="path"
            :renderers="control.renderers"
            :cells="control.cells"
            :enabled="control.enabled"
            :readonly="control.readonly"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <Select
        class="select"
        v-if="mixedRenderInfos"
        :id="control.id + '-input-selector'"
        :disabled="!control.enabled"
        :readonly="control.readonly"
        :label="computedLabel"
        :required="control.required"
        :model-value="selectedIndex"
        :options="mixedRenderInfos"
        optionLabel="label"
        optionValue="index"
        @update:model-value="handleSelectChange"
        v-bind="primeVueProps('Select')"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <dispatch-renderer
        class="input"
        v-if="schema && !(nullable && control.data === null)"
        :schema="schema"
        :uischema="uischema"
        :path="path"
        :renderers="control.renderers"
        :cells="control.cells"
        :enabled="control.enabled"
        :readonly="control.readonly"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  createControlElement,
  createDefaultValue,
  findUISchema,
  type ControlElement,
  type JsonFormsUISchemaRegistryEntry,
  type JsonSchema,
  type JsonSchema7,
  type UISchemaElement,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsControl,
  type RendererProps,
} from '@jsonforms/vue';
import { computed, defineComponent, provide, ref, watch } from 'vue';
import Select from 'primevue/select';
import {
  IsDynamicPropertyContext,
  isControlEditable,
  useCombinatorTranslations,
  useIcons,
  useJsonForms,
  useTranslator,
  usePrimeVueControl,
} from '../util';
import cloneDeep from 'lodash/cloneDeep';import set from 'lodash/set';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

interface SchemaRenderInfo {
  schema: JsonSchema;
  resolvedSchema: JsonSchema;
  uischema: UISchemaElement;
  label: string;
}

function cleanSchema(schema: JsonSchema) {
  const validKeywords: Record<string, string[]> = {
    array: ['items', 'minItems', 'maxItems', 'uniqueItems', 'contains'],
    object: [
      'properties',
      'required',
      'additionalProperties',
      'minProperties',
      'maxProperties',
      'patternProperties',
      'dependencies',
      'propertyNames',
    ],
    string: ['minLength', 'maxLength', 'pattern', 'format'],
    number: [
      'minimum',
      'maximum',
      'exclusiveMinimum',
      'exclusiveMaximum',
      'multipleOf',
    ],
    integer: [
      'minimum',
      'maximum',
      'exclusiveMinimum',
      'exclusiveMaximum',
      'multipleOf',
    ],
    boolean: [],
    null: [],
  };

  function clean(schema: JsonSchema) {
    for (const validType in validKeywords) {
      if (validType !== schema.type) {
        const keywords = validKeywords[validType];
        keywords.forEach((key) => {
          delete (schema as any)[key];
        });
      }
    }
  }

  return clean(schema);
}

function getSchemaTypesAsArray(schema: JsonSchema): string[] {
  if (typeof schema.type === 'string') {
    return [schema.type];
  }

  if (Array.isArray(schema.type)) {
    return schema.type;
  }

  if (Array.isArray(schema.enum)) {
    const enumTypes = new Set(
      schema.enum.map((value) => getJsonDataType(value)),
    );
    if (!enumTypes.has(null)) {
      return Array.from(enumTypes).filter((type) => type !== null) as string[];
    }
  }

  return ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
}

const createMixedRenderInfos = (
  parentSchema: JsonSchema,
  schema: JsonSchema,
  rootSchema: JsonSchema,
  control: ControlElement,
  path: string,
  uischemas: JsonFormsUISchemaRegistryEntry[],
): SchemaRenderInfo[] => {
  let resolvedSchemas: JsonSchema[] = [];

  if (typeof schema.type === 'string') {
    resolvedSchemas.push(schema);
  } else {
    const types = getSchemaTypesAsArray(schema);

    types.forEach((type) => {
      resolvedSchemas.push({
        ...schema,
        type,
        default:
          schema.default !== undefined &&
          type === getJsonDataType(schema.default)
            ? schema.default
            : undefined,
      });
    });
  }

  return resolvedSchemas.map((resolvedSchema) => {
    if (resolvedSchema.type === 'array') {
      resolvedSchema.items = resolvedSchema.items ?? {};
      if ((resolvedSchema.items as any) === true) {
        resolvedSchema.items = {
          type: [
            'array',
            'boolean',
            'integer',
            'null',
            'number',
            'object',
            'string',
          ],
        };
      } else if (
        typeof (resolvedSchema.items as JsonSchema7).type !== 'string' &&
        !Array.isArray((resolvedSchema.items as JsonSchema7).type)
      ) {
        (resolvedSchema.items as JsonSchema7).type = [
          'array',
          'boolean',
          'integer',
          'null',
          'number',
          'object',
          'string',
        ];
      }
    }

    cleanSchema(resolvedSchema);

    const detailsForSchema = control.options
      ? control.options[resolvedSchema.type + '-detail']
      : undefined;

    const schemaControl = detailsForSchema
      ? {
          ...control,
          options: { ...control.options, detail: detailsForSchema },
        }
      : control;

    const _resolvedSchema = resolvedSchema;

    if (
      control.scope &&
      (resolvedSchema.type === 'object' || resolvedSchema.type === 'array')
    ) {
      const segments = control.scope.split('/');
      const startFromRoot = segments[0] === '#' || segments[0] === '';
      const startIndex = startFromRoot ? 1 : 0;

      if (segments.length > startIndex) {
        const schemaPath = segments.slice(startIndex).join('.');
        if (schemaPath && isEqual(get(parentSchema, schemaPath), schema)) {
          const newSchema = cloneDeep(parentSchema);
          set(newSchema, schemaPath, resolvedSchema);
          resolvedSchema = newSchema;
        }
      }
    }

    const uischema = findUISchema(
      uischemas,
      resolvedSchema,
      control.scope,
      path,
      () => createControlElement(control.scope ?? '#'),
      schemaControl,
      rootSchema,
    );

    return {
      schema: resolvedSchema,
      resolvedSchema: _resolvedSchema,
      uischema,
      label: `${_resolvedSchema.type}`,
    };
  });
};

export function getJsonDataType(value: any): string | null {
  if (typeof value === 'string') {
    return 'string';
  } else if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (Array.isArray(value)) {
    return 'array';
  } else if (value === null) {
    return 'null';
  } else if (typeof value === 'object') {
    return 'object';
  }

  return null;
}

const controlRenderer = defineComponent({
  name: 'mixed-renderer',
  components: {
    DispatchRenderer,
    Select,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const path = props.path;
    const parentSchema = props.schema;
    const input = useJsonFormsControl(props);

    const control = input.control.value;
    const valueType = ref(getJsonDataType(control.data));
    const jsonforms = useJsonForms();
    const icons = useIcons();

    watch(
      () => input.control.value.data,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          const oldValueType = valueType.value;
          valueType.value = getJsonDataType(newValue);

          if (oldValueType !== valueType.value) {
            selectedIndex.value = matchingSchema.value?.index;
          }
        }
      },
      { deep: false },
    );

    const mixedRenderInfos = computed<
      (SchemaRenderInfo & {
        index: number;
      })[]
    >(() => {
      const result = createMixedRenderInfos(
        parentSchema,
        control.schema,
        control.rootSchema,
        control.uischema as ControlElement,
        control.path,
        jsonforms.uischemas || [],
      );

      return result
        .filter((info) => info.uischema)
        .map((info, index) => ({ ...info, index: index }));
    });

    const nullable = computed(() =>
      mixedRenderInfos.value.some(
        (info) => info.resolvedSchema.type === 'null',
      ),
    );

    const matchingSchema = computed(() => {
      let result = mixedRenderInfos.value.find(
        (entry) => entry.resolvedSchema.type === valueType.value,
      );
      if (!result) {
        result = mixedRenderInfos.value.find(
          (entry) =>
            entry.resolvedSchema.type === 'number' &&
            valueType.value === 'integer',
        );
      }
      return result;
    });

    const selectedIndex = ref<number | undefined | null>(
      matchingSchema.value?.index,
    );

    const t = useTranslator();

    const schema = computed(() =>
      selectedIndex.value !== null && selectedIndex.value !== undefined
        ? mixedRenderInfos.value[selectedIndex.value].schema
        : undefined,
    );
    const resolvedSchema = computed(() =>
      selectedIndex.value !== null && selectedIndex.value !== undefined
        ? mixedRenderInfos.value[selectedIndex.value].resolvedSchema
        : undefined,
    );

    const uischema = computed(() =>
      selectedIndex.value !== null && selectedIndex.value !== undefined
        ? mixedRenderInfos.value[selectedIndex.value].uischema
        : undefined,
    );

    const currentlyExpanded = ref<number | null>(null);
    provide(IsDynamicPropertyContext, true);

    return {
      ...useCombinatorTranslations(usePrimeVueControl(input)),
      isControlEditable,
      nullable,
      mixedRenderInfos,
      selectedIndex,
      t,
      valueType,
      schema,
      resolvedSchema,
      uischema,
      path,
      icons,
      currentlyExpanded,
    };
  },
  methods: {
    setToNull(): void {
      this.handleChange(this.control.path, null);
    },
    handleSelectChange(newIndex: number): void {
      const newData =
        newIndex != null
          ? createDefaultValue(
              this.mixedRenderInfos[newIndex].resolvedSchema,
              this.control.rootSchema,
            )
          : undefined;

      this.handleChange(this.control.path, newData);
      this.selectedIndex = newIndex;

      const type = newIndex != null
        ? this.mixedRenderInfos[newIndex]?.resolvedSchema?.type
        : null;
      this.valueType = type as string | null;
      this.currentlyExpanded = 0;
    },
  },
});

export default controlRenderer;
</script>

<style scoped>
.prefixed-input {
  display: flex;
  align-items: center;
}

.select {
  flex-shrink: 0;
}

.input {
  flex-grow: 1;
  width: 100%;
}
</style>

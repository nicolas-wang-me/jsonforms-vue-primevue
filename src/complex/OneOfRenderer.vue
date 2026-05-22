<template>
  <div v-if="control.visible">
    <CombinatorProperties
      :schema="control.schema"
      combinatorKeyword="oneOf"
      :path="path"
      :rootSchema="control.rootSchema"
    />

    <Select
      v-disabled-icon-focus
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :readonly="control.readonly"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :options="oneOfRenderInfos"
      option-label="label"
      option-value="index"
      :model-value="selectedIndex"
      :show-clear="clearable"
      v-bind="primeVueProps('Select')"
      @update:model-value="handleSelectChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <dispatch-renderer
      v-if="selectedIndex !== undefined && selectedIndex !== null"
      :schema="oneOfRenderInfos[selectedIndex].schema"
      :uischema="oneOfRenderInfos[selectedIndex].uischema"
      :path="control.path"
      :renderers="control.renderers"
      :cells="control.cells"
      :enabled="control.enabled"
      :readonly="control.readonly"
    />

    <Dialog v-model:visible="dialog" :header="control.translations.clearDialogTitle" modal>
      <p>{{ control.translations.clearDialogMessage }}</p>
      <template #footer>
        <Button :label="control.translations.clearDialogDecline" text @click="cancel" />
        <Button :label="control.translations.clearDialogAccept" @click="confirm" ref="confirm" />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
import {
  type CombinatorSubSchemaRenderInfo,
  type ControlElement,
  createCombinatorRenderInfos,
  createDefaultValue,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  type RendererProps,
  useJsonFormsOneOfControl,
} from '@jsonforms/vue';
import { defineComponent, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import { DisabledIconFocus } from '../controls/directives';
import {
  useCombinatorTranslations,
  usePrimeVueControl,
} from '../util';
import { CombinatorProperties } from './components';

const controlRenderer = defineComponent({
  name: 'one-of-select-renderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
    Dialog,
    Button,
    Select,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsOneOfControl(props);
    const control = input.control.value;

    const selectedIndex = ref(
      control.indexOfFittingSchema != null &&
        control.indexOfFittingSchema != undefined
        ? control.indexOfFittingSchema
        : input.control.value.data !== undefined
          ? 0
          : null,
    );

    const newSelectedIndex = ref<number | null>(null);
    const dialog = ref(false);

    return {
      ...useCombinatorTranslations(usePrimeVueControl(input)),
      selectedIndex,
      dialog,
      newSelectedIndex,
    };
  },
  computed: {
    oneOfRenderInfos(): (CombinatorSubSchemaRenderInfo & {
      index: number;
    })[] {
      const result = createCombinatorRenderInfos(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.control.schema.oneOf!,
        this.control.rootSchema,
        'oneOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas,
      );

      return result.map((info, index) => ({ ...info, index: index }));
    },
  },
  methods: {
    handleSelectChange(selectIndex: number | null): void {
      this.newSelectedIndex = selectIndex;

      if (this.control.data === undefined) {
        this.openNewTab(this.newSelectedIndex);
      } else {
        this.dialog = true;
      }
    },
    confirm(): void {
      this.openNewTab(this.newSelectedIndex);
      this.dialog = false;
    },
    cancel(): void {
      this.dialog = false;
    },
    openNewTab(newIndex: number | null): void {
      this.handleChange(
        this.control.path,
        newIndex != null
          ? createDefaultValue(
              this.oneOfRenderInfos[newIndex].schema,
              this.control.rootSchema,
            )
          : undefined,
      );

      this.selectedIndex = newIndex;
    },
  },
});

export default controlRenderer;
</script>

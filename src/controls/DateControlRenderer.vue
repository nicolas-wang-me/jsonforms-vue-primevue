<template>
  <Fluid>
    <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
    >
      <div :class="styles.control.root + '-inner'">
        <label v-if="computedLabel" :for="control.id + '-input'" class="primevue-control-label">
          {{ computedLabel }}
          <span v-if="control.required" class="primevue-control-required">*</span>
        </label>
        <DatePicker
          v-disabled-icon-focus
          :id="control.id + '-input'"
          :class="[styles.control.input, { 'p-invalid': control.errors }]"
          :disabled="!control.enabled"
          :readonly="control.readonly"
          :placeholder="appliedOptions.placeholder ?? dateFormat"
          :model-value="pickerValue"
          :date-format="dateFormat"
          :min-date="minDate"
          :max-date="maxDate"
          :show-icon="true"
          icon-display="input"
          v-bind="primeVueProps('DatePicker')"
          @update:model-value="onPickerChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <small v-if="control.errors" class="primevue-control-error">{{ control.errors }}</small>
        <small v-else-if="control.description && persistentHint()" class="primevue-control-hint">{{ control.description }}</small>
      </div>
    </control-wrapper>
  </Fluid>
</template>

<script lang="ts">
import { type ControlElement, type JsonSchema } from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsControl,
  type RendererProps,
} from '@jsonforms/vue';
import { computed, defineComponent } from 'vue';
import DatePicker from 'primevue/datepicker';
import Fluid from 'primevue/fluid';
import { determineClearValue, parseDateTime, usePrimeVueControl } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { DisabledIconFocus } from './directives';

const JSON_SCHEMA_DATE_FORMATS = ['YYYY-MM-DD'];

type AjvMinMaxFormat = {
  formatMinimum?: string | { $data: any };
  formatExclusiveMinimum?: string | { $data: any };
  formatMaximum?: string | { $data: any };
  formatExclusiveMaximum?: string | { $data: any };
};

const controlRenderer = defineComponent({
  name: 'date-control-renderer',
  components: {
    ControlWrapper,
    DatePicker,
    Fluid,
  },
  directives: {
    DisabledIconFocus,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const clearValue = determineClearValue('');
    const adaptValue = (value: any) => value || clearValue;
    return usePrimeVueControl(useJsonFormsControl(props), adaptValue);
  },
  computed: {
    dateFormat(): string {
     const format =
       typeof this.appliedOptions.dateFormat == 'string'
         ? this.appliedOptions.dateFormat
         : 'yy-mm-dd';
     return this.convertToPrimeVueFormat(format);
    },
    dateSaveFormat(): string {
     return typeof this.appliedOptions.dateSaveFormat == 'string'
       ? this.appliedOptions.dateSaveFormat
       : 'YYYY-MM-DD';
    },
    formats(): string[] {
     return [
       this.dateSaveFormat,
       this.dateFormat,
       ...JSON_SCHEMA_DATE_FORMATS,
     ];
    },
    minDate(): Date | undefined {
     const schema = this.control.schema as JsonSchema & AjvMinMaxFormat;
     if (typeof schema.formatMinimum === 'string') {
       const date = parseDateTime(schema.formatMinimum, this.formats);
       return date ? date.toDate() : undefined;
     } else if (typeof schema.formatExclusiveMinimum === 'string') {
       let date = parseDateTime(schema.formatExclusiveMinimum, this.formats);
       if (date) {
         date = date.add(1, 'day');
       }
       return date ? date.toDate() : undefined;
     }
     return undefined;
    },
    maxDate(): Date | undefined {
     const schema = this.control.schema as JsonSchema & AjvMinMaxFormat;
     if (typeof schema.formatMaximum === 'string') {
       const date = parseDateTime(schema.formatMaximum, this.formats);
       return date ? date.toDate() : undefined;
     } else if (typeof schema.formatExclusiveMaximum === 'string') {
       let date = parseDateTime(schema.formatExclusiveMaximum, this.formats);
       if (date) {
         date = date.subtract(1, 'day');
       }
       return date ? date.toDate() : undefined;
     }
     return undefined;
    },
    pickerValue(): Date | null {
     const value = this.control.data;
     const date = parseDateTime(value, this.formats);
     return date ? date.toDate() : null;
    },
  },
  methods: {
    onPickerChange(value: Date | Date[] | (Date | null)[] | null | undefined): void {
     const date = parseDateTime(value as Date | null, undefined);
     const newdata: string | null = date
       ? date.format(this.dateSaveFormat)
       : null;
     this.onChange(newdata);
    },
    /**
     * Convert dayjs format tokens to PrimeVue Calendar format tokens.
     * PrimeVue uses: yy=4-digit year, y=2-digit year, mm=month number,
     * MM=month name, dd=day, d=day no-pad
     */
    convertToPrimeVueFormat(dayjsFormat: string): string {
     return dayjsFormat
       .split('YYYY')
        .join('yy')
       .split('yyyy')
       .join('yy')
       .split('YY')
       .join('y')
       .split('MMMM')
       .join('MM')
       .split('MMM')
       .join('M')
       .split('DD')
       .join('dd')
       .split('D')
       .join('d')
       .split('MM')
       .join('mm');
    },
  },
});

export default controlRenderer;
</script>

<style scoped>
.control-inner {
  display: flex;
  flex-direction: column;
  gap: var(--p-spacing-1, 0.25rem);
}

.control-inner .p-datepicker {
  width: 100%;
}

.primevue-control-label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: var(--p-font-size-sm, 0.875rem);
  display: flex;
  align-items: center;
  gap: var(--p-spacing-1, 0.25rem);
}

.primevue-control-required {
  color: var(--p-error-color, #f87171);
  font-weight: 600;
}

.primevue-control-error {
  color: var(--p-error-color, #f87171);
  font-size: var(--p-font-size-sm, 0.875rem);
  display: block;
  margin-top: var(--p-spacing-1, 0.25rem);
}

.primevue-control-hint {
  color: var(--p-text-color-secondary, #6b7280);
  font-size: var(--p-font-size-sm, 0.875rem);
  display: block;
  margin-top: var(--p-spacing-1, 0.25rem);
}
</style>

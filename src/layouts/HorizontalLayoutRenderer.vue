<template>
  <Fluid
    v-if="layout.visible && (layout.uischema as Layout).elements.length > 0"
  >
    <div
      :class="styles.horizontalLayout.root"
    >
      <div
        v-for="(element, index) in (layout.uischema as Layout).elements"
        :key="`${layout.path}-${(layout.uischema as Layout).elements.length}-${index}`"
        :class="styles.horizontalLayout.item"
        :style="itemStyle"
      >
        <dispatch-renderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :readonly="layout.readonly"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </div>
    </div>
  </Fluid>
</template>

<script lang="ts">
// @ts-nocheck
import { type Layout } from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  type RendererProps,
} from '@jsonforms/vue';
import { computed, defineComponent } from 'vue';
import { usePrimeVueLayout } from '../util';
import Fluid from 'primevue/fluid';

const layoutRenderer = defineComponent({
  name: 'horizontal-layout-renderer',
  components: {
    DispatchRenderer,
    Fluid,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const layout = usePrimeVueLayout(useJsonFormsLayout(props));
    const itemStyle = computed(() => {
      const count = (props.uischema as Layout).elements.length;
      return {
        flex: `1 1 ${100 / count}%`,
        minWidth: '200px',
      };
    });
    return {
      ...layout,
      itemStyle,
    } as Record<string, any>;
  },
}) as any;

export default layoutRenderer;
</script>

<style scoped>
.horizontal-layout {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--p-spacing-2, 0.5rem);
}

.horizontal-layout-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
</style>

<script setup lang="ts">
  import { onMounted, onUnmounted, onUpdated, shallowRef } from 'vue';
  import * as Fancyapps from '@fancyapps/ui';
  const { Fancybox } = Fancyapps;

  export type FancyboxOptionsType = ConstructorParameters<typeof Fancybox>[1];

  const props = defineProps<{
    delegate?: string;
    options?: Partial<FancyboxOptionsType>;
  }>();

  const { delegate = '[data-fancybox]', options = {} } = props;

  const container = shallowRef(null);

  onMounted(() => {
    Fancybox.bind(container.value, delegate, options);
  });

  onUpdated(() => {
    Fancybox.unbind(container.value);
    Fancybox.close();

    Fancybox.bind(container.value, delegate, options);
  });

  onUnmounted(() => Fancybox.destroy());
</script>

<template>
  <div ref="container">
    <slot></slot>
  </div>
</template>

<style>
  @import '@fancyapps/ui/dist/fancybox/fancybox.css';
</style>
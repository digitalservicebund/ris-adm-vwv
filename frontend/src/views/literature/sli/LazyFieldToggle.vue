<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'

const visibleModel = defineModel<boolean>('visible', { default: false })
const show = computed(() => visibleModel.value)

const props = defineProps<{ buttonLabel: string; disabled?: boolean }>()

function open() {
  visibleModel.value = true
}
</script>

<template>
  <div class="flex flex-col gap-12">
    <slot name="button" v-if="!show">
      <Button
        :aria-label="props.buttonLabel"
        class="self-start"
        :disabled="props.disabled"
        :label="props.buttonLabel"
        size="small"
        severity="secondary"
        @click="open"
      >
        <template #icon><IconAdd /></template>
      </Button>
    </slot>

    <div v-else>
      <slot />
    </div>
  </div>
</template>

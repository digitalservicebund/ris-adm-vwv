<script lang="ts" setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'

const props = defineProps<{
  classes?: string
  label: string
  shouldShowButton: boolean
}>()

const emit = defineEmits<{
  toggled: [value: boolean]
}>()

const shouldShowButton = ref<boolean>(props.shouldShowButton)

function toggle() {
  shouldShowButton.value = !shouldShowButton.value
  emit('toggled', shouldShowButton.value)
}

watch(
  () => props.shouldShowButton,
  () => {
    // this ensures, that the category expands immediately when the prop changes,
    // but does not collapse immediately, as this might be disruptive
    if (!props.shouldShowButton) {
      shouldShowButton.value = props.shouldShowButton
    }
  },
  { deep: true },
)
</script>

<template>
  <Button
    v-if="shouldShowButton"
    :class="classes"
    :label="label"
    size="small"
    severity="secondary"
    data-testid="category-wrapper-button"
    @click="toggle"
  >
    <template #icon><IconAdd /></template>
  </Button>
  <div v-else data-testid="category-wrapper-component">
    <slot :reset="toggle" />
  </div>
</template>

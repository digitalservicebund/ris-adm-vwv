<script lang="ts" setup>
import { computed } from 'vue'
import type { ValidationError } from '@/components/input/types'

interface Props {
  modelValue?: boolean
  validationError?: ValidationError
  size?: 'small' | 'regular'
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: false,
  modelValue: false,
  validationError: undefined,
  size: 'regular',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | undefined]
  input: [value: Event]
}>()

const localModelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isInvalid = computed(() => props.validationError !== undefined)
</script>

<template>
  <!-- Label should come from the surrounding context, e.g. InputField component -->
  <!-- eslint-disable vuejs-accessibility/form-control-has-label -->
  <input
    v-model="localModelValue"
    class="ds-checkbox"
    :class="{
      'has-error': isInvalid,
      'ds-checkbox-small': size === 'small',
      '!bg-blue-300 !shadow-none': readonly,
    }"
    :disabled="readonly"
    type="checkbox"
    @keydown.space.prevent="localModelValue = !localModelValue"
  />
</template>

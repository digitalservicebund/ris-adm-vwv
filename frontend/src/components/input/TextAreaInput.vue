<script lang="ts" setup>
import { computed, ref } from 'vue'
import { type ValidationError } from '@/components/input/types'
import { useTextareaAutosize } from '@vueuse/core'

type Props = {
  id: string
  modelValue: string
  ariaLabel: string
  placeholder?: string
  readOnly?: boolean
  autosize?: boolean
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  size?: 'regular' | 'medium' | 'small'
  hasError?: boolean
  customClasses?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  validationError: undefined,
  readOnly: false,
  autosize: false,
  resize: 'none',
  size: 'regular',
  customClasses: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:validationError': [value: ValidationError | undefined]
}>()

const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit('update:modelValue', value)
  },
})

/* -------------------------------------------------- *
 * Autosizing                                         *
 * -------------------------------------------------- */

const { textarea, input } = props.autosize
  ? useTextareaAutosize({
      styleProp: 'height',
      input: localValue,
    })
  : { textarea: ref(<HTMLTextAreaElement | null>null), input: localValue }

/* -------------------------------------------------- *
 * Public interface                                   *
 * -------------------------------------------------- */

function focus() {
  textarea.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <textarea
    :id="id"
    ref="textarea"
    v-model="input"
    :aria-label="ariaLabel"
    class="shadow-blue focus:shadow-focus hover:shadow-hover h-unset py-12 focus:outline-none"
    :class="{
      'has-error': hasError,
      'px-16': size === 'small',
      'px-20': size === 'medium',
      'px-24': size === 'regular',
      [customClasses]: true,
      [$style.textarea]: true,
    }"
    :placeholder="placeholder"
    :readonly="readOnly"
    :tabindex="readOnly ? -1 : ($attrs.tabindex as number)"
    @input="$emit('update:validationError', undefined)"
    @keydown.enter.stop="() => {}"
  ></textarea>
  <!-- No-op keypress handler for preventing other enter-based event handlers such as
  submitting data from firing when users are trying to insert newlines  -->
</template>

<style module>
.textarea {
  resize: v-bind(resize);
}
</style>

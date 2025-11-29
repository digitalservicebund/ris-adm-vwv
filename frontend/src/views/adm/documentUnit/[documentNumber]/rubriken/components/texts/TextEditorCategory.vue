<script lang="ts" setup>
import { nextTick } from 'vue'
import CategoryWrapper from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/CategoryWrapper.vue'
import type { TextAreaInputAttributes } from '@/components/input/types'
import TextEditor from '@/components/input/TextEditor.vue'

interface Props {
  id: string
  label: string
  shouldShowButton: boolean
  modelValue?: string
  fieldSize?: TextAreaInputAttributes['fieldSize']
  showFormattingButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  fieldSize: 'big',
  showFormattingButtons: true,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

async function focusEditor() {
  await nextTick()
  const editorElement = document.getElementById(props.id)?.firstElementChild as HTMLElement
  editorElement?.focus()
}
</script>

<template>
  <CategoryWrapper :label="label" :should-show-button="shouldShowButton" @toggled="focusEditor">
    <div class="flex flex-col">
      <label class="ris-label2-regular mb-4" :for="id">{{ label }}</label>

      <TextEditor
        :id="id"
        :aria-label="label"
        class="shadow-blue focus-within:shadow-focus hover:shadow-hover"
        editable
        :field-size="fieldSize"
        :value="modelValue"
        :show-formatting-buttons="showFormattingButtons"
        @update-value="$emit('update:modelValue', $event)"
      />
    </div>
  </CategoryWrapper>
</template>

<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import { useAutoComplete, useVerweisTypSearch } from '@/composables/useAutoComplete'
import type { VerweisTyp } from '@/domain/verweisTyp'
import { useFetchVerweisTypen } from '@/services/verweisTypService'

defineProps<{
  inputId: string
  invalid: boolean
  ariaLabel?: string
  placeholder?: string
}>()

const modelValue = defineModel<VerweisTyp | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: VerweisTyp | undefined]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const verweisTypen = ref<VerweisTyp[]>([])
const selectedVerweisTypId = ref<string | undefined>(modelValue.value?.id)

const searchFn = useVerweisTypSearch(verweisTypen)

const { suggestions, onComplete } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedVerweisTypId.value = id
  const selectedVerweisTyp = verweisTypen.value.find((vt: VerweisTyp) => vt.id === id)
  emit('update:modelValue', selectedVerweisTyp)
}

onMounted(async () => {
  const { data } = await useFetchVerweisTypen()
  verweisTypen.value = data.value?.verweisTypen || []
  if (modelValue.value) {
    const selectedRefType = verweisTypen.value.find(
      (vt: VerweisTyp) => vt.id === modelValue.value?.id,
    )
    selectedVerweisTypId.value = selectedRefType?.id
  }
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedVerweisTypId"
    :suggestions="suggestions"
    :input-id="inputId"
    :invalid="invalid"
    :initial-label="modelValue && `${modelValue.name}`"
    :aria-label="ariaLabel"
    append-to="self"
    :placeholder="placeholder"
    typeahead
    dropdown
    complete-on-focus
    :auto-option-focus="!selectedVerweisTypId"
    @update:model-value="onModelValueChange"
    @complete="onComplete"
  />
</template>

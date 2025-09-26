<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import { useAutoComplete, useReferenceTypeSearch } from '@/composables/useAutoComplete'
import type { ReferenceType } from '@/domain/referenceType'
import { useFetchReferenceTypes } from '@/services/referenceTypeService'
import { ReferenceTypeEnum, referenceTypeToLabel } from '@/domain/activeReference'

defineProps<{
  inputId: string
  invalid: boolean
  ariaLabel?: string
  placeholder?: string
}>()

const modelValue = defineModel<ReferenceTypeEnum | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: ReferenceTypeEnum | undefined]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const referenceTypes = ref<ReferenceType[]>([])
const selectedReferenceTypeId = ref<string | undefined>()

const searchFn = useReferenceTypeSearch(referenceTypes)

const { suggestions, onComplete } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedReferenceTypeId.value = id
  const selectedReferenceType = referenceTypes.value.find((c: ReferenceType) => c.id === id)
  emit('update:modelValue', selectedReferenceType?.name)
}

onMounted(async () => {
  const { data } = await useFetchReferenceTypes()
  referenceTypes.value = data.value?.referenceTypes || []
  if (modelValue.value) {
    const selectedRefType = referenceTypes.value.find(
      (c: ReferenceType) => c.name === modelValue.value,
    )
    selectedReferenceTypeId.value = selectedRefType?.id
  }
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedReferenceTypeId"
    :suggestions="suggestions"
    :input-id="inputId"
    :invalid="invalid"
    :initial-label="modelValue && `${referenceTypeToLabel[modelValue]}`"
    :aria-label="ariaLabel"
    append-to="self"
    :placeholder="placeholder"
    typeahead
    dropdown
    complete-on-focus
    :auto-option-focus="!selectedReferenceTypeId"
    @update:model-value="onModelValueChange"
    @complete="onComplete"
  />
</template>

<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import { useFetchInstitutions } from '@/services/institutionService.ts'
import { type Institution } from '@/domain/normgeber.ts'
import { useAutoComplete, useInstitutionSearch } from '@/composables/useAutoComplete'

defineProps<{
  inputId: string
  isInvalid: boolean
}>()

const modelValue = defineModel<Institution | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: Institution]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const institutions = ref<Institution[]>([])
const selectedInstitutionId = ref<string | undefined>(modelValue.value?.id)

const searchFn = useInstitutionSearch(institutions)

const { suggestions, onComplete, onDropdownClick, onItemSelect } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedInstitutionId.value = id
  const selectedInstitution = institutions.value.find((inst: Institution) => inst.id === id)
  if (selectedInstitution) {
    emit('update:modelValue', selectedInstitution)
  }
}

onMounted(async () => {
  const { data } = await useFetchInstitutions()
  institutions.value = data.value?.institutions || []
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedInstitutionId"
    :suggestions="suggestions"
    :invalid="isInvalid"
    :initial-label="modelValue?.name"
    :input-id="inputId"
    aria-label="Normgeber"
    append-to="self"
    typeahead
    dropdown
    dropdown-mode="blank"
    :auto-option-focus="!selectedInstitutionId"
    complete-on-focus
    @update:model-value="onModelValueChange"
    @complete="onComplete"
    @dropdown-click="onDropdownClick"
    @item-select="onItemSelect"
  />
</template>

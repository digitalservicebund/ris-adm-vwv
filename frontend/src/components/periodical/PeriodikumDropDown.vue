<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import { useAutoComplete, usePeriodikumSearch } from '@/composables/useAutoComplete'
import { useFetchLegalPeriodicals } from '@/services/legalPeriodicalService'
import type { Periodikum } from '@/domain/fundstelle'

defineProps<{
  inputId: string
  isInvalid: boolean
}>()

const modelValue = defineModel<Periodikum | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: Periodikum]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const periodika = ref<Periodikum[]>([])
const selectedPeriodikumId = ref<string | undefined>(modelValue.value?.id)

const searchFn = usePeriodikumSearch(periodika)

const { suggestions, onComplete, onDropdownClick, onItemSelect } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedPeriodikumId.value = id
  const selectedPeriodikum = periodika.value.find((p: Periodikum) => p.id === id)
  if (selectedPeriodikum) {
    emit('update:modelValue', selectedPeriodikum)
  }
}

onMounted(async () => {
  const { data } = await useFetchLegalPeriodicals()
  periodika.value = data.value?.legalPeriodicals || []
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedPeriodikumId"
    :suggestions="suggestions"
    :input-id="inputId"
    :invalid="isInvalid"
    :initial-label="modelValue?.title"
    aria-label="Periodikum"
    append-to="self"
    typeahead
    dropdown
    dropdown-mode="blank"
    @update:model-value="onModelValueChange"
    @complete="onComplete"
    @dropdown-click="onDropdownClick"
    @item-select="onItemSelect"
  />
</template>

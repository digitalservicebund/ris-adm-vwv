<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import type { Region } from '@/domain/normgeber.ts'
import { useFetchRegions } from '@/services/regionService.ts'
import { useAutoComplete, useRegionSearch } from '@/composables/useAutoComplete'

defineProps<{
  inputId: string
}>()

const modelValue = defineModel<Region | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: Region]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const regions = ref<Region[]>([])
const selectedRegionId = ref<string | undefined>(modelValue.value?.id)

const searchFn = useRegionSearch(regions)

const { suggestions, onComplete, onDropdownClick, onItemSelect } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedRegionId.value = id
  const selectedRegion = regions.value.find((region: Region) => region.id === id)
  if (selectedRegion) {
    emit('update:modelValue', selectedRegion)
  }
}

onMounted(async () => {
  const { data } = await useFetchRegions()
  regions.value = data.value?.regions || []
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedRegionId"
    :suggestions="suggestions"
    :input-id="inputId"
    :initial-label="modelValue?.code"
    aria-label="Region"
    append-to="self"
    typeahead
    dropdown
    dropdown-mode="blank"
    :auto-option-focus="!selectedRegionId"
    complete-on-focus
    @update:model-value="onModelValueChange"
    @complete="onComplete"
    @dropdown-click="onDropdownClick"
    @item-select="onItemSelect"
  />
</template>

<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import { useAutoComplete, useCourtSearch } from '@/composables/useAutoComplete'
import type { Court } from '@/domain/court.ts'
import { useFetchCourts } from '@/services/courtService.ts'

defineProps<{
  inputId: string
  invalid: boolean
}>()

const modelValue = defineModel<Court | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: Court | undefined]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const courts = ref<Court[]>([])
const selectedCourtId = ref<string | undefined>(modelValue.value?.id)

const searchFn = useCourtSearch(courts)

const { suggestions, onComplete } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedCourtId.value = id
  const selectedCourt = courts.value.find((c: Court) => c.id === id)
  emit('update:modelValue', selectedCourt)
}

onMounted(async () => {
  const { data } = await useFetchCourts()
  courts.value = data.value?.courts || []
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedCourtId"
    :suggestions="suggestions"
    :input-id="inputId"
    :invalid="invalid"
    :initial-label="modelValue && `${modelValue.type} ${modelValue.location}`"
    aria-label="Gericht Aktivzitierung"
    append-to="self"
    typeahead
    dropdown
    complete-on-focus
    :auto-option-focus="!selectedCourtId"
    @update:model-value="onModelValueChange"
    @complete="onComplete"
  />
</template>

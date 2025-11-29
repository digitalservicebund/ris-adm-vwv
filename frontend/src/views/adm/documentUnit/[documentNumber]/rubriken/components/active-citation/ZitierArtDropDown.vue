<script setup lang="ts">
import { RisAutoComplete } from '@digitalservicebund/ris-ui/components'
import { onMounted, ref } from 'vue'
import { useAutoComplete, useZitierArtSearch } from '@/composables/useAutoComplete'
import { useFetchZitierArten } from '@/services/zitierArtService'
import type { ZitierArt } from '@/domain/zitierArt'

defineProps<{
  inputId: string
  invalid: boolean
}>()

const modelValue = defineModel<ZitierArt | undefined>()
const emit = defineEmits<{
  'update:modelValue': [value: ZitierArt | undefined]
}>()

const autoComplete = ref<typeof RisAutoComplete | null>(null)
const zitierArten = ref<ZitierArt[]>([])
const selectedZitierArtId = ref<string | undefined>(modelValue.value?.id)

const searchFn = useZitierArtSearch(zitierArten)

const { suggestions, onComplete } = useAutoComplete(searchFn)

function onModelValueChange(id: string | undefined) {
  selectedZitierArtId.value = id
  const selectedZitierArt = zitierArten.value.find((za: ZitierArt) => za.id === id)
  emit('update:modelValue', selectedZitierArt)
}

onMounted(async () => {
  const { data } = await useFetchZitierArten()
  zitierArten.value = data.value?.zitierArten || []
})
</script>

<template>
  <RisAutoComplete
    ref="autoComplete"
    :model-value="selectedZitierArtId"
    :suggestions="suggestions"
    :input-id="inputId"
    :invalid="invalid"
    :initial-label="modelValue && `${modelValue.label}`"
    aria-label="Art der Zitierung"
    append-to="self"
    typeahead
    dropdown
    complete-on-focus
    :auto-option-focus="!selectedZitierArtId"
    @update:model-value="onModelValueChange"
    @complete="onComplete"
  />
</template>

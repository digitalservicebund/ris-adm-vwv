<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'
import { RisChipsInput } from '@digitalservicebund/ris-ui/components'
import InputField from './input/InputField.vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'

const store = useDocumentUnitStore()

const titelAspekt = computed({
  get: () => store.documentUnit!.titelAspekt ?? [],
  set: (newValues: string[]) => {
    store.documentUnit!.titelAspekt = newValues
  },
})

const showChips = ref(false)
</script>

<template>
  <InputField v-if="titelAspekt.length > 0 || showChips" id="titelAspekt" label="Titelaspekt">
    <RisChipsInput id="titelAspekt" v-model="titelAspekt" aria-label="Titelaspekt"></RisChipsInput>
  </InputField>
  <Button
    v-else
    aria-label="Titelaspekt hinzufügen"
    class="self-start"
    label="Titelaspekt"
    size="small"
    severity="secondary"
    @click="showChips = true"
  >
    <template #icon> <IconAdd /> </template>
  </Button>
</template>

<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import { RisChipsInput } from '@digitalservicebund/ris-ui/components'
import InputField from '@/components/input/InputField.vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'

const store = useAdmDocUnitStore()

const titelAspekte = computed({
  get: () => store.documentUnit!.titelAspekte ?? [],
  set: (newValues: string[]) => {
    store.documentUnit!.titelAspekte = newValues
  },
})

const showChips = ref(false)
</script>

<template>
  <InputField v-if="titelAspekte.length > 0 || showChips" id="titelAspekt" label="Titelaspekt">
    <RisChipsInput
      inputId="titelAspekt"
      v-model="titelAspekte"
      aria-label="Titelaspekt"
    ></RisChipsInput>
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

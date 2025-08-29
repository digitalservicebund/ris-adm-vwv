<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'
import { RisChipsInput } from '@digitalservicebund/ris-ui/components'
import InputField from './input/InputField.vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'

const store = useDocumentUnitStore()

const definitions = computed({
  get: () => store.documentUnit!.definitions?.map((d) => d.begriff) ?? [],
  set: (newValues: string[]) => {
    store.documentUnit!.definitions = newValues.map((begriff) => ({ begriff }))
  },
})

const showChips = ref(false)
</script>

<template>
  <InputField v-if="definitions.length > 0 || showChips" id="definition" label="Definition">
    <RisChipsInput id="definition" v-model="definitions" aria-label="Definition"></RisChipsInput>
  </InputField>
  <Button
    v-else
    aria-label="Definition hinzufügen"
    class="self-start"
    label="Definition"
    size="small"
    severity="secondary"
    @click="showChips = true"
  >
    <template #icon> <IconAdd /> </template>
  </Button>
</template>

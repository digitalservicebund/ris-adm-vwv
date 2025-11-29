<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import { RisChipsInput } from '@digitalservicebund/ris-ui/components'
import InputField from '@/components/input/InputField.vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'

const store = useAdmDocUnitStore()

const definitionen = computed({
  get: () => store.documentUnit!.definitionen?.map((d) => d.begriff) ?? [],
  set: (newValues: string[]) => {
    store.documentUnit!.definitionen = newValues.map((begriff) => ({ begriff }))
  },
})

const showChips = ref(false)
</script>

<template>
  <InputField v-if="definitionen.length > 0 || showChips" id="definition" label="Definition">
    <RisChipsInput
      inputId="definition"
      v-model="definitionen"
      aria-label="Definition"
    ></RisChipsInput>
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

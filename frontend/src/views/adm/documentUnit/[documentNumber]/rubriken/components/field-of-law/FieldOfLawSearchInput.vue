<script setup lang="ts">
import InputField from '@/components/input/InputField.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconSearch from '~icons/ic/baseline-search'

defineProps<{
  errorLabel?: string
}>()

const emit = defineEmits<{
  search: [void]
}>()

const identifier = defineModel<string>('identifier')
const description = defineModel<string>('description')
const norm = defineModel<string>('norm')
</script>

<template>
  <div class="flex w-full flex-col">
    <div class="flex w-full flex-row items-end gap-16">
      <InputField id="fieldOfLawIdentifierInput" v-slot="slotProps" label="Sachgebiet">
        <InputText
          :id="slotProps.id"
          v-model="identifier"
          aria-label="Sachgebietskürzel"
          size="small"
          fluid
          @keyup.enter="emit('search')"
        />
      </InputField>
      <InputField id="fieldOfLawDescriptionInput" v-slot="slotProps" label="Bezeichnung">
        <InputText
          :id="slotProps.id"
          v-model="description"
          aria-label="Sachgebietsbezeichnung"
          size="small"
          fluid
          @keyup.enter="emit('search')"
        />
      </InputField>
      <InputField id="fieldOfLawNormInput" v-slot="slotProps" label="Norm">
        <InputText
          :id="slotProps.id"
          v-model="norm"
          aria-label="Sachgebietsnorm"
          size="small"
          fluid
          @keyup.enter="emit('search')"
        />
      </InputField>

      <Button aria-label="Sachgebietssuche ausführen" @click="emit('search')">
        <template #icon> <IconSearch /> </template>
      </Button>
    </div>

    <span v-if="errorLabel" class="ris-label3-regular min-h-[1rem] text-red-800">{{
      errorLabel
    }}</span>
  </div>
</template>

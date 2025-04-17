<script setup lang="ts">
import InputField from '@/components/input/InputField.vue'
import TextButton from '@/components/input/TextButton.vue'
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
      <InputField id="fieldOfLawIdentifierInput" label="Sachgebiet">
        <InputText
          id="fieldOfLawIdentifierInput"
          v-model="identifier"
          aria-label="Sachgebietskürzel"
          size="small"
          fluid
          @keyup.enter="emit('search')"
        />
      </InputField>
      <InputField id="fieldOfLawDescriptionInput" label="Bezeichnung">
        <InputText
          id="fieldOfLawDescriptionInput"
          v-model="description"
          aria-label="Sachgebietsbezeichnung"
          size="small"
          fluid
          @keyup.enter="emit('search')"
        />
      </InputField>
      <InputField id="fieldOfLawNormInput" label="Norm">
        <InputText
          id="fieldOfLawNormInput"
          v-model="norm"
          aria-label="Sachgebietsnorm"
          size="small"
          fluid
          @keyup.enter="emit('search')"
        />
      </InputField>

      <TextButton
        aria-label="Sachgebietssuche ausführen"
        button-type="primary"
        :icon="IconSearch"
        @click="emit('search')"
      />
    </div>

    <span v-if="errorLabel" class="ris-label3-regular min-h-[1rem] text-red-800">{{
      errorLabel
    }}</span>
  </div>
</template>

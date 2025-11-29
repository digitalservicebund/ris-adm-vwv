<script lang="ts" setup>
import InputField from '@/components/input/InputField.vue'
import { Textarea } from 'primevue'

const hauptsachtitel = defineModel<string>('hauptsachtitel')
const hauptsachtitelZusatz = defineModel<string>('hauptsachtitelZusatz')
const dokumentarischerTitel = defineModel<string>('dokumentarischerTitel')
</script>

<template>
  <div class="flex flex-col w-full gap-24">
    <InputField id="hauptsachtitel" v-slot="slotProps" label="Hauptsachtitel *">
      <Textarea
        :id="slotProps.id"
        v-model="hauptsachtitel"
        :disabled="dokumentarischerTitel !== ''"
        aria-label="Hauptsachtitel"
        rows="1"
        auto-resize
        fluid
      />
    </InputField>
    <InputField id="hauptsachtitelZusatz" v-slot="slotProps" label="Zusatz zum Hauptsachtitel">
      <Textarea
        :id="slotProps.id"
        v-model="hauptsachtitelZusatz"
        :disabled="dokumentarischerTitel !== ''"
        aria-label="Zusatz zum Hauptsachtitel"
        rows="1"
        auto-resize
        fluid
      />
    </InputField>
    <InputField id="dokumentarischerTitel" v-slot="slotProps" label="Dokumentarischer Titel *">
      <Textarea
        :id="slotProps.id"
        v-model="dokumentarischerTitel"
        :disabled="hauptsachtitel !== '' || hauptsachtitelZusatz !== ''"
        aria-label="Dokumentarischer Titel"
        rows="1"
        auto-resize
        fluid
      />
    </InputField>
  </div>
</template>

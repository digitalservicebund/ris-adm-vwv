<script setup lang="ts">
import LazyFieldToggle from './LazyFieldToggle.vue'
import InputField from '@/components/input/InputField.vue'
import { Textarea } from 'primevue'
import { ref, watch, useId, computed } from 'vue'

const hauptsachtitel = defineModel<string>('hauptsachtitel')
const hauptsachtitelZusatz = defineModel<string>('hauptsachtitelZusatz')
const dokumentarischerTitel = defineModel<string>('dokumentarischerTitel')
const showDokumentarischerTitel = ref(!!dokumentarischerTitel.value)

watch(dokumentarischerTitel, (value) => {
  const normalized = (value ?? '').trim()
  if (normalized.length > 0) {
    showDokumentarischerTitel.value = true
  }
})

function handleDokumentarischerTitelBlur() {
  const normalized = (dokumentarischerTitel.value ?? '').trim()
  dokumentarischerTitel.value = normalized
  if (!normalized) {
    showDokumentarischerTitel.value = false
  }
}

const baseId = useId()
const hauptsachtitelId = `${baseId}-hauptsachtitel`
const dokumentarischerTitelId = `${baseId}-dokumentarisch`
const hauptsachtitelZusatzId = `${baseId}-hauptsachtitel-zusatz`

const normalizedHauptsachtitel = computed(() => (hauptsachtitel.value ?? '').trim())
const normalizedHauptsachtitelZusatz = computed(() => (hauptsachtitelZusatz.value ?? '').trim())
const normalizedDokumentarischerTitel = computed(() => (dokumentarischerTitel.value ?? '').trim())
</script>

<template>
  <div class="flex flex-col gap-24">
    <InputField :id="hauptsachtitelId" label="Hauptsachtitel *">
      <Textarea
        :id="hauptsachtitelId"
        v-model="hauptsachtitel"
        :disabled="!!normalizedDokumentarischerTitel"
        auto-resize
        rows="1"
        fluid
      />
    </InputField>
    <InputField :id="hauptsachtitelZusatzId" label="Zusatz zum Hauptsachtitel">
      <Textarea
        :id="hauptsachtitelZusatzId"
        v-model="hauptsachtitelZusatz"
        :disabled="!!normalizedDokumentarischerTitel"
        rows="1"
        auto-resize
        fluid
      />
    </InputField>
    <LazyFieldToggle
      :input-id="dokumentarischerTitelId"
      button-label="Dokumentarischer Titel"
      v-model:visible="showDokumentarischerTitel"
      :disabled="!!normalizedHauptsachtitel || !!normalizedHauptsachtitelZusatz"
    >
      <InputField :id="dokumentarischerTitelId" label="Dokumentarischer Titel *">
        <Textarea
          :id="dokumentarischerTitelId"
          v-model="dokumentarischerTitel"
          :disabled="!!normalizedHauptsachtitel || !!normalizedHauptsachtitelZusatz"
          auto-resize
          rows="1"
          fluid
          @blur="handleDokumentarischerTitelBlur"
        />
      </InputField>
    </LazyFieldToggle>
  </div>
</template>

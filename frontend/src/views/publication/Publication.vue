<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import Button from 'primevue/button'
import IconCheck from '~icons/material-symbols/check'
import { Message } from 'primevue'

defineProps<{
  isLoading: boolean
  isPublished: boolean
  isDisabled: boolean
  error: Error | null
}>()

defineEmits<{
  publish: [void]
}>()
</script>

<template>
  <div>
    <Message class="mb-24" severity="info">
      <span class="ris-label2-bold">Hinweise zur Veröffentlichung</span>
      <ul class="list-disc list-inside">
        <li>Aktuell befindet sich diese Dokumentationsumgebung im Testmodus.</li>
        <li>
          Ein Klick auf „Zur Veröffentlichung freigeben‟ hat keinerlei Auswirkungen auf die Daten in
          der jDV.
        </li>
        <li>
          Das Ziel ist das Veranschaulichen des zukünftigen Prozess der Abgabe an die
          NeuRIS-Datenbank.
        </li>
      </ul>
    </Message>
    <Message v-if="isPublished && !error" class="mb-24" severity="success">
      <p>Freigabe ist abgeschlossen.</p>
    </Message>
    <Message v-if="error" class="mb-24" severity="error">
      <p>Die Freigabe ist aus technischen Gründen nicht durchgeführt worden.</p>
    </Message>
    <div class="flex flex-row">
      <Button
        :disabled="isDisabled"
        label="Zur Veröffentlichung freigeben"
        :loading="isLoading"
        :text="false"
        @click="$emit('publish')"
      >
        <template #icon>
          <IconCheck />
        </template>
      </Button>
    </div>
  </div>
</template>

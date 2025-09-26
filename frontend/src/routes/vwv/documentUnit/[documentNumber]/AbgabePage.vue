<script setup lang="ts">
import Button from 'primevue/button'
import IconCheck from '~icons/material-symbols/check'
import TitleElement from '@/components/TitleElement.vue'
import { computed } from 'vue'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'
import type { DocumentUnit } from '@/domain/documentUnit'
import { missingDocumentUnitFields } from '@/utils/validators'
import Plausibilitaetspruefung from '@/components/publication/Plausibilitaetspruefung.vue'
import { Message } from 'primevue'
import { usePutPublishDocUnit } from '@/services/documentUnitService'

const store = useDocumentUnitStore()

const missingFields = computed(() => missingDocumentUnitFields(store.documentUnit as DocumentUnit))

const { error, execute, isFetching, isFinished } = usePutPublishDocUnit(
  store.documentUnit as DocumentUnit,
)

async function onClickPublish() {
  await execute()
}
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col p-24">
    <div aria-label="Abgabe" class="flex flex-col bg-white p-24">
      <TitleElement class="mb-24">Abgabe</TitleElement>
      <Plausibilitaetspruefung :missing-fields="missingFields" />
      <hr class="text-blue-500 my-24" />
      <Message class="mb-24" severity="info">
        <span class="ris-label2-bold">Hinweise zur Veröffentlichung</span>
        <ul class="list-disc list-inside">
          <li>Aktuell befindet sich diese Dokumentationsumgebung im Testmodus.</li>
          <li>
            Ein Klick auf „Zur Veröffentlichung freigeben‟ hat keinerlei Auswirkungen auf die Daten
            in der jDV.
          </li>
          <li>
            Das Ziel ist das Veranschaulichen des zukünftigen Prozess der Abgabe an die
            NeuRIS-Datenbank.
          </li>
        </ul>
      </Message>
      <Message v-if="isFinished && !error" class="mb-24" severity="success">
        <p>Freigabe ist abgeschlossen.</p>
      </Message>
      <Message v-if="isFinished && error" class="mb-24" severity="error">
        <p>Die Freigabe ist aus technischen Gründen nicht durchgeführt worden.</p>
      </Message>
      <div class="flex flex-row">
        <Button
          :disabled="missingFields.length > 0"
          label="Zur Veröffentlichung freigeben"
          :loading="isFetching"
          :text="false"
          @click="onClickPublish"
        >
          <template #icon>
            <IconCheck />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

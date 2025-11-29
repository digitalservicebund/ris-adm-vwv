<script lang="ts" setup>
import TitleElement from '@/components/TitleElement.vue'
import InputField from '@/components/input/InputField.vue'
import { useStoreForRoute } from '@/composables/useStoreForRoute'
import type { useUliDocumentUnitStore } from '@/stores/uliDocStore'
import DokumentTyp from '@/views/literature/DokumentTyp.vue'
import { DocumentCategory } from '@/domain/documentType'
import TitelSection from './TitelSection.vue'
import { useScrollToHash } from '@/composables/useScrollToHash'
import InputText from 'primevue/inputtext'
import { useLiteratureRubriken } from '@/views/literature/useLiteratureRubriken'

const store = useStoreForRoute<ReturnType<typeof useUliDocumentUnitStore>>()
const {
  veroeffentlichungsjahr,
  dokumenttypen,
  hauptsachtitel,
  dokumentarischerTitel,
  hauptsachtitelZusatz,
} = useLiteratureRubriken(store)

useScrollToHash()
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col gap-24 p-24">
    <div id="formaldaten" aria-label="Formaldaten" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Formaldaten</TitleElement>
      <div class="flex flex-row gap-24">
        <InputField id="dokumenttypen" v-slot="slotProps" label="Dokumenttyp *">
          <DokumentTyp
            inputId="dokumenttypen"
            v-model="dokumenttypen"
            aria-label="Dokumenttyp"
            :invalid="slotProps.hasError"
            :document-category="DocumentCategory.LITERATUR_UNSELBSTAENDIG"
          />
        </InputField>
        <InputField id="veroeffentlichungsjahr" v-slot="slotProps" label="Veröffentlichungsjahr *">
          <InputText
            :id="slotProps.id"
            v-model="veroeffentlichungsjahr"
            aria-label="Veröffentlichungsjahr"
            :invalid="slotProps.hasError"
            fluid
          />
        </InputField>
      </div>
      <TitelSection
        v-model:hauptsachtitel="hauptsachtitel"
        v-model:hauptsachtitel-zusatz="hauptsachtitelZusatz"
        v-model:dokumentarischer-titel="dokumentarischerTitel"
      />
      <div>
        <p class="relative pl-12 before:content-['*'] before:absolute before:left-0">
          Pflichtfelder für die Veröffentlichung
        </p>
        <p class="pl-12">
          Hinweis: Hauptsachtitel oder Dokumentarischer Titel muss für die Veröffentlichung erfasst
          werden
        </p>
      </div>
    </div>
  </div>
</template>

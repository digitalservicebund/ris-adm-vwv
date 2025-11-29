<script lang="ts" setup>
import { computed } from 'vue'
import ComboboxInput from '@/views/adm/documentUnit/[documentNumber]/ComboboxInput.vue'
import TitleElement from '@/components/TitleElement.vue'
import InputField from '@/components/input/InputField.vue'
import DateInput from '@/components/input/DateInput.vue'
import ComboboxItemService from '@/services/comboboxItemService.ts'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import KeyWords from './components/KeyWords.vue'
import TextEditorCategory from './components/texts/TextEditorCategory.vue'
import NormReferences from './components/norm-reference/NormReferences.vue'
import ActiveReferences from './components/active-reference/ActiveReferences.vue'
import ActiveCitations from './components/active-citation/ActiveCitations.vue'
import FieldsOfLaw from './components/field-of-law/FieldsOfLaw.vue'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import NormgeberList from './components/normgeber/NormgeberList.vue'
import type { DocumentType } from '@/domain/documentType'
import ZitierdatenInput from './components/ZitierdatenInput.vue'
import { RisChipsInput } from '@digitalservicebund/ris-ui/components'
import Berufsbild from './components/Berufsbild.vue'
import TitelAspekt from './components/TitelAspekt.vue'
import Definitionen from './components/Definitionen.vue'
import { useScrollToHash } from '@/composables/useScrollToHash'

const store = useAdmDocUnitStore()

const langueberschrift = computed({
  get: () => store.documentUnit!.langueberschrift,
  set: (newValue) => {
    store.documentUnit!.langueberschrift = newValue
  },
})

const inkrafttretedatum = computed({
  get: () => store.documentUnit!.inkrafttretedatum,
  set: (newValue) => {
    store.documentUnit!.inkrafttretedatum = newValue
  },
})

const ausserkrafttretedatum = computed({
  get: () => store.documentUnit!.ausserkrafttretedatum,
  set: (newValue) => {
    store.documentUnit!.ausserkrafttretedatum = newValue
  },
})

const gliederung = computed({
  get: () => store.documentUnit!.gliederung,
  set: (newValue) => {
    store.documentUnit!.gliederung = newValue
  },
})

const kurzreferat = computed({
  get: () => store.documentUnit!.kurzreferat,
  set: (newValue) => {
    store.documentUnit!.kurzreferat = newValue
  },
})

const aktenzeichen = computed({
  get: () => store.documentUnit!.aktenzeichen || [],
  set: (newValue) => {
    store.documentUnit!.aktenzeichen = newValue
  },
})

const dokumenttyp = computed({
  get: () =>
    store.documentUnit?.dokumenttyp
      ? {
          label: store.documentUnit.dokumenttyp.name,
          value: store.documentUnit.dokumenttyp,
          additionalInformation: store.documentUnit.dokumenttyp.abbreviation,
        }
      : undefined,
  set: (newValue: DocumentType) => {
    store.documentUnit!.dokumenttyp = newValue
  },
})

const dokumenttypZusatz = computed({
  get: () => store.documentUnit!.dokumenttypZusatz,
  set: (newValue) => {
    store.documentUnit!.dokumenttypZusatz = newValue
  },
})

useScrollToHash()
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col gap-24 p-24">
    <div id="formaldaten" aria-label="Formaldaten" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Formaldaten</TitleElement>
      <div class="flex flex-row gap-24">
        <InputField id="langueberschrift" v-slot="slotProps" label="Amtl. Langüberschrift *">
          <Textarea
            :id="slotProps.id"
            class="w-full"
            v-model="langueberschrift"
            v-bind="{
              autoResize: true,
            }"
          />
        </InputField>
      </div>
      <div class="flex flex-row gap-24">
        <ZitierdatenInput />
      </div>
      <div class="border-b-1 border-b-gray-400"></div>
      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <NormgeberList id="normgeberList" />
        </div>
      </div>
      <div class="border-b-1 border-b-gray-400"></div>
      <div class="flex flex-row gap-24">
        <InputField id="dokumenttyp" v-slot="slotProps" label="Dokumenttyp *">
          <ComboboxInput
            :id="slotProps.id"
            v-model="dokumenttyp"
            aria-label="Dokumenttyp"
            :item-service="ComboboxItemService.getDocumentTypes"
          ></ComboboxInput>
        </InputField>
        <InputField id="documentTypeLongText" v-slot="slotProps" label="Dokumenttyp Zusatz">
          <InputText
            :id="slotProps.id"
            v-model="dokumenttypZusatz"
            aria-label="Dokumenttyp Zusatz"
            :invalid="false"
            fluid
          />
        </InputField>
      </div>

      <div class="flex flex-row gap-24">
        <InputField
          id="inkrafttretedatum"
          label="Datum des Inkrafttretens *"
          class="w-full min-w-0"
          v-slot="slotProps"
        >
          <DateInput
            :id="slotProps.id"
            v-model="inkrafttretedatum"
            ariaLabel="Inkrafttretedatum"
            class="ds-input-medium"
            is-future-date
            :has-error="slotProps.hasError"
            @update:validation-error="slotProps.updateValidationError"
          ></DateInput>
        </InputField>
        <InputField
          id="ausserkrafttretedatum"
          label="Datum des Ausserkrafttretens"
          class="w-full min-w-0"
          v-slot="slotProps"
        >
          <DateInput
            :id="slotProps.id"
            v-model="ausserkrafttretedatum"
            ariaLabel="Ausserkrafttretedatum"
            class="ds-input-medium"
            is-future-date
            :has-error="slotProps.hasError"
            @update:validation-error="slotProps.updateValidationError"
          ></DateInput>
        </InputField>
      </div>

      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <InputField id="aktenzeichen" label="Aktenzeichen">
            <RisChipsInput
              inputId="aktenzeichen"
              v-model="aktenzeichen"
              aria-label="Aktenzeichen"
            ></RisChipsInput>
          </InputField>
        </div>
      </div>

      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <TitelAspekt />
        </div>
      </div>

      <div class="mt-4">* Pflichtfelder für die Veröffentlichung</div>
    </div>

    <div id="gliederung" aria-label="Gliederung" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Gliederung</TitleElement>
      <div class="flex flex-row gap-24">
        <div class="gap-0 w-full">
          <TextEditorCategory
            id="gliederung-text-editor"
            v-model="gliederung"
            :editable="true"
            label="Gliederung"
            :should-show-button="false"
            :show-formatting-buttons="false"
            field-size="big"
          />
        </div>
      </div>
    </div>

    <div
      id="inhaltlicheErschliessung"
      aria-label="Inhaltliche Erschließung"
      class="flex flex-col gap-24 bg-white p-24"
    >
      <TitleElement>Inhaltliche Erschließung</TitleElement>
      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <KeyWords data-testid="keywords" />
        </div>
      </div>
      <div class="border-b-1 border-b-gray-400"></div>

      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <FieldsOfLaw />
        </div>
      </div>
      <div class="border-b-1 border-b-gray-400"></div>

      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <NormReferences data-testid="normReferences" />
        </div>
      </div>
      <div class="border-b-1 border-b-gray-400"></div>
      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <ActiveReferences data-testid="activeReferences" />
        </div>
      </div>
      <div class="border-b-1 border-b-gray-400"></div>
      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <ActiveCitations data-testid="activeCitations" />
        </div>
      </div>

      <div class="border-b-1 border-b-gray-400"></div>

      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <h2 class="ris-label1-bold mb-16">Weitere Rubriken</h2>
          <Berufsbild />
        </div>
      </div>

      <div class="flex flex-row gap-24 w-full">
        <div class="flex flex-col w-full">
          <Definitionen />
        </div>
      </div>
    </div>

    <div id="kurzreferat" aria-label="Kurzreferat" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Kurzreferat</TitleElement>
      <div class="flex flex-row gap-24">
        <div class="gap-0 w-full">
          <TextEditorCategory
            id="kurzreferat-text-editor"
            v-model="kurzreferat"
            :editable="true"
            label="Kurzreferat"
            :should-show-button="false"
            :show-formatting-buttons="false"
            field-size="big"
          />
        </div>
      </div>
    </div>
  </div>
</template>

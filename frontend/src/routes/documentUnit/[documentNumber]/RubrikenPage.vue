<script lang="ts" setup>
import { computed } from 'vue'
import ComboboxInput from '@/components/ComboboxInput.vue'
import TitleElement from '@/components/TitleElement.vue'
import InputField, { LabelPosition } from '@/components/input/InputField.vue'
import DateInput from '@/components/input/DateInput.vue'
import ComboboxItemService from '@/services/comboboxItemService.ts'
import Textarea from 'primevue/textarea'
import TextInput from '@/components/input/TextInput.vue'
import ChipsInput from '@/components/input/ChipsInput.vue'
import CheckboxInput from '@/components/input/CheckboxInput.vue'
import KeyWords from '@/components/KeyWords.vue'
import TextEditorCategory from '@/components/texts/TextEditorCategory.vue'
import NormReferences from '@/components/NormReferences.vue'
import ActiveReferences from '@/components/ActiveReferences.vue'
import ActiveCitations from '@/components/ActiveCitations.vue'
import FieldsOfLaw from '@/components/field-of-law/FieldsOfLaw.vue'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'

const store = useDocumentUnitStore()

const langueberschrift = computed({
  get: () => store.documentUnit!.langueberschrift,
  set: (newValue) => {
    store.documentUnit!.langueberschrift = newValue
  },
})

const zitierdatum = computed({
  get: () => store.documentUnit!.zitierdatum,
  set: (newValue) => {
    store.documentUnit!.zitierdatum = newValue
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
  get: () => store.documentUnit!.aktenzeichen,
  set: (newValue) => {
    store.documentUnit!.aktenzeichen = newValue
  },
})

const noAktenzeichenElementId = 'noAktenzeichenID'
const noAktenzeichen = computed({
  get: () => store.documentUnit!.noAktenzeichen,
  set: (newValue) => {
    store.documentUnit!.noAktenzeichen = newValue
  },
})

const normgeber = computed({
  get: () => store.documentUnit!.normgeber,
  set: (newValue) => {
    store.documentUnit!.normgeber = newValue
  },
})

const dokumenttyp = computed({
  get: () => store.documentUnit!.dokumenttyp,
  set: (newValue) => {
    store.documentUnit!.dokumenttyp = newValue
  },
})

const dokumenttypZusatz = computed({
  get: () => store.documentUnit!.dokumenttypZusatz,
  set: (newValue) => {
    store.documentUnit!.dokumenttypZusatz = newValue
  },
})
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col gap-24 p-24">
    <div id="formaldaten" aria-label="Formaldaten" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Formaldaten</TitleElement>
      <div class="flex flex-row gap-24">
        <InputField
          id="zitierdatum"
          label="Zitierdatum *"
          class="w-full min-w-0"
          v-slot="slotProps"
        >
          <DateInput
            id="zitierdatum"
            v-model="zitierdatum"
            ariaLabel="Zitierdatum"
            class="ds-input-medium"
            :has-error="slotProps.hasError"
            @update:validation-error="slotProps.updateValidationError"
          ></DateInput>
        </InputField>
        <InputField id="courtInput" label="Normgeber *" class="w-full">
          <ComboboxInput
            id="courtInput"
            v-model="normgeber"
            aria-label="Normgeber"
            clear-on-choosing-item
            :has-error="false"
            :item-service="ComboboxItemService.getCourts"
          ></ComboboxInput>
        </InputField>
      </div>
      <div class="flex flex-row gap-24">
        <InputField id="langue" label="Amtl. Langüberschrift *">
          <Textarea
            id="langue"
            class="w-full"
            v-model="langueberschrift"
            v-bind="{
              autoResize: true,
            }"
          />
        </InputField>
      </div>
      <div class="border-b-1 border-b-gray-400"></div>
      <div class="flex flex-row gap-24">
        <InputField id="documentType" label="Dokumenttyp *">
          <ComboboxInput
            id="documentType"
            v-model="dokumenttyp"
            aria-label="Dokumenttyp"
            :item-service="ComboboxItemService.getDocumentTypes"
          ></ComboboxInput>
        </InputField>
        <InputField id="documentTypeLongText" label="Dokumenttyp Zusatz *">
          <TextInput
            id="documentTypeLongText"
            v-model="dokumenttypZusatz"
            ariaLabel="Dokumenttyp Zusatz"
            :has-error="false"
            size="medium"
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
            id="inkrafttretedatum"
            v-model="inkrafttretedatum"
            ariaLabel="Inkrafttretedatum"
            class="ds-input-medium"
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
            id="ausserkrafttretedatum"
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
          <InputField id="aktenzeichen" label="Aktenzeichen *">
            <ChipsInput
              id="aktenzeichen"
              v-model="aktenzeichen"
              aria-label="Aktenzeichen"
            ></ChipsInput>
          </InputField>
        </div>
        <div class="flex flex-col pt-[30px] w-full">
          <InputField
            :id="noAktenzeichenElementId"
            label="kein Aktenzeichen"
            label-class="ris-label1-regular"
            :label-position="LabelPosition.RIGHT"
          >
            <CheckboxInput
              :id="noAktenzeichenElementId"
              v-model="noAktenzeichen"
              aria-label="Kein Aktenzeichen"
              size="small"
            />
          </InputField>
        </div>
      </div>

      <div class="mt-4">* Pflichtfelder für die Veröffentlichung</div>
    </div>

    <div id="gliederung" aria-label="Gliederung" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Gliederung</TitleElement>
      <div class="flex flex-row gap-24">
        <div class="gap-0 w-full">
          <TextEditorCategory
            id="gliederung"
            v-model="gliederung"
            :editable="true"
            label="Gliederung"
            :should-show-button="false"
            :show-formatting-buttons="false"
            field-size="small"
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
    </div>

    <div id="kurzreferat" aria-label="Kurzreferat" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Kurzreferat</TitleElement>
      <div class="flex flex-row gap-24">
        <div class="gap-0 w-full">
          <TextEditorCategory
            id="kurzreferat"
            v-model="kurzreferat"
            :editable="true"
            label="Kurzreferat"
            :should-show-button="false"
            :show-formatting-buttons="false"
            field-size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

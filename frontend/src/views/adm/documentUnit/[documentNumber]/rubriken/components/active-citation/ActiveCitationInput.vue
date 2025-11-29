<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { type ValidationError } from '@/components/input/types'
import SearchResultList, {
  type SearchResults,
} from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/SearchResultList.vue'
import ComboboxInput from '@/views/adm/documentUnit/[documentNumber]/ComboboxInput.vue'
import DateInput from '@/components/input/DateInput.vue'
import InputField from '@/components/input/InputField.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Pagination, { type Page } from '@/components/Pagination.vue'
import { useValidationStore } from '@/composables/useValidationStore'
import ActiveCitation from '@/domain/activeCitation'
import { type ZitierArt } from '@/domain/zitierArt.ts'
import RelatedDocumentation from '@/domain/relatedDocumentation'
import ComboboxItemService from '@/services/comboboxItemService'
import type { DocumentType } from '@/domain/documentType'
import CourtDropDown from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/CourtDropDown.vue'
import ZitierArtDropDown from './ZitierArtDropDown.vue'

const props = defineProps<{
  modelValue?: ActiveCitation
  modelValueList?: ActiveCitation[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ActiveCitation]
  addEntry: [void]
  cancelEdit: [void]
  removeEntry: [value?: boolean]
}>()

const lastSearchInput = ref(new ActiveCitation())
const lastSavedModelValue = ref(new ActiveCitation({ ...props.modelValue }))
const activeCitation = ref(new ActiveCitation({ ...props.modelValue }))

const validationStore = useValidationStore<(typeof ActiveCitation.fields)[number]>()
const isLoading = ref(false)

const activeCitationDocumentType = computed({
  get: () =>
    activeCitation?.value?.documentType
      ? {
          label: activeCitation.value.documentType.name,
          value: activeCitation.value.documentType,
          additionalInformation: activeCitation.value.documentType.abbreviation,
        }
      : undefined,
  set: (newValue: DocumentType) => {
    activeCitation.value.documentType = newValue
  },
})

const searchResultsCurrentPage = ref<Page>()
const searchResults = ref<SearchResults<RelatedDocumentation>>()

async function search() {
  isLoading.value = true
  const activeCitationRef = new ActiveCitation({
    ...activeCitation.value,
  })

  if (activeCitationRef.citationType) {
    delete activeCitationRef['citationType']
  }

  const response = {
    status: 200,
    data: {
      activeCitations: [
        new ActiveCitation({
          uuid: '123',
          court: {
            id: 'courtId',
            type: 'type1',
            location: 'location1',
          },
          decisionDate: '2022-02-01',
          documentType: {
            abbreviation: 'VV',
            name: 'Verwaltungsvorschrift',
          },
          fileNumber: 'test fileNumber1',
        }),
      ],
      page: {
        size: 1,
        number: 0,
        numberOfElements: 1,
        totalElements: 20,
        first: true,
        last: false,
        empty: false,
      },
    },
  }
  if (response.data) {
    searchResultsCurrentPage.value = response.data.page
    searchResults.value = response.data.activeCitations.map((searchResult) => {
      return {
        decision: new RelatedDocumentation({ ...searchResult }),
        isLinked: searchResult.isLinkedWith(props.modelValueList),
      }
    })
  } else {
    searchResultsCurrentPage.value = undefined
    searchResults.value = undefined
  }
  lastSearchInput.value = activeCitationRef
  isLoading.value = false
}

function validateRequiredInput() {
  validationStore.reset()

  for (const missingField of activeCitation.value.missingRequiredFields) {
    validationStore.add('Pflichtfeld nicht befüllt', missingField)
  }
}

async function addActiveCitation() {
  if (
    !validationStore.getByMessage('Kein valides Datum').length &&
    !validationStore.getByMessage('Unvollständiges Datum').length &&
    !validationStore.getByMessage('Das Datum darf nicht in der Zukunft liegen').length
  ) {
    await validateRequiredInput()
    emit('update:modelValue', activeCitation.value as ActiveCitation)
    emit('addEntry')
  }
}

async function addActiveCitationFromSearch(decision: RelatedDocumentation) {
  const newActiveCitationType = {
    ...activeCitation.value.citationType,
  } as ZitierArt
  activeCitation.value = new ActiveCitation({
    ...decision,
    citationType: newActiveCitationType,
  })
  emit('update:modelValue', activeCitation.value as ActiveCitation)
  emit('addEntry')
  // await scrollIntoViewportById('activeCitations')
}

function updateDateFormatValidation(validationError: ValidationError | undefined) {
  if (validationError) validationStore.add(validationError.message, 'decisionDate')
  else validationStore.remove('decisionDate')
}

watch(
  activeCitation,
  () => {
    if (!activeCitation.value.citationTypeIsSet && !activeCitation.value.isEmpty) {
      validationStore.add('Pflichtfeld nicht befüllt', 'citationType')
    } else if (activeCitation.value.citationTypeIsSet) {
      validationStore.remove('citationType')
    }
  },
  { deep: true },
)

watch(
  () => props.modelValue,
  () => {
    activeCitation.value = new ActiveCitation({ ...props.modelValue })
    lastSavedModelValue.value = new ActiveCitation({ ...props.modelValue })
    if (lastSavedModelValue.value.isEmpty) validationStore.reset()
  },
)

onMounted(() => {
  if (props.modelValue?.isEmpty !== undefined) {
    validateRequiredInput()
  }
  activeCitation.value = new ActiveCitation({ ...props.modelValue })
})
</script>

<template>
  <div @keyup.ctrl.enter="search" class="flex flex-col gap-24">
    <InputField
      id="activeCitationPredicate"
      v-slot="slotProps"
      label="Art der Zitierung *"
      :validation-error="validationStore.getByField('citationType')"
    >
      <ZitierArtDropDown
        input-id="activeCitationPredicate"
        v-model="activeCitation.citationType"
        :invalid="slotProps.hasError"
        @focus="validationStore.remove('citationType')"
      />
    </InputField>
    <div class="flex flex-col gap-24">
      <div class="flex justify-between gap-24">
        <InputField
          id="activeCitationCourt"
          v-slot="slotProps"
          label="Gericht *"
          :validation-error="validationStore.getByField('court')"
        >
          <CourtDropDown
            input-id="activeCitationCourt"
            v-model="activeCitation.court"
            :invalid="slotProps.hasError"
            @focus="validationStore.remove('court')"
          />
        </InputField>
        <InputField
          id="activeCitationDecisionDate"
          v-slot="slotProps"
          label="Entscheidungsdatum *"
          :validation-error="validationStore.getByField('decisionDate')"
          @update:validation-error="
            (validationError: ValidationError | undefined) =>
              updateDateFormatValidation(validationError)
          "
        >
          <DateInput
            :id="slotProps.id"
            v-model="activeCitation.decisionDate"
            ariaLabel="Entscheidungsdatum Aktivzitierung"
            class="ds-input-medium"
            :has-error="slotProps.hasError"
            :readonly="activeCitation.hasForeignSource"
            @focus="validationStore.remove('decisionDate')"
            @update:validation-error="slotProps.updateValidationError"
          ></DateInput>
        </InputField>
      </div>
      <div class="flex justify-between gap-24">
        <InputField
          id="activeCitationFileNumber"
          v-slot="slotProps"
          label="Aktenzeichen *"
          :validation-error="validationStore.getByField('fileNumber')"
        >
          <InputText
            :id="slotProps.id"
            v-model="activeCitation.fileNumber"
            aria-label="Aktenzeichen Aktivzitierung"
            :invalid="slotProps.hasError"
            :readonly="activeCitation.hasForeignSource"
            fluid
            @focus="validationStore.remove('fileNumber')"
          ></InputText>
        </InputField>
        <InputField id="activeCitationDecisionDocumentType" v-slot="slotProps" label="Dokumenttyp">
          <ComboboxInput
            :id="slotProps.id"
            v-model="activeCitationDocumentType"
            aria-label="Dokumenttyp Aktivzitierung"
            :item-service="ComboboxItemService.getDocumentTypes"
            :read-only="activeCitation.hasForeignSource"
          ></ComboboxInput>
        </InputField>
      </div>
    </div>
    <div class="flex w-full flex-row justify-between">
      <div>
        <div class="flex gap-16">
          <Button
            v-if="!activeCitation.hasForeignSource"
            aria-label="Nach Entscheidung suchen"
            label="Suchen"
            size="small"
            @click="search"
          />
          <Button
            :disabled="activeCitation.isEmpty"
            label="Übernehmen"
            size="small"
            aria-label="Aktivzitierung speichern"
            severity="secondary"
            @click.stop="addActiveCitation"
          />
          <Button
            v-if="!lastSavedModelValue.isEmpty"
            aria-label="Abbrechen"
            label="Abbrechen"
            size="small"
            text
            @click.stop="emit('cancelEdit')"
          />
        </div>
      </div>
      <Button
        v-if="!lastSavedModelValue.isEmpty"
        aria-label="Eintrag löschen"
        label="Eintrag löschen"
        size="small"
        severity="danger"
        @click.stop="emit('removeEntry', true)"
      />
    </div>

    <div v-if="searchResultsCurrentPage" class="bg-blue-200">
      <Pagination
        navigation-position="bottom"
        :page="searchResultsCurrentPage"
        @update-page="(page: number) => search"
      >
        <SearchResultList
          :is-loading="isLoading"
          :search-results="searchResults"
          @link-decision="addActiveCitationFromSearch"
        />
      </Pagination>
    </div>
  </div>
</template>

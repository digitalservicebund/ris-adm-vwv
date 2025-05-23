<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { type ValidationError } from './input/types'
import ComboboxInput from '@/components/ComboboxInput.vue'
import InputField, { LabelPosition } from '@/components/input/InputField.vue'
import Button from 'primevue/button'
import SingleNormInput from '@/components/SingleNormInput.vue'
import { useValidationStore } from '@/composables/useValidationStore'
import LegalForce from '@/domain/legalForce'
import { type NormAbbreviation } from '@/domain/normAbbreviation'
import SingleNorm from '@/domain/singleNorm'
import ComboboxItemService from '@/services/comboboxItemService'
import IconAdd from '~icons/ic/baseline-add'
import ActiveReference, {
  ActiveReferenceDocumentType,
  ActiveReferenceType,
} from '@/domain/activeReference.ts'
import RadioButton from 'primevue/radiobutton'
import labels from '@/components/activeReferenceInputLabels.json'

const props = defineProps<{
  modelValue?: ActiveReference
  modelValueList?: ActiveReference[]
}>()
const emit = defineEmits<{
  'update:modelValue': [value: ActiveReference]
  addEntry: [void]
  cancelEdit: [void]
  removeEntry: [void]
}>()

const validationStore =
  useValidationStore<
    ['referenceType', 'normAbbreviation', 'singleNorm', 'dateOfVersion', 'dateOfRelevance'][number]
  >()

const activeReference = ref(new ActiveReference({ ...props.modelValue }))
const lastSavedModelValue = ref(new ActiveReference({ ...props.modelValue }))

const singleNorms = ref(
  props.modelValue?.singleNorms
    ? props.modelValue?.singleNorms?.map((norm) => new SingleNorm({ ...norm }))
    : ([] as SingleNorm[]),
)

/**
 * Data restructuring from norm abbreviation props to combobox item. When item in combobox set, it is validated
 * against already existing norm abbreviations in the list.
 */
const normAbbreviation = computed({
  get: () =>
    activeReference.value.normAbbreviation
      ? {
          label: activeReference.value.normAbbreviation.abbreviation,
          value: activeReference.value.normAbbreviation,
          additionalInformation: activeReference.value.normAbbreviation.officialLongTitle,
        }
      : undefined,
  set: (newValue) => {
    const newNormAbbreviation = { ...newValue } as NormAbbreviation
    if (newValue) {
      validationStore.remove('normAbbreviation')
      // Check if newValue.abbreviation is already in singleNorms
      const isAbbreviationPresent = props.modelValueList?.some(
        (norm) => norm.normAbbreviation?.abbreviation === newNormAbbreviation.abbreviation,
      )
      if (isAbbreviationPresent) {
        validationStore.add('RIS-Abkürzung bereits eingegeben', 'normAbbreviation')
      } else {
        activeReference.value.normAbbreviation = newNormAbbreviation
      }
    }
  },
})

const referenceType = computed<
  { label: string; value: ActiveReferenceType } | undefined,
  ActiveReferenceType | undefined
>({
  get: () =>
    activeReference.value.referenceType
      ? {
          label: ActiveReference.referenceTypeLabels.get(activeReference.value.referenceType) ?? '',
          value: activeReference.value.referenceType,
        }
      : undefined,
  set: (newValue) => {
    activeReference.value.referenceType = newValue
  },
})

/**
 * If there are no format validations, the new norm references is emitted to the parent and automatically
 * sa new emtpy entry is added to the list
 */
async function addNormReference() {
  if (!activeReference.value.referenceType) {
    validationStore.add('Art der Verweisung fehlt', 'referenceType')
  }
  if (
    !validationStore.getByField('referenceType') &&
    !validationStore.getByField('singleNorm') &&
    !validationStore.getByField('dateOfVersion') &&
    !validationStore.getByField('dateOfRelevance') &&
    !validationStore.getByMessage('RIS-Abkürzung bereits eingegeben').length
  ) {
    const normRef = new ActiveReference({
      ...activeReference.value,
      singleNorms: singleNorms.value
        .map((singleNorm) =>
          !singleNorm.isEmpty
            ? new SingleNorm({
                ...singleNorm,
                legalForce: singleNorm.legalForce
                  ? new LegalForce({ ...singleNorm.legalForce })
                  : undefined,
              })
            : null,
        )
        .filter((norm) => norm !== null) as SingleNorm[],
    })
    emit('update:modelValue', normRef)
    emit('addEntry')
  }
}

/**
 * Emits to the editable list to removes the current norm reference and empties the local single norm list. The truthy
 * boolean value indicates, that the edit index should be resetted to undefined, ergo show all list items in summary mode.
 */
function removeNormReference() {
  singleNorms.value = []
  activeReference.value.normAbbreviation = undefined
  emit('removeEntry')
}

/**
 * Adds a new single norm entry to the local single norms list.
 */
function addSingleNormEntry() {
  singleNorms.value.push(new SingleNorm())
}

/**
 * Removes the single norm entry, with the given index.
 * @param {number} index - The index of the list item to be removed
 */
function removeSingleNormEntry(index: number) {
  singleNorms.value.splice(index, 1)
}

function cancelEdit() {
  if (new ActiveReference({ ...props.modelValue }).isEmpty) {
    removeNormReference()
    addSingleNormEntry()
  }
  emit('cancelEdit')
}

/**
 * The child components emit format validations, this function updates the local validation store accordingly in order to
 * prevent the norm reference input from being saved with validation errors
 * @param validationError A validation error has either a message and an instance field or is undefined
 * @param field If the validation error is undefined, the validation store for this field needs to be resetted
 */
function updateFormatValidation(validationError: ValidationError | undefined, field?: string) {
  if (validationError) {
    validationStore.add(
      validationError.message,
      validationError.instance as [
        'referenceType',
        'singleNorm',
        'dateOfVersion',
        'dateOfRelevance',
      ][number],
    )
  } else {
    validationStore.remove(
      field as ['referenceType', 'singleNorm', 'dateOfVersion', 'dateOfRelevance'][number],
    )
  }
}

function removeMultipleSingleNorms() {
  if (singleNorms.value.length > 0) {
    // Remove all single norms expect the first one for administrative regulations
    singleNorms.value.splice(1, singleNorms.value.length)
    singleNorms.value[0].singleNorm = undefined
    singleNorms.value[0].dateOfRelevance = undefined
  } else {
    // As there is no 'Weitere Einzelnorm' button for administrative regulation on switch we have to
    // add one entry ro restore the UI.
    addSingleNormEntry()
  }
}

/**
 * This updates the local norm with the updated model value from the props. It also stores a copy of the last saved
 * model value, because the local norm might change in between. When the new model value is empty, all validation
 * errors are resetted. If it has an amiguous norm reference, the validation store is updated. When the list of
 * single norms is empty, a new empty single norm entry is added.
 */
watch(
  () => props.modelValue,
  () => {
    activeReference.value = new ActiveReference({ ...props.modelValue })
    lastSavedModelValue.value = new ActiveReference({ ...props.modelValue })
    if (lastSavedModelValue.value.isEmpty) {
      validationStore.reset()
    } else if (lastSavedModelValue.value.hasAmbiguousNormReference) {
      validationStore.add('Mehrdeutiger Verweis', 'normAbbreviation')
    }
    if (singleNorms.value?.length == 0 || !singleNorms.value) addSingleNormEntry()
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="flex flex-col gap-24">
    <div class="flex flex-col gap-24" v-if="lastSavedModelValue.isEmpty">
      <div class="flex w-full flex-row justify-between">
        <div class="flex flex-row gap-24">
          <InputField
            id="normReferenceDocumentType"
            label="Norm"
            label-class="ris-label1-regular"
            :label-position="LabelPosition.RIGHT"
          >
            <RadioButton
              id="normReferenceDocumentType"
              v-model="activeReference.referenceDocumentType"
              aria-label="Norm auswählen"
              :value="`${ActiveReferenceDocumentType.NORM}`"
            />
          </InputField>
          <InputField
            id="administrativeRegulationReferenceDocumentType"
            label="Verwaltungsvorschrift"
            label-class="ris-label1-regular"
            :label-position="LabelPosition.RIGHT"
          >
            <RadioButton
              id="administrativeRegulationReferenceDocumentType"
              v-model="activeReference.referenceDocumentType"
              aria-label="Verwaltungsvorschrift auswählen"
              :value="`${ActiveReferenceDocumentType.ADMINISTRATIVE_REGULATION}`"
              @click="removeMultipleSingleNorms"
            />
          </InputField>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-24">
      <InputField
        id="active-reference-type-field"
        v-slot="slotProps"
        label="Art der Verweisung *"
        :validation-error="validationStore.getByField('referenceType')"
      >
        <ComboboxInput
          id="active-reference-type-field"
          v-model="referenceType"
          aria-label="Art der Verweisung"
          :has-error="slotProps.hasError"
          :item-service="ComboboxItemService.getActiveReferenceTypes"
          no-clear
          placeholder="Bitte auswählen"
          @focus="validationStore.remove('referenceType')"
        ></ComboboxInput>
      </InputField>
    </div>
    <div class="flex flex-col gap-24">
      <InputField
        id="active-reference-abbreviation"
        v-slot="slotProps"
        :label="labels[`${activeReference.referenceDocumentType}`].risAbbreviation + ` *`"
        :validation-error="validationStore.getByField('normAbbreviation')"
      >
        <ComboboxInput
          id="active-reference-abbreviation"
          v-model="normAbbreviation"
          :aria-label="labels[`${activeReference.referenceDocumentType}`].risAbbreviation"
          :has-error="slotProps.hasError"
          :item-service="ComboboxItemService.getRisAbbreviations"
          no-clear
          :placeholder="
            labels[`${activeReference.referenceDocumentType}`].risAbbreviationPlaceholder
          "
          @focus="validationStore.remove('normAbbreviation')"
        ></ComboboxInput>
      </InputField>
    </div>
    <div class="flex flex-col gap-24">
      <div v-if="normAbbreviation || activeReference.normAbbreviationRawValue">
        <SingleNormInput
          v-for="(singleNorm, index) in singleNorms"
          :key="index"
          v-model="singleNorm as SingleNorm"
          aria-label="Einzelnorm"
          :index="index"
          norm-abbreviation="normAbbreviation.abbreviation"
          :show-single-norm-input="
            activeReference.referenceDocumentType == ActiveReferenceDocumentType.NORM
          "
          :show-date-of-relevance-button="
            activeReference.referenceDocumentType == ActiveReferenceDocumentType.NORM
          "
          @remove-entry="removeSingleNormEntry(index)"
          @update:validation-error="
            (validationError: ValidationError | undefined, field?: string) =>
              updateFormatValidation(validationError, field)
          "
        />

        <div class="flex w-full flex-row justify-between">
          <div>
            <div class="flex gap-24">
              <Button
                v-if="
                  activeReference.referenceDocumentType !==
                  ActiveReferenceDocumentType.ADMINISTRATIVE_REGULATION
                "
                aria-label="Weitere Einzelnorm"
                severity="secondary"
                label="Weitere Einzelnorm"
                size="small"
                @click.stop="addSingleNormEntry"
              >
                <template #icon><IconAdd /></template>
              </Button>
              <Button
                aria-label="Verweis speichern"
                label="Übernehmen"
                size="small"
                @click.stop="addNormReference"
              />
              <Button
                aria-label="Abbrechen"
                label="Abbrechen"
                size="small"
                text
                @click.stop="cancelEdit"
              />
            </div>
          </div>
          <Button
            v-if="!lastSavedModelValue.isEmpty"
            aria-label="Eintrag löschen"
            label="Eintrag löschen"
            size="small"
            severity="danger"
            @click.stop="removeNormReference"
          />
        </div>
      </div>
    </div>
  </div>
</template>

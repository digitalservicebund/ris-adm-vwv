<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import InputField from '../input/InputField.vue'
import ComboboxInput from '../ComboboxInput.vue'
import ComboboxItemService from '@/services/comboboxItemService'
import { type Region, type Normgeber, type Institution, InstitutionType } from '@/domain/normgeber'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useValidationStore } from '@/composables/useValidationStore'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'

const props = defineProps<{
  normgeber?: Normgeber
  showCancelButton: boolean
}>()

const emit = defineEmits<{
  updateNormgeber: [normgeber: Normgeber]
  deleteNormgeber: [id: string]
  cancel: [void]
}>()

const docUnitStore = useDocumentUnitStore()
const validationStore = useValidationStore<'institution'>()

const institution = ref<Institution | undefined>(props.normgeber?.institution || undefined)
const selectedRegion = ref<Region | undefined>(props.normgeber?.regions[0] || undefined)

const isInvalid = computed(
  () =>
    !institution.value ||
    (institution.value.type === InstitutionType.Institution && !selectedRegion.value) ||
    !validationStore.isValid(),
)
const existingInstitutionIds = computed<string[]>(
  () => docUnitStore.documentUnit?.normgeberList?.map((n) => n.institution.id) || [],
)

const regionsInputText = computed(() => {
  const isLegalEntity = institution.value && institution.value.type === InstitutionType.LegalEntity
  const hasRegions =
    institution.value && institution.value.regions && institution.value.regions.length > 0
  if (isLegalEntity && hasRegions) {
    return institution.value?.regions?.map((r) => r.label).join(', ')
  } else if (isLegalEntity && !hasRegions) {
    return 'Keine Region zugeordnet'
  } else {
    return ''
  }
})

const regionIsReadonly = computed(
  () => !institution.value || institution.value.type === InstitutionType.LegalEntity,
)

const regionLabel = computed(() => (regionIsReadonly.value ? 'Region' : 'Region *'))

const onClickSave = () => {
  const normgeber = {
    id: props.normgeber ? props.normgeber.id : crypto.randomUUID(),
    institution: institution.value!,
    regions:
      institution.value!.type === InstitutionType.LegalEntity
        ? (institution.value?.regions as Region[])
        : ([selectedRegion.value] as Region[]),
  }

  emit('updateNormgeber', normgeber)
}

const onClickCancel = () => {
  institution.value = props.normgeber?.institution || undefined
  selectedRegion.value = props.normgeber?.regions[0] || undefined
  emit('cancel')
}

const onClickDelete = () => {
  emit('deleteNormgeber', props.normgeber!.id)
}

const validateInstitution = () => {
  const institutionId = institution.value?.id
  if (institutionId && existingInstitutionIds.value.includes(institutionId)) {
    validationStore.add('Normgeber bereits eingegeben', 'institution')
  } else {
    validationStore.remove('institution')
  }
}

// Reset the selected region on institution change
// Triggers validation
watch(institution, (newVal, oldVal) => {
  if (newVal?.id !== oldVal?.id) {
    selectedRegion.value = undefined
    validateInstitution()
  }
})
</script>

<template>
  <div>
    <div class="flex flex-row gap-24">
      <InputField
        id="institution"
        label="Normgeber *"
        class="w-full"
        :validation-error="validationStore.getByField('institution')"
        v-slot="slotProps"
      >
        <ComboboxInput
          id="institution"
          v-model="institution"
          aria-label="Normgeber"
          clear-on-choosing-item
          :has-error="slotProps.hasError"
          :item-service="ComboboxItemService.getInstitutions"
        ></ComboboxInput>
      </InputField>
      <InputField id="region" :label="regionLabel" class="w-full">
        <InputText
          v-if="regionIsReadonly"
          id="region"
          :value="regionsInputText"
          aria-label="Region"
          size="small"
          fluid
          readonly
        />
        <ComboboxInput
          v-else
          id="region"
          v-model="selectedRegion"
          :item-service="ComboboxItemService.getRegions"
          aria-label="Region"
          clear-on-choosing-item
        ></ComboboxInput>
      </InputField>
    </div>
    <div class="flex w-full gap-16 mt-16">
      <Button
        :disabled="isInvalid"
        aria-label="Normgeber übernehmen"
        label="Übernehmen"
        size="small"
        @click.stop="onClickSave"
      />
      <Button
        v-if="showCancelButton"
        aria-label="Abbrechen"
        label="Abbrechen"
        size="small"
        text
        @click.stop="onClickCancel"
      />
      <Button
        v-if="props.normgeber"
        class="ml-auto"
        aria-label="Eintrag löschen"
        severity="danger"
        label="Eintrag löschen"
        size="small"
        @click.stop="onClickDelete"
      />
    </div>
  </div>
</template>

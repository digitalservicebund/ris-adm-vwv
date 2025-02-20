<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { type ValidationError } from './input/types'
import DateInput from '@/components/input/DateInput.vue'
import InputField from '@/components/input/InputField.vue'
import TextInput from '@/components/input/TextInput.vue'
import YearInput from '@/components/input/YearInput.vue'
import { useValidationStore } from '@/composables/useValidationStore'
import SingleNorm, { type SingleNormValidationInfo } from '@/domain/singleNorm'
import IconClear from '~icons/material-symbols/close-small'

const props = withDefaults(
  defineProps<{
    modelValue: SingleNorm
    normAbbreviation: string
    showSingleNormInput?: boolean
    showDateOfRelevanceButton?: boolean
    index: number
  }>(),
  { showSingleNormInput: true, showDateOfRelevanceButton: true },
)

const emit = defineEmits<{
  'update:modelValue': [value: SingleNorm]
  removeEntry: [void]
  'update:validationError': [value?: ValidationError, field?: string]
}>()

const validationStore = useValidationStore<(typeof SingleNorm.fields)[number]>()
const singleNormInput = ref<InstanceType<typeof TextInput> | null>(null)

const singleNorm = computed({
  get: () => {
    return props.modelValue
  },
  set: (value) => {
    if (value) emit('update:modelValue', value)
  },
})

/**
 * Validates a given single norm against with a given norm abbreviation against a validation endpoint.
 * The validation endpint either responds with "Ok" oder "Validation error". In the latter case a validation error is emitted to the parent.
 */
async function validateNorm() {
  validationStore.reset()
  emit('update:validationError', undefined, 'singleNorm')

  if (singleNorm.value?.singleNorm) {
    const singleNormValidationInfo: SingleNormValidationInfo = {
      singleNorm: singleNorm.value?.singleNorm,
      normAbbreviation: props.normAbbreviation,
    }

    if (singleNormValidationInfo.singleNorm === '2021, Seite 21') {
      validationStore.add('Inhalt nicht valide', 'singleNorm')

      emit(
        'update:validationError',
        {
          message: 'Inhalt nicht valide',
          instance: 'singleNorm',
        },
        'singleNorm',
      )
    }
  }
}
/**
 * Emits the 'removeEntry' event to the parent, where the data entry is removed from the model value.
 */
async function removeSingleNormEntry() {
  emit('removeEntry')
}

/**
 * Could be triggered by invalid date formats in the fields 'dateOfVersion' and 'dateOfRelevance'.
 * This forwards the validation error to the parent, so it knows, that this single norm entry has a validation error.
 * @param validationError The actual message
 * @param field The name of the field with format validation. The validationError also holds this information ('instance'),
 * but when the validationError resets to undefined, we do not have the instance information anymore.
 * For this case this field is needed in order to identify, which field resetted it's valdiation error.
 */
function updateDateFormatValidation(validationError: ValidationError | undefined, field: string) {
  if (validationError) {
    emit(
      'update:validationError',
      {
        message: validationError.message,
        instance: validationError.instance,
      },
      field,
    )
  } else {
    emit('update:validationError', undefined, field)
  }
}

/**
 * On mount, the first input is focussed, the local value for legal force is set.
 * If the single norm entry mounts and the single norm field is filled, then it is validated immediately.
 */
onMounted(async () => {
  if (props.modelValue.singleNorm) {
    await validateNorm()
  }

  singleNormInput.value?.focusInput()
})
</script>

<template>
  <div class="mb-24 flex flex-col gap-24">
    <div class="gap-24 flex flex-row justify-between">
      <InputField
        id="singleNorm"
        v-if="showSingleNormInput"
        v-slot="slotProps"
        label="Einzelnorm"
        :validation-error="validationStore.getByField('singleNorm')"
      >
        <TextInput
          id="singleNorm"
          ref="singleNormInput"
          v-model.trim="singleNorm.singleNorm"
          ariaLabel="Einzelnorm der Norm"
          :has-error="slotProps.hasError"
          size="medium"
          @blur="validateNorm"
          @focus="validationStore.remove('singleNorm')"
        ></TextInput>
      </InputField>
      <InputField
        id="dateOfVersion"
        v-slot="slotProps"
        label="Fassungsdatum"
        :validation-error="validationStore.getByField('dateOfVersion')"
        @update:validation-error="
          (validationError) => updateDateFormatValidation(validationError, 'dateOfVersion')
        "
      >
        <DateInput
          id="dateOfVersion"
          v-model="singleNorm.dateOfVersion"
          ariaLabel="Fassungsdatum der Norm"
          class="ds-input-medium"
          :has-error="slotProps.hasError"
          @focus="validationStore.remove('dateOfVersion')"
          @update:validation-error="slotProps.updateValidationError"
        />
      </InputField>
      <InputField
        id="dateOfRelevance"
        v-if="showDateOfRelevanceButton"
        v-slot="slotProps"
        label="Jahr"
        :validation-error="validationStore.getByField('dateOfRelevance')"
        @update:validation-error="
          (validationError) => updateDateFormatValidation(validationError, 'dateOfRelevance')
        "
      >
        <YearInput
          id="dateOfRelevance"
          v-model="singleNorm.dateOfRelevance"
          aria-label="Jahr der Norm"
          :has-error="slotProps.hasError"
          size="medium"
          @focus="validationStore.remove('dateOfRelevance')"
          @update:validation-error="slotProps.updateValidationError"
        />
      </InputField>
      <button
        v-if="showSingleNormInput"
        aria-label="Einzelnorm löschen"
        class="mt-[25px] h-[50px] text-blue-800 focus:shadow-[inset_0_0_0_0.25rem] focus:shadow-blue-800 focus:outline-none"
        tabindex="0"
        @click="removeSingleNormEntry"
      >
        <IconClear />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ToolTip from '@/components/ToolTip.vue'
import IconArrowDown from '~icons/ic/baseline-keyboard-arrow-down'
import { type Fundstelle } from '@/domain/fundstelle'
import FundstelleInput from './FundstelleInput.vue'

defineProps<{
  fundstelle: Fundstelle
}>()
const emit = defineEmits<{
  updateFundstelle: [fundstelle: Fundstelle]
  deleteFundstelle: [id: string]
}>()

const isEditMode = ref<boolean>(false)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const onExpandAccordion = () => {
  toggleEditMode()
}

const onUpdateFundstelle = (fundstelle: Fundstelle) => {
  emit('updateFundstelle', fundstelle)
  isEditMode.value = false
}

const onClickCancel = () => {
  toggleEditMode()
}

const onDeleteFundstelle = (fundstelleId: string) => {
  emit('deleteFundstelle', fundstelleId)
  toggleEditMode()
}
</script>

<template>
  <FundstelleInput
    v-if="isEditMode"
    :fundstelle="fundstelle"
    @update-fundstelle="onUpdateFundstelle"
    @delete-fundstelle="onDeleteFundstelle"
    @cancel="onClickCancel"
    show-cancel-button
  />
  <div v-else class="flex w-full items-center">
    <div class="ris-label1-regular">
      {{ `${fundstelle.periodikum.abbreviation} ${fundstelle.zitatstelle}` }}
    </div>
    <ToolTip class="ml-auto" text="Aufklappen">
      <button
        aria-label="Fundstelle Editieren"
        class="flex h-32 w-32 items-center justify-center text-blue-800 hover:bg-blue-100 focus:shadow-[inset_0_0_0_0.125rem] focus:shadow-blue-800 focus:outline-none cursor-pointer"
        @click="onExpandAccordion"
      >
        <IconArrowDown />
      </button>
    </ToolTip>
  </div>
</template>

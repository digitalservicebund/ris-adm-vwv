<script lang="ts" setup>
import { computed, ref } from 'vue'
import ToolTip from '@/components/ToolTip.vue'
import IconArrowDown from '~icons/ic/baseline-keyboard-arrow-down'
import { type Normgeber } from '@/domain/normgeber'
import NormgeberInput from './NormgeberInput.vue'

const props = defineProps<{
  normgeber: Normgeber
}>()
const emit = defineEmits<{
  updateNormgeber: [normgeber: Normgeber]
  deleteNormgeber: [id: string]
}>()

const isEditMode = ref<boolean>(false)

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const onExpandAccordion = () => {
  toggleEditMode()
}

const onUpdateNormgeber = (normgeber: Normgeber) => {
  emit('updateNormgeber', normgeber)
  isEditMode.value = false
}

const onClickCancel = () => {
  toggleEditMode()
}

const onDeleteNormgeber = (normgeberId: string) => {
  emit('deleteNormgeber', normgeberId)
  toggleEditMode()
}

const label = computed(() =>
  [...props.normgeber.regions.map((r) => r.code), props.normgeber.institution.name]
    .filter(Boolean)
    .join(', ')
    .toString(),
)
</script>

<template>
  <NormgeberInput
    v-if="isEditMode"
    :normgeber="normgeber"
    @update-normgeber="onUpdateNormgeber"
    @delete-normgeber="onDeleteNormgeber"
    @cancel="onClickCancel"
    show-cancel-button
  />
  <div v-else class="flex w-full items-center">
    <div class="ris-label1-regular">
      {{ label }}
    </div>
    <ToolTip class="ml-auto" text="Aufklappen">
      <button
        aria-label="Normgeber Editieren"
        class="flex h-32 w-32 items-center justify-center text-blue-800 hover:bg-blue-100 focus:shadow-[inset_0_0_0_0.125rem] focus:shadow-blue-800 focus:outline-none cursor-pointer"
        @click="onExpandAccordion"
      >
        <IconArrowDown />
      </button>
    </ToolTip>
  </div>
</template>

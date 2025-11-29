<script lang="ts" setup>
import { ref, watch } from 'vue'
import ComboboxInput from '@/views/adm/documentUnit/[documentNumber]/ComboboxInput.vue'
import { type FieldOfLaw } from '@/domain/fieldOfLaw'
import ComboboxItemService from '@/services/comboboxItemService'

const emit = defineEmits<{
  'add-to-list': [item: FieldOfLaw]
}>()
const fieldOfLawNode = ref()
watch(fieldOfLawNode, () => {
  // check if fieldOfLawNode value is set
  // Could be that when clearing the drop down
  // the ComboboxInput is emitting undefined
  // via clearDropdown()
  // so only add to list of fields when not undefined
  if (fieldOfLawNode.value) emit('add-to-list', fieldOfLawNode.value as FieldOfLaw)
})
</script>

<template>
  <div class="flex w-full flex-col">
    <p class="ris-label2-regular pb-4">Direkteingabe Sachgebiet</p>
    <ComboboxInput
      id="directInputCombobox"
      v-model="fieldOfLawNode"
      aria-label="Direkteingabe-Sachgebietssuche eingeben"
      clear-on-choosing-item
      :item-service="ComboboxItemService.getFieldOfLawSearchByIdentifier"
      placeholder="Sachgebiet"
    >
    </ComboboxInput>
  </div>
</template>

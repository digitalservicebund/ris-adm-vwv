<script lang="ts" setup>
import NormgeberListItem from './NormgeberListItem.vue'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import { computed } from 'vue'
import NormgeberInput from './NormgeberInput.vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'
import { useEditableList } from '@/views/adm/documentUnit/[documentNumber]/useEditableList'

const store = useAdmDocUnitStore()

const normgeberList = computed({
  get: () => store.documentUnit!.normgeberList ?? [],
  set: (newValue) => {
    store.documentUnit!.normgeberList = newValue
  },
})

const { onRemoveItem, onAddItem, onUpdateItem, isCreationPanelOpened } =
  useEditableList(normgeberList)
</script>

<template>
  <div class="normgeberList">
    <h2 class="ris-label1-bold mb-16">Normgeber</h2>
    <ol v-if="normgeberList.length > 0" aria-label="Normgeber Liste">
      <li
        class="border-b-1 border-blue-300 py-16"
        v-for="normgeber in normgeberList"
        :key="normgeber.id"
      >
        <NormgeberListItem
          :normgeber="normgeber"
          @add-normgeber="onAddItem"
          @update-normgeber="onUpdateItem"
          @delete-normgeber="onRemoveItem"
        />
      </li>
    </ol>
    <NormgeberInput
      v-if="isCreationPanelOpened || normgeberList.length === 0"
      class="mt-16"
      @update-normgeber="onAddItem"
      @cancel="isCreationPanelOpened = false"
      :show-cancel-button="normgeberList.length > 0"
    />
    <Button
      v-else
      class="mt-16"
      aria-label="Normgeber hinzufügen"
      severity="secondary"
      label="Normgeber hinzufügen"
      size="small"
      @click="isCreationPanelOpened = true"
    >
      <template #icon><IconAdd /></template>
    </Button>
  </div>
</template>

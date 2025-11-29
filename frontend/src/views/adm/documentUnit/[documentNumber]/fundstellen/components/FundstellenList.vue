<script lang="ts" setup>
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import { computed } from 'vue'
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'
import { useEditableList } from '@/views/adm/documentUnit/[documentNumber]/useEditableList'
import FundstelleListItem from './FundstelleListItem.vue'
import FundstelleInput from './FundstelleInput.vue'

const store = useAdmDocUnitStore()

const fundstellenList = computed({
  get: () => store.documentUnit!.fundstellen ?? [],
  set: (newValue) => {
    store.documentUnit!.fundstellen = newValue
  },
})

const { onRemoveItem, onAddItem, onUpdateItem, isCreationPanelOpened } =
  useEditableList(fundstellenList)
</script>

<template>
  <div class="fundstellenList">
    <h2 class="ris-label1-bold mb-16">Fundstellen</h2>
    <ol v-if="fundstellenList.length > 0" aria-label="Fundstellen Liste">
      <li
        class="border-b-1 border-blue-300 py-16"
        v-for="fundstelle in fundstellenList"
        :key="fundstelle.id"
      >
        <FundstelleListItem
          :fundstelle="fundstelle"
          @add-fundstelle="onAddItem"
          @update-fundstelle="onUpdateItem"
          @delete-fundstelle="onRemoveItem"
        />
      </li>
    </ol>
    <FundstelleInput
      v-if="isCreationPanelOpened || fundstellenList.length === 0"
      class="mt-16"
      @update-fundstelle="onAddItem"
      @cancel="isCreationPanelOpened = false"
      :show-cancel-button="fundstellenList.length > 0"
    />
    <Button
      v-else
      class="mt-16"
      aria-label="Fundstelle hinzufügen"
      severity="secondary"
      label="Fundstelle hinzufügen"
      size="small"
      @click="isCreationPanelOpened = true"
    >
      <template #icon><IconAdd /></template>
    </Button>
  </div>
</template>

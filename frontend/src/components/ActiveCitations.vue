<script lang="ts" setup>
import { computed } from 'vue'
import ActiveCitationInput from '@/components/ActiveCitationInput.vue'
import ActiveCitationSummary from '@/components/ActiveCitationSummary.vue'
import EditableList from '@/components/EditableList.vue'
import ActiveCitation from '@/domain/activeCitation'
import { useDocumentUnitStore } from '@/stores/documentUnitStore.ts'

const store = useDocumentUnitStore()

const activeCitations = computed({
  get: () => store.documentUnit!.activeCitations ?? [],
  set: (newValues: ActiveCitation[]) => {
    store.documentUnit!.activeCitations = newValues
  },
})

const defaultValue = new ActiveCitation() as ActiveCitation
</script>

<template>
  <div aria-label="Aktivzitierung">
    <h2 id="activeCitations" class="ris-label1-bold mb-16">Aktivzitierung Rechtsprechung</h2>
    <EditableList
      v-model="activeCitations"
      :default-value="defaultValue"
      :edit-component="ActiveCitationInput"
      :summary-component="ActiveCitationSummary"
    />
  </div>
</template>

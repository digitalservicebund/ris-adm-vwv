<script lang="ts" setup>
import { computed } from 'vue'
import ActiveCitationInput from './ActiveCitationInput.vue'
import ActiveCitationSummary from './ActiveCitationSummary.vue'
import EditableList from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/EditableList.vue'
import ActiveCitation from '@/domain/activeCitation'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'

const store = useAdmDocUnitStore()

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

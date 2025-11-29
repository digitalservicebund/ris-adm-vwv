<script lang="ts" setup>
import { computed } from 'vue'
import EditableList from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/EditableList.vue'
import ActiveReference from '@/domain/activeReference.ts'
import ActiveReferenceInput from './ActiveReferenceInput.vue'
import ActiveReferenceSummary from './ActiveReferenceSummary.vue'
import SingleNorm from '@/domain/singleNorm.ts'
import dayjs from 'dayjs'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'

const store = useAdmDocUnitStore()

const activeReferences = computed({
  get: () => store.documentUnit!.activeReferences,
  set: async (newValues) => {
    store.documentUnit!.activeReferences = newValues?.filter((value) => {
      removeDuplicateSingleNorms(value as ActiveReference)
      return true // Keep the value in the norms array
    })
  },
})

function removeDuplicateSingleNorms(activeReference: ActiveReference): void {
  if (!activeReference.singleNorms || !Array.isArray(activeReference.singleNorms)) {
    return // Exit if singleNorms is not an array
  }

  const uniqueSingleNorms = new Set<string>()

  activeReference.singleNorms = activeReference.singleNorms.filter((singleNorm) => {
    const uniqueKey = generateUniqueSingleNormKey(singleNorm)

    // Check uniqueness and add to the set if it's new
    if (!uniqueSingleNorms.has(uniqueKey)) {
      uniqueSingleNorms.add(uniqueKey)
      return true // Keep this singleNorm
    }
    return false // Filter out duplicates
  })
}

function generateUniqueSingleNormKey(singleNorm: SingleNorm): string {
  return JSON.stringify({
    singleNorm: singleNorm.singleNorm ?? '',
    dateOfVersion: singleNorm.dateOfVersion
      ? dayjs(singleNorm.dateOfVersion).format('DD.MM.YYYY')
      : '',
    dateOfRelevance: singleNorm.dateOfRelevance ?? '',
  })
}

const defaultValue = new ActiveReference() as ActiveReference
</script>

<template>
  <div>
    <div aria-label="Verweise">
      <h2 class="ris-label1-bold mb-16">Verweise</h2>
      <div class="flex flex-row">
        <div class="flex-1">
          <EditableList
            v-model="activeReferences"
            :default-value="defaultValue"
            :edit-component="ActiveReferenceInput"
            :summary-component="ActiveReferenceSummary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

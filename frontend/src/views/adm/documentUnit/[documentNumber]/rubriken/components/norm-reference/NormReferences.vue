<script lang="ts" setup>
import dayjs from 'dayjs'
import { computed } from 'vue'
import EditableList from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/EditableList.vue'
import NormReferenceInput from './NormReferenceInput.vue'
import NormReferenceSummary from './NormReferenceSummary.vue'
import NormReference from '@/domain/normReference'

import SingleNorm from '@/domain/singleNorm'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'

const store = useAdmDocUnitStore()

const normReferences = computed({
  get: () => store.documentUnit!.normReferences,
  set: async (newValues) => {
    store.documentUnit!.normReferences = newValues?.filter((value) => {
      removeDuplicateSingleNorms(value as NormReference)
      return true // Keep the value in the norms array
    })
  },
})

function removeDuplicateSingleNorms(norm: NormReference): void {
  if (!norm.singleNorms || !Array.isArray(norm.singleNorms)) {
    return // Exit if singleNorms is not an array
  }

  const uniqueSingleNorms = new Set<string>()

  norm.singleNorms = norm.singleNorms.filter((singleNorm) => {
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

const defaultValue = new NormReference() as NormReference
</script>
<template>
  <div aria-label="Norm">
    <h2 id="norms" class="ris-label1-bold mb-16">Normenkette</h2>
    <div class="flex flex-row">
      <div class="flex-1">
        <EditableList
          v-model="normReferences"
          :default-value="defaultValue"
          :edit-component="NormReferenceInput"
          :summary-component="NormReferenceSummary"
        />
      </div>
    </div>
  </div>
</template>

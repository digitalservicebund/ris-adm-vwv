<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import IconCheck from '~icons/material-symbols/check'
import IconErrorOutline from '~icons/ic/baseline-error-outline'
import { Button } from 'primevue'

defineProps<{
  missingFields: string[]
}>()

function getLabel(field: string): string {
  return (
    {
      langueberschrift: 'Amtl. Langüberschrift',
      inkrafttretedatum: 'Datum des Inkrafttretens',
      dokumenttyp: 'Dokumenttyp',
      normgeberList: 'Normgeber',
      zitierdaten: 'Zitierdatum',
    }[field] || field
  )
}
</script>
<template>
  <h2 class="ris-label1-bold">Plausibilitätsprüfung</h2>
  <div v-if="missingFields.length > 0" class="flex gap-16 p-16">
    <div>
      <IconErrorOutline class="mt-2 text-red-800" />
    </div>
    <div>
      <p class="mb-8">Folgende Pflichtfelder sind nicht befüllt:</p>
      <ul class="list-disc list-inside ml-16 mb-24">
        <li v-for="field in missingFields" :key="field">{{ getLabel(field) }}</li>
      </ul>
      <router-link :to="{ name: 'vwv-documentUnit-documentNumber-rubriken' }">
        <Button label="Rubriken bearbeiten" aria-label="Rubriken bearbeiten" severity="secondary" />
      </router-link>
    </div>
  </div>
  <div v-else class="flex items-center p-16">
    <IconCheck class="text-green-700 mr-16" />
    <span>Alle Pflichtfelder sind korrekt ausgefüllt.</span>
  </div>
</template>

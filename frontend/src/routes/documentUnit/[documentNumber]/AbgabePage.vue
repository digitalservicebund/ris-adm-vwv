<script setup lang="ts">
import Button from 'primevue/button'
import IconCheck from '~icons/material-symbols/check'
import TitleElement from '@/components/TitleElement.vue'
import SanityCheck from '@/components/publication/SanityCheck.vue'
import { computed } from 'vue'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'
import { missingDocUnitFields } from '@/utils/validators'
import type { DocumentUnit } from '@/domain/documentUnit'

const store = useDocumentUnitStore()

const isPublishable = computed(() =>
  store.documentUnit
    ? missingDocUnitFields(store.documentUnit as DocumentUnit).length === 0
    : false,
)
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col p-24">
    <div aria-label="Abgabe" class="flex flex-col gap-24 bg-white p-24">
      <TitleElement>Abgabe</TitleElement>
      <SanityCheck />
      <div class="flex flex-row">
        <Button
          :disabled="!isPublishable"
          label="Zur Veröffentlichung freigeben"
          :loading="false"
          :text="false"
        >
          <template #icon>
            <IconCheck />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

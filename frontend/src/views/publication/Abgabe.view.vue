<script setup lang="ts">
import TitleElement from '@/components/TitleElement.vue'
import { onUnmounted, ref } from 'vue'
import Plausibilitaetspruefung from './Plausibilitaetspruefung.vue'
import { useStoreForRoute } from '@/composables/useStoreForRoute'
import type { DocumentUnitStore } from '@/stores/types'
import { storeToRefs } from 'pinia'
import Publication from './Publication.vue'

const store = useStoreForRoute<DocumentUnitStore>()

const { error, isLoading, missingRequiredFields } = storeToRefs(store)
const isPublished = ref(false)

async function onClickPublish() {
  isPublished.value = await store.publish()
}

onUnmounted(() => (error.value = null))
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col p-24">
    <div aria-label="Abgabe" class="flex flex-col bg-white p-24">
      <TitleElement class="mb-24">Abgabe</TitleElement>
      <Plausibilitaetspruefung :missing-fields="missingRequiredFields" />
      <hr class="text-blue-500 my-24" />
      <Publication
        :is-published="isPublished"
        :is-loading="isLoading"
        :is-disabled="missingRequiredFields.length > 0"
        :error="error"
        @publish="onClickPublish"
      />
    </div>
  </div>
</template>

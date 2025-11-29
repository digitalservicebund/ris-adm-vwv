<script lang="ts" setup>
import Button from 'primevue/button'
import { useRoute, useRouter } from 'vue-router'
import IconAdd from '~icons/material-symbols/add'
import RisTabs from './RisTabs.vue'
import { ROUTE_NAMES } from '@/constants/routes'
import { DocumentCategory } from '@/domain/documentType'

const router = useRouter()
const route = useRoute()

const tabs = [
  {
    id: '0',
    routeName: ROUTE_NAMES.ULI.START_PAGE,
    label: 'Unselbständige Literatur',
    documentCategory: DocumentCategory.LITERATUR_UNSELBSTAENDIG,
  },
  {
    id: '1',
    routeName: ROUTE_NAMES.SLI.START_PAGE,
    label: 'Selbständige Literatur',
    documentCategory: DocumentCategory.LITERATUR_SELBSTAENDIG,
  },
]
</script>

<template>
  <div class="flex flex-col p-24 bg-white">
    <h1 class="sr-only">Literatur Übersicht</h1>
    <div class="flex items-start justify-between mb-0">
      <RisTabs :tabs="tabs" />
      <Button
        label="Neue Dokumentationseinheit"
        class="ml-16"
        @click="router.push(`${route.path}/dokumentationseinheit/new`)"
      >
        <template #icon>
          <IconAdd aria-hidden="true" />
        </template>
      </Button>
    </div>
    <div class="mt-16">
      <router-view />
    </div>
  </div>
</template>

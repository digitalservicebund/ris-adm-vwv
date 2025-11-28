<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { until } from '@vueuse/core'
import { useToast } from 'primevue'
import errorMessages from '@/i18n/errors.json'
import { ROUTE_PATHS } from '@/constants/routes'
import { usePostAdmDocUnit } from '@/services/adm/admDocumentUnitService'
import { DocumentCategory } from '@/domain/documentType'
import {
  usePostSliDocUnit,
  usePostUliDocUnit,
} from '@/services/literature/literatureDocumentUnitService'

const toast = useToast()
const router = useRouter()
const route = useRoute()

onBeforeMount(async () => {
  let data, error, isFinished

  if (route.meta.documentCategory === DocumentCategory.LITERATUR_UNSELBSTAENDIG) {
    ;({ data, error, isFinished } = usePostUliDocUnit())
  } else if (route.meta.documentCategory === DocumentCategory.LITERATUR_SELBSTAENDIG) {
    ;({ data, error, isFinished } = usePostSliDocUnit())
  } else {
    ;({ data, error, isFinished } = usePostAdmDocUnit())
  }

  await until(isFinished).toBe(true)

  if (error.value) {
    toast.add({
      severity: 'error',
      summary: errorMessages.DOCUMENT_UNIT_CREATION_FAILED.title,
    })
  }

  if (data.value) {
    const sectionPath = route.matched[0]?.path || ''
    const newPath = `${sectionPath}/${ROUTE_PATHS.DOCUMENT_UNIT_BASE}/${data.value.documentNumber}`
    router.replace(newPath)
  }
})
</script>

<template>
  <div></div>
</template>

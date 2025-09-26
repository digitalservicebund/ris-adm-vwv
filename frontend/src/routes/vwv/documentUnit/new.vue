<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { usePostDocUnit } from '@/services/documentUnitService'
import { until } from '@vueuse/core'
import { useToast } from 'primevue'
import errorMessages from '@/i18n/errors.json'

const toast = useToast()

const router = useRouter()

onBeforeMount(async () => {
  const { data, error, isFinished } = usePostDocUnit()
  await until(isFinished).toBe(true)

  if (error.value) {
    toast.add({
      severity: 'error',
      summary: errorMessages.DOCUMENT_UNIT_CREATION_FAILED.title,
    })
  }

  if (data.value) {
    await router.replace({
      name: 'documentUnit-documentNumber-fundstellen',
      params: { documentNumber: data.value.documentNumber },
    })
  }
})
</script>

<template>
  <div></div>
</template>

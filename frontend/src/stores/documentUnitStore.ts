import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DocumentUnit } from '@/domain/documentUnit'
import { useGetDocUnit, usePutDocUnit } from '@/services/documentUnitService'

export const useDocumentUnitStore = defineStore('docunitStore', () => {
  const documentUnit = ref<DocumentUnit | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function loadDocumentUnit(documentNumber: string): Promise<void> {
    isLoading.value = true
    error.value = null

    const { data, error: fetchError, execute } = useGetDocUnit(documentNumber)
    await execute()

    if (fetchError.value) {
      error.value = fetchError.value
      documentUnit.value = null
    } else {
      documentUnit.value = data.value ?? null
    }

    isLoading.value = false
  }

  async function updateDocumentUnit(): Promise<boolean> {
    if (!documentUnit.value) return false

    isLoading.value = true
    error.value = null

    const {
      data,
      error: putError,
      statusCode,
      execute,
    } = usePutDocUnit(documentUnit.value as DocumentUnit)
    await execute()

    if (statusCode.value && statusCode.value >= 200 && statusCode.value < 300 && data.value) {
      documentUnit.value = data.value
      isLoading.value = false
      return true
    }

    error.value = putError.value || new Error('Update failed')
    isLoading.value = false
    return false
  }

  function unloadDocumentUnit() {
    documentUnit.value = null
  }

  return {
    documentUnit,
    isLoading,
    error,
    loadDocumentUnit,
    updateDocumentUnit,
    unloadDocumentUnit,
  }
})

import { defineStore } from 'pinia'
import { defineDocumentUnitStore } from './documentUnitStoreFactory'
import type { AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'
import {
  useGetAdmDocUnit,
  usePutAdmDocUnit,
  usePutPublishAdmDocUnit,
} from '@/services/adm/admDocumentUnitService'
import { missingAdmDocumentUnitFields } from '@/utils/validators'

export const useAdmDocUnitStore = defineStore('admDocumentUnit', () => {
  return defineDocumentUnitStore<AdmDocumentationUnit>({
    getDocument: useGetAdmDocUnit,
    putDocument: usePutAdmDocUnit,
    publishDocument: usePutPublishAdmDocUnit,
    missingFields: missingAdmDocumentUnitFields,
  })
})

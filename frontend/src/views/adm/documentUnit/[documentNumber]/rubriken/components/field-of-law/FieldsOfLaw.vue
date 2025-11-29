<script lang="ts" setup>
import * as Sentry from '@sentry/vue'
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import FieldOfLawDirectInputSearch from './FieldOfLawDirectInputSearch.vue'
import FieldOfLawExpandableContainer, { InputMethod } from './FieldOfLawExpandableContainer.vue'
import FieldOfLawSearchInput from './FieldOfLawSearchInput.vue'
import FieldOfLawSearchResultList from './FieldOfLawSearchResults.vue'
import FieldOfLawTree from './FieldOfLawTree.vue'
import { type Page } from '@/components/Pagination.vue'
import { type FieldOfLaw } from '@/domain/fieldOfLaw'
import { useGetPaginatedFieldsOfLaw } from '@/services/fieldOfLawService'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import StringsUtil from '@/utils/stringsUtil'
import { until } from '@vueuse/core'

type FieldOfLawTreeType = InstanceType<typeof FieldOfLawTree>
const treeRef = useTemplateRef<FieldOfLawTreeType>('treeRef')

const showNorms = ref(false)
const nodeOfInterest = ref<FieldOfLaw | undefined>(undefined)
const isResetButtonVisible = ref(false)
const description = ref('')
const identifier = ref('')
const norm = ref('')
const searchErrorLabel = ref<string | undefined>(undefined)
const results = ref<FieldOfLaw[]>()
const currentPage = ref<Page>()
const itemsPerPage = 10

const store = useAdmDocUnitStore()
const selectedNodes = computed({
  get: () => store.documentUnit!.fieldsOfLaw as FieldOfLaw[],
  set: (newValues) => {
    store.documentUnit!.fieldsOfLaw = newValues?.filter((value) => {
      if (Object.keys(value).length === 0) {
        Sentry.captureMessage('FieldOfLaw list contains empty objects', 'error')
        return false
      } else {
        return true
      }
    })
  },
})

async function submitSearch(page: number) {
  searchErrorLabel.value = undefined
  if (
    StringsUtil.isEmpty(identifier.value) &&
    StringsUtil.isEmpty(description.value) &&
    StringsUtil.isEmpty(norm.value)
  ) {
    searchErrorLabel.value = 'Geben Sie mindestens ein Suchkriterium ein'
    removeNodeOfInterest()
    return
  }

  const { data, isFinished } = useGetPaginatedFieldsOfLaw(
    page,
    itemsPerPage,
    description,
    identifier,
    norm,
  )
  await until(isFinished).toBe(true)

  if (data.value) {
    currentPage.value = data.value.page
    results.value = data.value.fieldsOfLaw

    if (results.value?.[0]) {
      nodeOfInterest.value = results.value[0]
    }
    showNorms.value = !!norm.value || showNorms.value
    isResetButtonVisible.value = true
  } else {
    currentPage.value = undefined
    results.value = undefined
    searchErrorLabel.value =
      'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.'
  }
}

const addFieldOfLaw = async (fieldOfLaw: FieldOfLaw) => {
  if (!selectedNodes.value?.find((entry) => entry.identifier === fieldOfLaw.identifier)) {
    selectedNodes.value?.push(fieldOfLaw)
  }
  await setScrollPosition()
}

const removeFieldOfLaw = async (fieldOfLaw: FieldOfLaw) => {
  selectedNodes.value =
    selectedNodes.value?.filter((entry) => entry.identifier !== fieldOfLaw.identifier) ?? []
  await setScrollPosition()
}

const setScrollPosition = async () => {
  const container = document.documentElement
  const previousHeight = container.scrollHeight
  await nextTick(() => {
    const addedHeight = container.scrollHeight - previousHeight
    container.scrollTop += addedHeight
  })
}

function setNodeOfInterest(node: FieldOfLaw) {
  nodeOfInterest.value = node
}

function removeNodeOfInterest() {
  nodeOfInterest.value = undefined
}

function updateIdentifierSearchTerm(newValue?: string) {
  identifier.value = newValue ?? ''
}

function updateDescriptionSearchTerm(newValue?: string) {
  description.value = newValue ?? ''
}

function updateNormSearchTerm(newValue?: string) {
  norm.value = newValue ?? ''
}

async function addFromList(fieldOfLaw: FieldOfLaw) {
  await addFieldOfLaw(fieldOfLaw)
  setNodeOfInterest(fieldOfLaw)
}

function resetSearch() {
  // reset search params
  identifier.value = ''
  description.value = ''
  norm.value = ''
  searchErrorLabel.value = undefined
  // reset search results list
  currentPage.value = undefined
  results.value = undefined
  // reset tree
  nodeOfInterest.value = undefined
  showNorms.value = false
  if (treeRef.value && typeof treeRef.value.collapseTree === 'function') {
    treeRef.value.collapseTree()
  }
  isResetButtonVisible.value = false
}

const inputMethod = ref(InputMethod.DIRECT)
function updateInputMethod(value: InputMethod) {
  inputMethod.value = value
}
</script>

<template>
  <FieldOfLawExpandableContainer
    v-if="selectedNodes"
    :fields-of-law="selectedNodes"
    :is-reset-button-visible="isResetButtonVisible"
    @editing-done="resetSearch"
    @input-method-selected="updateInputMethod"
    @node:clicked="setNodeOfInterest"
    @node:remove="removeFieldOfLaw"
    @reset-search="resetSearch"
  >
    <FieldOfLawDirectInputSearch
      v-if="inputMethod === InputMethod.DIRECT"
      @add-to-list="addFieldOfLaw"
    />

    <FieldOfLawSearchInput
      v-if="inputMethod === InputMethod.SEARCH"
      v-model:description="description"
      v-model:identifier="identifier"
      v-model:norm="norm"
      :error-label="searchErrorLabel"
      @search="submitSearch(0)"
      @update:description="updateDescriptionSearchTerm"
      @update:identifier="updateIdentifierSearchTerm"
      @update:norm="updateNormSearchTerm"
    />

    <div v-if="inputMethod === InputMethod.SEARCH" class="flex w-full flex-row gap-24">
      <FieldOfLawSearchResultList
        :current-page="currentPage"
        :results="results"
        @linked-field:clicked="setNodeOfInterest"
        @node:add="addFromList"
        @search="submitSearch"
      />

      <FieldOfLawTree
        v-if="selectedNodes"
        ref="treeRef"
        :selected-nodes="selectedNodes"
        :node-of-interest="nodeOfInterest"
        :search-results="results"
        :show-norms="showNorms"
        @linked-field:select="setNodeOfInterest"
        @node-of-interest:reset="removeNodeOfInterest"
        @node:add="addFieldOfLaw"
        @node:remove="removeFieldOfLaw"
        @toggle-show-norms="showNorms = !showNorms"
      />
    </div>
  </FieldOfLawExpandableContainer>
</template>

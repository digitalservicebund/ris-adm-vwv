<script setup lang="ts">
import FieldOfLawSearchResultsListItem from './FieldOfLawSearchResultsListItem.vue'
import Pagination, { type Page } from '@/components/Pagination.vue'
import type { FieldOfLaw } from '@/domain/fieldOfLaw'
import errorMessages from '@/i18n/errors.json'

defineProps<{
  currentPage?: Page
  results?: FieldOfLaw[]
}>()

const emit = defineEmits<{
  search: [page: number]
  'node:add': [node: FieldOfLaw]
  'linkedField:clicked': [node: FieldOfLaw]
}>()
</script>

<template>
  <div v-if="currentPage" class="flex flex-1 flex-col">
    <Pagination
      navigation-position="bottom"
      :page="currentPage"
      @update-page="(page: number) => emit('search', page)"
    >
      <FieldOfLawSearchResultsListItem
        v-for="(fieldOfLawNode, idx) in results"
        :key="idx"
        :field-of-law="fieldOfLawNode"
        @linked-field:clicked="emit('linkedField:clicked', $event)"
        @node:add="emit('node:add', fieldOfLawNode)"
      />
    </Pagination>
    <div v-if="currentPage?.empty">
      {{ errorMessages.SEARCH_RESULTS_NOT_FOUND.title }}
    </div>
  </div>
</template>

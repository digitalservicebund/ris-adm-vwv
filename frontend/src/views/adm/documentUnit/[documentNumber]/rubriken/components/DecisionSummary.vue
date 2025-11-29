<script lang="ts" setup>
import { computed, toRaw, ref } from 'vue'
import type { Component } from 'vue'
import { DisplayMode } from './enumDisplayMode'
import IconBadge from '@/components/IconBadge.vue'
import { useStatusBadge } from '@/composables/useStatusBadge'
import { PublicationState } from '@/domain/publicationStatus'
import { type PublicationStatus } from '@/domain/publicationStatus'
import BaselineArrowOutward from '~icons/ic/baseline-arrow-outward'

interface Props {
  summary: string
  status?: PublicationStatus
  documentNumber?: string
  displayMode?: DisplayMode
  icon?: Component
  linkClickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: DisplayMode.TAB,
  status: undefined,
  documentNumber: undefined,
  icon: undefined,
  linkClickable: true,
})
const statusBadge = ref(
  useStatusBadge({
    publicationStatus: PublicationState.UNPUBLISHED,
  }).value,
)

const summary = computed(() => (props.status ? `${props.summary},  ` : props.summary))

const divider = computed(() => (props.documentNumber ? ` | ` : undefined))

const href = computed(() =>
  props.documentNumber
    ? `https://ris-search.dev.ds4g.net/case-law/${props.documentNumber}`
    : undefined,
)
</script>

<template>
  <div class="flex justify-between">
    <div class="flex flex-row items-center">
      <component :is="icon" v-if="icon" class="mr-8 min-w-24" />
      <span class="mr-8" :data-testid="'decision-summary-' + documentNumber">
        <span>
          {{ summary }}
          <IconBadge
            v-if="status"
            :background-color="statusBadge.backgroundColor"
            class="ml-4 inline-block"
            :color="statusBadge.color"
            :icon="toRaw(statusBadge.icon)"
            :label="statusBadge.label"
          />
          {{ divider }}

          <span v-if="!linkClickable"> {{ documentNumber }}</span>
          <!-- open preview in new tab -->
          <a
            v-else-if="documentNumber && props.displayMode === DisplayMode.TAB"
            :href="href"
            class="ris-link1-bold whitespace-nowrap no-underline focus:outline-none focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
            :data-testid="'document-number-link-' + documentNumber"
            tabindex="-1"
            target="_blank"
          >
            {{ documentNumber }}
            <BaselineArrowOutward class="mb-4 inline w-24" />
          </a>
          <!-- or open preview in sidepanel -->
          <span v-else-if="documentNumber && props.displayMode === DisplayMode.SIDEPANEL">
            <button
              class="ris-link1-bold whitespace-nowrap leading-24 no-underline focus:outline-none focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
              :data-testid="'document-number-link-' + documentNumber"
            >
              {{ documentNumber }}
              <BaselineArrowOutward class="mb-4 inline w-24" />
            </button>
          </span>
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import IconBadge from '@/components/IconBadge.vue'
import Reference from '@/domain/reference'

const props = defineProps<{
  data: Reference
}>()

const hasAmbiguousLegalPeriodicalAbbreviation = computed(
  () => !props.data?.legalPeriodical && !!props.data?.legalPeriodicalRawValue,
)
</script>

<template>
  <div class="flex w-full justify-between">
    <div class="flex flex-row items-center">
      <div class="ds-label-01-reg mr-8">
        {{ data.renderSummary }}
      </div>
      <IconBadge
        v-if="hasAmbiguousLegalPeriodicalAbbreviation"
        background-color="bg-red-300"
        color="text-red-900"
        label="Mehrdeutiger Verweis"
      />
    </div>
  </div>
</template>

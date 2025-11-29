<script lang="ts" setup>
import ToolTip from '@/components/ToolTip.vue'
import DocumentationUnitSummary from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/DocumentationUnitSummary.vue'
import Button from 'primevue/button'
import ActiveCitation from '@/domain/activeCitation'
import IconBaselineContentCopy from '~icons/ic/baseline-content-copy'

const props = defineProps<{
  data: ActiveCitation
}>()

async function copySummary() {
  if (props.data) await navigator.clipboard.writeText(props.data.renderSummary)
}
</script>

<template>
  <div class="flex w-full justify-between">
    <DocumentationUnitSummary :data="data"> </DocumentationUnitSummary>

    <!-- Button group -->
    <div class="flex flex-row -space-x-2">
      <ToolTip text="Kopieren">
        <Button
          id="category-import"
          aria-label="Aktivzitierung in die Zwischenablage kopieren"
          data-testid="copy-summary"
          size="small"
          text
          @click="copySummary"
          @keypress.enter="copySummary"
        >
          <template #icon> <IconBaselineContentCopy /> </template>
        </Button>
      </ToolTip>
    </div>
  </div>
</template>

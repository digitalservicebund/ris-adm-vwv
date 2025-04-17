<script setup lang="ts">
import Button from 'primevue/button'
import ToolTip from '@/components/ToolTip.vue'
import IconStickyNote from '~icons/ic/outline-sticky-note-2'

const props = defineProps<{
  hidePanelModeBar?: boolean
}>()
</script>

<template>
  <div class="m-24 flex flex-row justify-between">
    <div v-if="!props.hidePanelModeBar" class="flex flex-row -space-x-2">
      <ToolTip text="Notiz">
        <Button
          id="note"
          aria-label="Notiz anzeigen"
          class="flex bg-blue-200"
          data-testid="note-button"
          size="small"
          severity="secondary"
        >
          <template #icon> <IconStickyNote /> </template>
        </Button>
      </ToolTip>
    </div>
  </div>
</template>

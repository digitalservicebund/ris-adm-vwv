<script setup lang="ts">
import type { Component } from 'vue'
import { computed, onMounted } from 'vue'
import ExtraContentSidePanelMenu from '@/components/ExtraContentSidePanelMenu.vue'
import FlexItem from '@/components/FlexItem.vue'
import InputField from '@/components/input/InputField.vue'
import TextAreaInput from '@/components/input/TextAreaInput.vue'
import SideToggle from '@/components/SideToggle.vue'
import { OpeningDirection } from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/enumDisplayMode'
import { useExtraContentSidePanelStore } from '@/stores/extraContentSidePanelStore'
import { useRoute } from 'vue-router'
import type { DocumentationUnit } from '@/domain/documentUnit'

const props = defineProps<{
  documentUnit?: DocumentationUnit
  showEditButton?: boolean
  hidePanelModeBar?: boolean
  sidePanelShortcut?: string
  icon?: Component
}>()

const store = useExtraContentSidePanelStore()

const route = useRoute()

const hasNote = computed(() => {
  return !!props.documentUnit!.note && props.documentUnit!.note.length > 0
})

const shortCut = computed(() => props.sidePanelShortcut ?? '<')

/**
 * Expands or collapses the panel.
 * Can be forced by passing a boolean parameter. Otherwise, it will collapse when expanded and expand when collapsed.
 * Pushes the state to the route as a query parameter.
 * @param expand optional boolean to enforce expanding or collapsing
 */
function togglePanel(expand?: boolean): boolean {
  return store.togglePanel(expand)
}

/**
 * Checks whether the panel should be expanded when it is mounted.
 * If the showNotePanel query parameter is present in the route, its value is taken. This parameter is only present,
 * after the user first interacts with the panel, by expanding or collapsing it manually.
 * This ensures that their selection does not get overridden.
 * If the query is not present, the panel is expanded by default if a note is present.
 * Otherwise, it is collapsed by default.
 */
onMounted(() => {
  if (route.query.showNotePanel) {
    store.isExpanded = route.query.showNotePanel === 'true'
  } else {
    store.isExpanded = hasNote.value || false
  }
})
</script>

<template>
  <FlexItem
    class="h-full flex-col border-l-1 border-solid border-gray-400 bg-white"
    :class="[store.isExpanded ? 'flex-1' : '', store.isExpanded ? 'w-1/2' : '']"
    data-testid="attachment-view-side-panel"
  >
    <SideToggle
      class="sticky top-[4rem] z-20 max-h-fit"
      custom-button-classes="top-24 pt-4"
      :icon="icon"
      :is-expanded="store.isExpanded"
      label="Seitenpanel"
      :opening-direction="OpeningDirection.LEFT"
      :shortcut="shortCut"
      tabindex="0"
      @update:is-expanded="togglePanel"
    >
      <ExtraContentSidePanelMenu
        :document-unit="props.documentUnit"
        :hide-panel-mode-bar="props.hidePanelModeBar"
        :show-edit-button="props.showEditButton"
      />
      <div class="m-24">
        <div>
          <InputField id="notesInput" v-slot="{ id }" label="Notiz">
            <TextAreaInput
              :id="id"
              v-model="props.documentUnit!.note"
              ariaLabel="Notiz Eingabefeld"
              autosize
              class="w-full"
              custom-classes="max-h-[65vh]"
            />
          </InputField>
        </div>
      </div>
    </SideToggle>
  </FlexItem>
</template>

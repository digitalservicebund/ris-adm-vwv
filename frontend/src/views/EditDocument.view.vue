<script lang="ts" setup>
import { ref, type Ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import DocumentUnitInfoPanel from '@/components/DocumentUnitInfoPanel.vue'
import FlexContainer from '@/components/FlexContainer.vue'
import NavbarSide from '@/components/NavbarSide.vue'
import SideToggle from '@/components/SideToggle.vue'
import { getAdmVwvMenuItems, getUliMenuItems, getSliMenuItems } from '@/utils/menuItems'
import ExtraContentSidePanel from '@/components/ExtraContentSidePanel.vue'
import { useToast } from 'primevue'
import errorMessages from '@/i18n/errors.json'
import { useStoreForRoute } from '@/composables/useStoreForRoute'
import type { DocumentUnitStore } from '@/stores/types'
import { DocumentCategory } from '@/domain/documentType'

const props = defineProps<{
  documentNumber: string
}>()

const toast = useToast()

const store = useStoreForRoute<DocumentUnitStore>()

const { documentUnit, error } = storeToRefs(store)

const route = useRoute()
const menuItems = computed(() => {
  if (route.meta.documentCategory === DocumentCategory.LITERATUR_UNSELBSTAENDIG) {
    return getUliMenuItems(props.documentNumber, route.query)
  }
  if (route.meta.documentCategory === DocumentCategory.LITERATUR_SELBSTAENDIG) {
    return getSliMenuItems(props.documentNumber, route.query)
  }
  return getAdmVwvMenuItems(props.documentNumber, route.query)
})

const showNavigationPanelRef: Ref<boolean> = ref(route.query.showNavigationPanel !== 'false')

function toggleNavigationPanel(expand?: boolean) {
  showNavigationPanelRef.value = expand === undefined ? !showNavigationPanelRef.value : expand
}

onBeforeUnmount(async () => {
  await store.unload()
})

onMounted(async () => {
  await store.load(props.documentNumber)
})

watch(
  () => error,
  (err) => {
    if (err) {
      toast.add({
        severity: 'error',
        summary: errorMessages.DOCUMENT_UNIT_COULD_NOT_BE_LOADED.title,
      })
    }
  },
)
</script>

<template>
  <div class="flex w-screen grow">
    <div
      v-if="documentUnit"
      class="sticky top-0 z-50 flex flex-col border-r-1 border-solid border-gray-400 bg-white"
    >
      <SideToggle
        class="sticky top-0 z-20"
        data-testid="side-toggle-navigation"
        :is-expanded="showNavigationPanelRef"
        label="Navigation"
        tabindex="0"
        test-id="side-toggle-navigation"
        @update:is-expanded="toggleNavigationPanel"
      >
        <NavbarSide :is-child="false" :menu-items="menuItems" :route="route" />
      </SideToggle>
    </div>
    <div v-if="documentUnit" class="flex w-full min-w-0 flex-col bg-gray-100">
      <DocumentUnitInfoPanel
        data-testid="document-unit-info-panel"
        :heading="documentUnit?.documentNumber ?? ''"
        :hide-save-button="route.path.includes('abgabe')"
      />
      <div class="flex grow flex-col items-start">
        <FlexContainer
          class="h-full w-full flex-grow"
          :class="route.path.includes('preview') ? 'flex-row bg-white' : 'flex-row-reverse'"
        >
          <ExtraContentSidePanel
            v-if="documentUnit && !route.path.includes('abgabe')"
            :document-unit="documentUnit"
          ></ExtraContentSidePanel>
          <router-view />
        </FlexContainer>
      </div>
    </div>
  </div>
</template>

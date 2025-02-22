<script lang="ts" setup>
import { ref, type Ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import DocumentUnitInfoPanel from '@/components/DocumentUnitInfoPanel.vue'
import FlexContainer from '@/components/FlexContainer.vue'
import NavbarSide from '@/components/NavbarSide.vue'
import ErrorPage from '@/components/PageError.vue'
import SideToggle from '@/components/SideToggle.vue'
import { type ResponseError } from '@/services/httpClient'
import { useDocumentUnitStore } from '@/stores/documentUnitStore'
import { useAdmVwvMenuItems } from '@/composables/useAdmVwvMenuItems'
import type { DocumentUnit } from '@/domain/documentUnit'

const props = defineProps<{
  documentNumber: string
}>()

const store = useDocumentUnitStore()

const { documentUnit } = storeToRefs(store) as {
  documentUnit: Ref<DocumentUnit>
}

const route = useRoute()
const menuItems = useAdmVwvMenuItems(props.documentNumber, route.query)

const showNavigationPanelRef: Ref<boolean> = ref(route.query.showNavigationPanel !== 'false')

function toggleNavigationPanel(expand?: boolean) {
  showNavigationPanelRef.value = expand === undefined ? !showNavigationPanelRef.value : expand
}

const responseError = ref<ResponseError>()
async function requestDocumentUnitFromServer() {
  const response = await store.loadDocumentUnit(props.documentNumber)

  if (!response.data) {
    responseError.value = response.error
  }
}

onBeforeUnmount(async () => {
  await store.unloadDocumentUnit()
})

onMounted(async () => {
  await requestDocumentUnitFromServer()
})
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
      />
      <div class="flex grow flex-col items-start">
        <FlexContainer
          class="h-full w-full flex-grow"
          :class="route.path.includes('preview') ? 'flex-row bg-white' : 'flex-row-reverse'"
        >
          <router-view />
        </FlexContainer>
      </div>
    </div>
    <ErrorPage v-if="responseError" :error="responseError" :title="responseError?.title" />
  </div>
</template>

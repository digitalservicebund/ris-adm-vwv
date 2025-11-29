<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'

export type RisTab = {
  id: string
  routeName: string
  label: string
  documentCategory?: string
}

const props = defineProps<{
  tabs: RisTab[]
  defaultTab?: string
}>()

const route = useRoute()
const router = useRouter()

const activeTabValue = computed(() => {
  if (route.meta.documentCategory) {
    const matchingTab = props.tabs.find(
      (tab) => tab.documentCategory === route.meta.documentCategory,
    )
    if (matchingTab) {
      return matchingTab.id
    }
  }

  return props.defaultTab || props.tabs[0]?.id || ''
})

function handleTabChange(value: string | number) {
  const tabId = String(value)
  const tab = props.tabs.find((t) => t.id === tabId)
  if (tab) {
    router.push({ name: tab.routeName })
  }
}
</script>

<template>
  <Tabs :value="activeTabValue" @update:value="handleTabChange" class="flex-1">
    <TabList>
      <Tab v-for="tab in tabs" :key="tab.id" :value="tab.id">
        <router-link
          :to="{ name: tab.routeName }"
          class="w-full h-full flex items-center justify-center no-underline"
          tabindex="-1"
          @click.prevent
        >
          {{ tab.label }}
        </router-link>
      </Tab>
    </TabList>
  </Tabs>
</template>

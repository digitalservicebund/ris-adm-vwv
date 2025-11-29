<script lang="ts" setup>
import { computed } from 'vue'
import ListInput from '@/components/input/listinput/ListInput.vue'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'

const emit = defineEmits<{
  reset: []
}>()

const store = useAdmDocUnitStore()

const keywords = computed({
  get: () => store.documentUnit!.keywords ?? [],
  set: (newValues: string[]) => {
    store.documentUnit!.keywords = newValues
  },
})
</script>

<template>
  <div>
    <h2 class="ris-label1-bold mb-16">Schlagwörter</h2>
    <ListInput v-model="keywords" label="Schlagwörter" @reset="emit('reset')" />
  </div>
</template>

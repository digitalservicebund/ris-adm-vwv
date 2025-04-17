<script lang="ts" setup>
import Button from 'primevue/button'
import { computed } from 'vue'
import IconAdd from '~icons/material-symbols/add'

const props = defineProps<{
  label: string
  chips: string[]
}>()

const emit = defineEmits<{
  toggle: []
}>()

function normalize(str: string) {
  return str.replace(/[^A-Z0-9]/gi, '_').toLowerCase()
}

const buttonLabel = computed(() =>
  props.chips.length > 0 ? `${props.label} bearbeiten` : `${props.label} hinzufügen`,
)
</script>

<template>
  <div class="flex scroll-m-64 flex-col">
    <div v-if="chips.length > 0" class="flex flex-col gap-4 mb-16">
      <ul class="m-0 flex flex-row flex-wrap gap-8 p-0">
        <li v-for="chip in chips" :key="chip" class="rounded-full bg-blue-300" data-testid="chip">
          <span
            class="overflow-hidden text-ellipsis whitespace-nowrap px-8 py-6 text-18"
            :data-testid="`ListInputDisplay_${normalize(label)}_${normalize(chip)}`"
            >{{ chip }}
          </span>
        </li>
      </ul>
    </div>
    <Button
      v-if="chips.length > 0"
      :aria-label="buttonLabel"
      class="self-start"
      :label="buttonLabel"
      size="small"
      severity="secondary"
      @click.stop="emit('toggle')"
    />
    <Button
      v-else
      :aria-label="buttonLabel"
      class="self-start"
      :label="buttonLabel"
      size="small"
      severity="secondary"
      @click.stop="emit('toggle')"
    >
      <template #icon> <IconAdd /> </template>
    </Button>
  </div>
</template>

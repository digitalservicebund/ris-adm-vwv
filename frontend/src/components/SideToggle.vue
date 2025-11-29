<script lang="ts" setup>
import { type Component, computed } from 'vue'
import IconChevronLeft from '~icons/ic/baseline-chevron-left'
import IconChevronRight from '~icons/ic/baseline-chevron-right'
import ToolTip from '@/components/ToolTip.vue'
import { OpeningDirection } from '@/views/adm/documentUnit/[documentNumber]/rubriken/components/enumDisplayMode'

interface Props {
  isExpanded?: boolean
  openingDirection?: OpeningDirection
  label?: string
  shortcut?: string
  icon?: Component
  customButtonClasses?: string
}

const props = withDefaults(defineProps<Props>(), {
  isExpanded: false,
  openingDirection: OpeningDirection.RIGHT,
  label: 'side toggle',
  shortcut: undefined,
  icon: undefined,
  customButtonClasses: '',
})

const emit = defineEmits<{
  'update:isExpanded': [value: boolean]
}>()

const postFix = computed(() => (props.isExpanded ? 'schließen' : 'öffnen'))

const classes = computed(() => ({
  'pl-24': props.openingDirection == OpeningDirection.RIGHT && !props.isExpanded,
  'pr-24': props.openingDirection == OpeningDirection.LEFT && !props.isExpanded,
}))

const buttonClasses = computed(() => ({
  'right-0 -mr-16': props.openingDirection == OpeningDirection.RIGHT,
  'left-0 -ml-24': props.openingDirection == OpeningDirection.LEFT,
  [props.customButtonClasses]: props.customButtonClasses,
}))

const toggle = () => {
  emit('update:isExpanded', !props.isExpanded)
}
</script>

<template>
  <div class="relative bg-white" :class="classes">
    <ToolTip
      class="!absolute top-16 z-20"
      :class="buttonClasses"
      :text="props.label + ' ' + postFix"
    >
      <button
        :aria-label="props.label + ' ' + postFix"
        class="w-icon relative flex min-h-32 min-w-32 items-center justify-center rounded-full border-1 border-solid border-gray-400 bg-white text-gray-900 cursor-pointer"
        @click="toggle"
      >
        <component :is="icon" v-if="icon" class="text-blue-800" />
        <IconChevronLeft
          v-else-if="props.openingDirection === OpeningDirection.LEFT ? !isExpanded : isExpanded"
        />
        <IconChevronRight v-else />
      </button>
    </ToolTip>
    <div v-show="isExpanded">
      <slot />
    </div>
  </div>
</template>

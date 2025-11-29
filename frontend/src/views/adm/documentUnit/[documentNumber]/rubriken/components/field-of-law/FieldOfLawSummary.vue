<script lang="ts" setup>
import TokenizeText from '@/components/TokenizeText.vue'
import Tooltip from '@/components/ToolTip.vue'
import { type FieldOfLaw } from '@/domain/fieldOfLaw'
import MaterialSymbolsClose from '~icons/material-symbols/close'

defineProps<{
  fieldsOfLaw: FieldOfLaw[]
}>()

const emit = defineEmits<{
  'node:remove': [node: FieldOfLaw]
  'node:clicked': [node: FieldOfLaw]
}>()

function removeFieldOfLaw(fieldOfLaw: FieldOfLaw) {
  emit('node:remove', fieldOfLaw)
}

function fieldOfLawClicked(fieldOfLaw: FieldOfLaw) {
  emit('node:clicked', fieldOfLaw)
}

function isNotationNew(fieldOfLaw: FieldOfLaw) {
  return fieldOfLaw.notation && fieldOfLaw.notation == 'NEW'
}
</script>

<template>
  <div class="flex w-full justify-between">
    <div class="flex w-full flex-col">
      <div
        v-for="fieldOfLaw in fieldsOfLaw"
        :key="fieldOfLaw.identifier"
        class="field-of-law flex w-full flex-row items-center border-b-1 border-blue-300 py-16 first:mt-16 first:border-t-1 last:mb-16"
      >
        <div class="ris-label1-regular mr-8 flex-grow">
          <button
            v-if="isNotationNew(fieldOfLaw)"
            :aria-label="
              fieldOfLaw.identifier + ' ' + fieldOfLaw.text + ' im Sachgebietsbaum anzeigen'
            "
            class="ris-link1-bold mr-8"
            @click="fieldOfLawClicked(fieldOfLaw)"
          >
            {{ fieldOfLaw.identifier }}
          </button>
          <span class="mr-8 font-bold" v-else>
            {{ fieldOfLaw.identifier }}
          </span>
          <TokenizeText
            :keywords="isNotationNew(fieldOfLaw) ? (fieldOfLaw.linkedFields ?? []) : []"
            :text="fieldOfLaw.text"
            @linked-field:clicked="fieldOfLawClicked"
          />
        </div>

        <Tooltip text="Entfernen">
          <button
            :aria-label="fieldOfLaw.identifier + ' ' + fieldOfLaw.text + ' aus Liste entfernen'"
            class="flex items-center justify-center text-blue-800 hover:bg-blue-100 focus:shadow-[inset_0_0_0_0.125rem] focus:shadow-blue-800 focus:outline-none cursor-pointer"
            @click="removeFieldOfLaw(fieldOfLaw)"
            @keypress.enter="removeFieldOfLaw(fieldOfLaw)"
          >
            <MaterialSymbolsClose />
          </button>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

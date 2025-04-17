<script lang="ts" setup>
import FlexContainer from '@/components/FlexContainer.vue'
import FlexItem from '@/components/FlexItem.vue'
import IconBadge from '@/components/IconBadge.vue'
import IconPermIdentity from '~icons/ic/baseline-perm-identity'
</script>

<template>
  <nav class="flex items-center justify-between border-y border-gray-400 py-16 pe-16 print:hidden">
    <div class="flex items-center gap-44">
      <div class="flex items-center">
        <span class="px-[1rem] text-14 font-bold uppercase leading-16">
          Rechtsinformationen
          <br />
          des Bundes
        </span>
      </div>
    </div>
    <div class="grid grid-cols-[auto,1fr] gap-10">
      <IconPermIdentity data-testid="iconPermIdentity" />
      <div>
        <div class="ris-label1-regular">
          <FlexContainer>
            <FlexItem class="pe-8">Vorname Nachname</FlexItem>
            <FlexItem>
              <IconBadge
                :background-color="'bg-red-300'"
                color="text-black"
                :label="'BSG | Staging'"
              />
            </FlexItem>
          </FlexContainer>
        </div>
      </div>
    </div>
  </nav>
</template>

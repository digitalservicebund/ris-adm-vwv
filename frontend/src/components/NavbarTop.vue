<script lang="ts" setup>
import FlexContainer from '@/components/FlexContainer.vue'
import FlexItem from '@/components/FlexItem.vue'
import IconBadge from '@/components/IconBadge.vue'
import { useAuthentication } from '@/services/auth'
import IconPermIdentity from '~icons/ic/baseline-perm-identity'

const { getUsername } = useAuthentication()
</script>

<template>
  <nav class="flex items-center justify-between border-y border-gray-400 px-16 py-16 print:hidden">
    <div class="flex items-center gap-44">
      <div class="flex flex-col">
        <span class="ris-body1-bold">Rechtsinformationen</span>
        <span class="leading-none text-gray-900">des Bundes</span>
      </div>
    </div>
    <div class="flex items-center gap-10">
      <IconPermIdentity data-testid="iconPermIdentity" />
      <div>
        <FlexContainer>
          <FlexItem class="pe-8">
            {{ getUsername() ?? 'Vorname Nachname' }}
          </FlexItem>
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
  </nav>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import { useRoute } from 'vue-router'
import IconAdd from '~icons/material-symbols/add'

defineProps<{
  title: string
}>()

const route = useRoute()
</script>

<template>
  <div class="flex flex-col gap-16 p-24 bg-white">
    <div class="flex justify-between items-end">
      <h1 class="ris-heading2-regular">{{ title }}</h1>

      <router-link :to="`${route.path}/dokumentationseinheit/new`">
        <Button label="Neue Dokumentationseinheit">
          <template #icon>
            <IconAdd />
          </template>
        </Button>
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import IconAdd from '~icons/material-symbols/add'
</script>

<template>
  <div class="flex flex-col gap-16 p-24 bg-white">
    <div class="flex justify-between items-end">
      <h1 class="ris-heading2-regular">Unselbstständige Literatur</h1>
      <Button label="Neue Dokumentationseinheit">
        <template #icon>
          <IconAdd />
        </template>
      </Button>
    </div>
  </div>
</template>

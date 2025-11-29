<script lang="ts" setup>
import FundstellenList from './components/FundstellenList.vue'
</script>

<template>
  <div class="flex w-full flex-1 grow flex-col p-24">
    <div aria-label="Fundstellen" class="flex flex-col gap-24 bg-white p-24">
      <FundstellenList />
    </div>
  </div>
</template>

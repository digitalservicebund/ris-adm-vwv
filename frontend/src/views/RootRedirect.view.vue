<script setup lang="ts">
import { ROUTE_NAMES } from '@/constants/routes'
import Button from 'primevue/button'
</script>

<template>
  <div class="mt-48 ml-48 gap-16 p-16">
    <h1 class="ris-heading2-regular mb-32">Diese Internetseite existiert nicht.</h1>
    <p class="mb-16">
      <strong>Haben Sie die Internetadresse direkt eingegeben?</strong><br />
      Überprüfen Sie die Schreibweise.
    </p>
    <p class="mb-32">
      <strong>Haben Sie die Internetadresse kopiert?</strong><br />
      Überprüfen Sie, ob Sie die gesamte Adresse kopiert haben.
    </p>
    <div class="flex gap-16">
      <router-link :to="{ name: ROUTE_NAMES.ULI.START_PAGE }">
        <Button label="Zur Übersicht Literatur" />
      </router-link>
      <router-link :to="{ name: ROUTE_NAMES.ADM.START_PAGE }">
        <Button label="Zur Übersicht Verwaltungsvorschriften" />
      </router-link>
    </div>
  </div>
</template>

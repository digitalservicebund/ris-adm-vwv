<script setup lang="ts">
import Button from 'primevue/button'
</script>

<template>
  <div class="mt-48 ml-48 gap-16 p-16">
    <h1 class="ris-heading2-regular mb-32">
      Diese Dokumentationseinheit existiert nicht oder Sie haben keine Berechtigung.
    </h1>
    <p class="mb-16">
      <strong>Haben Sie die Internetadresse direkt eingegeben?</strong><br />
      Überprüfen Sie die Schreibweise.
    </p>
    <p class="mb-32">
      <strong>Haben Sie die Internetadresse kopiert?</strong><br />
      Überprüfen Sie, ob Sie die gesamte Adresse kopiert haben.
    </p>
    <router-link :to="{ name: 'RootRedirect' }">
      <Button label="Zurück zur Startseite" />
    </router-link>
  </div>
</template>

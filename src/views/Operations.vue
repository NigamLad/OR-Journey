<script setup lang="ts">
import Card from "../components/Card.vue";

// const account = getAccount();
</script>

<template>
  <div class="relative h-full w-full flex-col overflow-x-hidden touch-pan-y space-y-4 p-4">
    <div class="w-full flex grid  grid-cols-2 gap-5">
      <Card />
      <Card />
      <Card />
      
    </div>
  </div>
</template>

<style scoped>
#welcome-message {
  font-size: 32px;
}

</style>

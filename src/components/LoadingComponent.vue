<script setup lang="ts">

</script>

<template>
    <div class="loader flex items-center justify-center m-auto h-full w-full"></div>
</template>

<style scoped>
.loader {
  width: 3em;
  height: 3em;
  background: linear-gradient(-45deg, #623e59 0%, #34695d 100% );
  animation: spin 3s infinite;
  border-radius: 10%;
}

.loader::before {
  content: "";
  z-index: -1;
  position: absolute;
  inset: 0;
  background: linear-gradient(-45deg, #623e59 0%, #34695d 100% );
  transform: translate3d(0, 0, 0) scale(0.95);
  filter: blur(20px);
}

@keyframes spin {
  0% {
    transform: rotate(-45deg);
  }

  50% {
    transform: rotate(-360deg);
    border-radius: 50%;
  }

  100% {
    transform: rotate(-45deg);
  }
}
</style>
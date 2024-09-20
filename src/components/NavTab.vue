<script setup lang="ts">

</script>

<template>
    <svg id="tab" class="absolute opacity" viewBox="0 0 180 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m 180 60 h -180 c 20 0 15 -60 40 -60 h 100 c 25 0 20 60 40 60 z" fill="black"/>
    </svg>
</template>

<style scoped>
    #tab {
        width: calc(100% + 40%);
        height:60px;
        left:calc(0% - 20%);
        bottom:calc(0% - 20px);
        transform-origin: bottom;
    }
</style>
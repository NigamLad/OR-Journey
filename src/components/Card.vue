<script setup lang="ts">

</script>

<template>
    <div id="card" class="flex flex-col w-full h-full">
        <div class="">
            <slot name="title"></slot>
        </div>
        <div class="h-full">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<style scoped>
#card {
    padding: 1em;
    border-radius: 10px;
    background: radial-gradient(50% 90% at 100% 100%, #2C1C28 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , radial-gradient(50% 90% at 0% -1.92%, #172E29 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , #1C1C1C;
    min-width: 140px;
    width: 100%;
    min-height: 100px;
}
</style>
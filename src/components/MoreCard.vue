<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { initClickHandler } from "../scripts/clickAnimation";
onMounted(() => {
    initClickHandler(getCurrentInstance()?.vnode.el)
})
</script>

<template>
<div id="card" class="relative w-1/2 flex flex-col place-content-evenly items-center gap-0">
    <p class="text-center">More</p>
    <svg id="arrow" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16ZM32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16ZM9 15C8.44771 15 8 15.4477 8 16C8 16.5523 8.44771 17 9 17H20.5858L16.2929 21.2929C15.9024 21.6834 15.9024 22.3166 16.2929 22.7071C16.6834 23.0976 17.3166 23.0976 17.7071 22.7071L23.7071 16.7071C24.0976 16.3166 24.0976 15.6834 23.7071 15.2929L17.7071 9.29289C17.3166 8.90237 16.6834 8.90237 16.2929 9.29289C15.9024 9.68342 15.9024 10.3166 16.2929 10.7071L20.5858 15H9Z" fill="white"/>
    </svg>
</div>

</template>

<style scoped>
    #card {
        padding: 1em;
        border-radius: 10px;
        border: 2px solid white;
        width: 100px;
        height: 130px;
    }

    #arrow {

    }
</style>
<script setup lang="ts">
import { ref, watch } from 'vue';

const hoverState = ref(false);

watch(hoverState, (newVal) => {
    console.log(newVal)
})

</script>

<template>
    <div class="pl-2 select-none relative" @click="hoverState = !hoverState" @blur="hoverState = false" tabindex="0">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z" fill="white"/>
            <path d="M8.9307 6.58789L6.63969 6.875L6.55766 7.25586L7.00883 7.33789C7.3018 7.4082 7.36039 7.51367 7.29594 7.80664L6.55766 11.2754C6.3643 12.1719 6.66313 12.5938 7.36625 12.5938C7.91117 12.5938 8.54398 12.3418 8.83109 11.9961L8.91898 11.5801C8.71977 11.7559 8.4268 11.8262 8.23344 11.8262C7.95805 11.8262 7.85844 11.6328 7.92875 11.293L8.9307 6.58789Z" fill="white"/>
            <path d="M9 4.5C9 5.05228 8.55229 5.5 8 5.5C7.44772 5.5 7 5.05228 7 4.5C7 3.94772 7.44772 3.5 8 3.5C8.55229 3.5 9 3.94772 9 4.5Z" fill="white"/>
        </svg>
        <!-- <div v-if="true" class="relative fixed w-full h-full z-10">
            <div class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 border-2 border-white bg-black text-white rounded-lg box-shadow">
                <slot></slot>
            </div>
        </div> -->
        <div v-if="hoverState" class="absolute left-0 w-full h-full z-10">
            <div class="bottom-[0%] mx-auto w-[50vw] p-2 border-2 border-white bg-black text-white rounded-lg box-shadow">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
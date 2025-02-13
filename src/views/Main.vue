<script setup lang="ts">
import type { AccountInfo } from '@azure/msal-browser';
import { onMounted, ref } from 'vue';
import { state } from '@/config/msalConfig';
import Navbar from './Navbar.vue';

const container = ref()
onMounted(async () => {

    setTimeout(() => {
        container.value.classList.add("fadeIn")
    }, 500)
})

</script>

<template>
    <div id="container" ref="container" class="flex flex-col h-full w-full">
        <Navbar />
        <div id="spacer" class="w-full"></div>
        <RouterView v-slot="{ Component }">
            <Transition name="slide-fade" mode="out-in">
                <!-- <keep-alive :max="1"> -->
                <component :is="Component" :key="$route.path" />
                <!-- </keep-alive> -->
            </Transition>
        </RouterView>
    </div>
</template>

<style scoped>

#container {
    transition: all 1s;
    opacity: 0;
}

#container.fadeIn {
    opacity: 1;
}

.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

</style>
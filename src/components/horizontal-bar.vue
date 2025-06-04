<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    isExpanded: boolean
}>();

// Track whether the expansion is fully complete to trigger the second animation phase
const fullyExpanded = ref(false);

// Watch for changes to isExpanded prop
watch(() => props.isExpanded, (newValue) => {
    if (newValue) {
        // When expanding, first reset the fully expanded state
        fullyExpanded.value = false;
        
        // Then after a delay (to allow the horizontal animation to complete), set fully expanded
        setTimeout(() => {
            fullyExpanded.value = true;
        }, 300); // Match this with the transition time of the first phase
    } else {
        // When collapsing, immediately reset the fully expanded state
        fullyExpanded.value = false;
    }
}, { immediate: true });
</script>

<template>    <div 
        class="horizontal-bar-container relative w-16 h-2 cursor-pointer mx-auto transition-all duration-300 ease-in-out hover:w-20 hover:opacity-90" 
        :class="{ 'expanded': isExpanded, 'fully-expanded': fullyExpanded }" 
        :title="isExpanded ? 'Collapse view' : 'Expand view'"
    >
        <!-- Horizontal bar -->
        <div class="bar absolute w-full h-full bg-white rounded-full"></div>
    </div>
</template>

<style scoped>
/* Animation styles for the horizontal bar */
.bar {
    transition: all 0.5s ease;
}

/* Base state for horizontal bar */
.horizontal-bar-container {
    position: relative;
}

/* When expanded, make the bar slightly wider */
.horizontal-bar-container.expanded .bar {
    transform: scaleX(1.1);
    transition: transform 0.3s ease;
}

/* When fully expanded, add a slight glow effect */
.horizontal-bar-container.expanded.fully-expanded .bar {
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    transition-delay: 0.3s;
}

/* When collapsed, return to normal */
.horizontal-bar-container:not(.expanded) .bar {
    transform: scaleX(1);
}
</style>

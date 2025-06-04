<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import EventSlideshow from '@/components/EventSlideshow.vue';
import ClockNavigation from '@/components/ClockNavigation.vue';
import type { Operation } from '@/types';

const props = defineProps({
    id: { type: String, required: true }
});

const router = useRouter();
const operationInfo = ref<Operation | null>(null);
const currentEventIndex = ref(0);
const isExpandedView = ref(false);
const showFullEvents = ref(false);
const lastTransitionDirection = ref<'next' | 'prev' | 'direct'>('direct');
const expandProgress = ref(0); // Track the expansion progress (0-100%)

// Computed property to control the height based on drag progress
const expandedHeight = computed(() => {
    // Calculate height between 50% and 100% based on drag progress
    // Using cubic-bezier easing calculation for smoother feel during dragging
    const progress = expandProgress.value / 100;
    const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    return `${50 + (easedProgress * 50)}%`;
});

const loadOperation = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        operationInfo.value = operations[props.id];
    } catch (error) {
        console.log("Failed to load case")
        console.log(error)
    }
}

// Handle navigation between events
function goToEvent(index: number, direction: 'next' | 'prev' | 'direct' = 'direct') {
    // Store the direction for the transition
    lastTransitionDirection.value = direction;
    
    // Update the current event index
    currentEventIndex.value = index;
}

// Handle view toggling with simultaneous animations
function toggleView() {
    if (isExpandedView.value) {
        // Going back to not expanded - shrink events and show clock simultaneously
        showFullEvents.value = false;
        isExpandedView.value = false;
        expandProgress.value = 0;
    } else {
        // Going to expanded view - hide clock and expand events simultaneously
        isExpandedView.value = true;
        showFullEvents.value = true;
        expandProgress.value = 100;
    }
}

// Track if we're currently dragging
const isDragging = ref(false);

// Handle drag-based expansion
function handleExpandProgress(progress: number) {
    expandProgress.value = progress;
    
    // Set showFullEvents based on progress threshold
    showFullEvents.value = progress > 50;
    
    // Detect if this is a drag in progress vs. end of drag
    if (progress > 0 && progress < 100) {
        isDragging.value = true;
    } else {
        // When at 0 or 100, it's either completed or canceled drag
        if (isDragging.value) {
            isDragging.value = false;
        }
    }
}

onMounted(() => {
    // Check if the requested operation is in the user's cases
    const userCases = users[state.user?.localAccountId as string].cases;
    if (!userCases.includes(props.id)) {
        router.push({ path: '/' });
    }

    loadOperation();
});
</script>

<template>
    <div class="p-4 overflow-x-hidden touch-pan-y full-height-container flex flex-col">
        <div v-if="operationInfo" class="flex flex-col h-full">
            <!-- <Transition name="fade">
                <div v-show="!isExpandedView" class="mb-4 mt-4 clock-container">
                    <ClockNavigation :events="operationInfo.events" :currentIndex="currentEventIndex" @navigate="goToEvent" />
                </div>
            </Transition>
            
            <div class="event-slideshow-container flex-1 flex flex-col">
                <EventSlideshow :events="operationInfo.events" :currentEventIndex="currentEventIndex" @update:currentEventIndex="currentEventIndex = $event" @navigate="goToEvent" v-model:isExpandedView="isExpandedView" />
            </div> -->            <div id="testLayout" class="h-full relative">                <Transition :name="isDragging ? '' : 'fade'">
                    <div v-show="!isExpandedView" class="h-1/2" :class="{ 'no-transition': isDragging }">
                        <ClockNavigation :events="operationInfo.events" :currentIndex="currentEventIndex"
                            @navigate="(index, direction) => goToEvent(index, direction)" />
                    </div>
                </Transition><div class="absolute w-full events-container" 
                    :class="{ 'no-transition': isDragging }"
                    :style="{ height: expandedHeight, bottom: '0' }">
                    <EventSlideshow :events="operationInfo.events" :currentEventIndex="currentEventIndex"
                        :transitionDirection="lastTransitionDirection" 
                        @update:currentEventIndex="currentEventIndex = $event" @navigate="(index, direction) => goToEvent(index, direction)"
                        @toggle-view="toggleView" @expand-progress="handleExpandProgress" v-model:isExpandedView="isExpandedView" />
                </div>
            </div>

        </div>
        <div v-else class="flex h-full">
            <LoadingComponent />
        </div>
    </div>
</template>

<style scoped>
.full-height-container {
    animation: fadeIn 0.5s ease-in;
    /* background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%); */
    height: calc(100vh - 2rem);
    max-height: calc(100vh - 2rem);
    overflow: hidden;
}

.event-slideshow-container {
    flex: 1;
    max-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    overflow: hidden;
}

/* Clock container styles */
.clock-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

/* Fade transition for clock - using the same duration as the events container */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    will-change: opacity, transform;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* Events container with transition - using the same duration as the clock fade */
.events-container {
    transition: height 0.3s ease-out;
    will-change: height;
}

/* Disable transitions during active dragging for more responsive feel */
.no-transition {
    transition: none !important;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>

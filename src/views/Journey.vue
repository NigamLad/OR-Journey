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
    // When not dragging, use the determined height based on state
    if (!isDragging.value || expandProgress.value === 0) {
        return showFullEvents.value ? '100%' : '50%';
    }

    // REVERSED HEIGHT CALCULATION:
    // - Drag UP (positive values from inverted signal): Always increases height
    // - Drag DOWN (negative values from inverted signal): Always decreases height
    const dragDistance = expandProgress.value;

    // Get base height (either 50% or 100%)
    const baseHeight = showFullEvents.value ? 100 : 50;

    // Calculate height change: 5px drag = 1% height
    const heightChange = Math.min(50, Math.abs(dragDistance) / 5);

    if (dragDistance > 0) {
        // Dragging UP (now positive due to inversion) → Always adds height (maximum 100%)
        return `${Math.min(100, baseHeight + heightChange)}%`;
    } else {
        // Dragging DOWN (now negative due to inversion) → Always subtracts height (minimum 50%)
        return `${Math.max(50, baseHeight - heightChange)}%`;
    }
});

const loadOperation = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        operationInfo.value = operations[props.id];
    } catch (error) {
        // Error handling without logging
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
function handleExpandProgress(pixelDistance: number) {
    // Handle special completion values
    if (pixelDistance === 9999) {
        // Special value: expand fully (dragged UP enough)
        showFullEvents.value = true;
        isExpandedView.value = true;
        expandProgress.value = 0;
        isDragging.value = false;
    } else if (pixelDistance === -9999) {
        // Special value: collapse fully (dragged DOWN enough)
        showFullEvents.value = false;
        isExpandedView.value = false;
        expandProgress.value = 0;
        isDragging.value = false;
    } else if (pixelDistance === 0) {
        // Reset to current state (drag canceled or not far enough)
        expandProgress.value = 0;
        isDragging.value = false;
    } else {
        // Handle live dragging
        // Only allow valid drag directions:
        // - When already expanded: Only handle negative values (DOWN = collapse)
        // - When already collapsed: Only handle positive values (UP = expand)
        if ((showFullEvents.value && pixelDistance > 0) || (!showFullEvents.value && pixelDistance < 0)) {
            // Invalid direction for current state - ignore
            return;
        }

        expandProgress.value = pixelDistance;
        isDragging.value = true;
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
            <div id="testLayout" class="h-full relative">
                <Transition :name="isDragging ? '' : 'fade'">
                    <div v-show="!isExpandedView" class="h-1/2" :class="{ 'no-transition': isDragging }">
                        <ClockNavigation :events="operationInfo.events" :currentIndex="currentEventIndex"
                            @navigate="(index, direction) => goToEvent(index, direction)" />
                    </div>
                </Transition>
                <div class="absolute w-full events-container" :class="{ 'no-transition': isDragging }"
                    :style="{ height: expandedHeight, bottom: '0' }">
                    <EventSlideshow :events="operationInfo.events" :currentEventIndex="currentEventIndex"
                        :transitionDirection="lastTransitionDirection"
                        @update:currentEventIndex="currentEventIndex = $event"
                        @navigate="(index, direction) => goToEvent(index, direction)" @toggle-view="toggleView"
                        @expand-progress="handleExpandProgress" v-model:isExpandedView="isExpandedView" />
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

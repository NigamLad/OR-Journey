<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
    isExpanded: boolean
}>();

const emit = defineEmits<{
    (e: 'expand-progress', progress: number): void
}>();

// Track whether the expansion is fully complete to trigger the second animation phase
const fullyExpanded = ref(false);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragProgress = ref(0);
const dragThreshold = 100; // Pixels required for full expansion/collapse

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

// Computed style for visual feedback during dragging
const dragTransform = computed(() => {
    if (!isDragging.value) return '';

    // Instead of physically moving the bar, just change its appearance during drag
    return ''; // No transform needed - we'll use CSS for visual feedback instead
});

// Start drag operation
function onDragStart(event: MouseEvent | TouchEvent) {
    isDragging.value = true;

    // Get the starting Y position
    if (event instanceof MouseEvent) {
        dragStartY.value = event.clientY;
    } else if (event.touches?.length) {
        dragStartY.value = event.touches[0].clientY;
    }

    // Add event listeners for drag and release
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
}

// Handle drag movement
function onDragMove(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) return;

    // Prevent default to avoid scrolling while dragging
    event.preventDefault();

    // Get current position
    let currentY = 0;
    if (event instanceof MouseEvent) {
        currentY = event.clientY;
    } else if (event.touches?.length) {
        currentY = event.touches[0].clientY;
    }

    // Calculate drag distance in pixels
    // Positive value = dragging DOWN, Negative value = dragging UP
    const dragDistance = currentY - dragStartY.value;

    // CONSTRAINED APPROACH:
    // Only allow valid drag directions:
    // - When expanded: Only allow DOWN drag (positive) to collapse
    // - When collapsed: Only allow UP drag (negative) to expand
    if ((props.isExpanded && dragDistance < 0) || (!props.isExpanded && dragDistance > 0)) {
        // Ignore invalid drag directions based on current state
        return;
    }

    // Use absolute value for internal progress tracking, capped at 100
    // This is used for threshold detection
    dragProgress.value = Math.max(0, Math.min(100, Math.abs(dragDistance)));

    // Invert the drag distance to reverse the effect:
    // - Positive becomes negative (DOWN = collapse)
    // - Negative becomes positive (UP = expand)
    emit('expand-progress', -dragDistance);
}

// End drag operation
function onDragEnd() {
    if (!isDragging.value) return;

    isDragging.value = false;

    // Complete the drag action if threshold is reached, otherwise cancel
    if (dragProgress.value >= 50) {
        // We've dragged far enough to trigger a state change
        if (props.isExpanded) {
            // Currently expanded - can only collapse (drag DOWN)
            emit('expand-progress', -9999);
        } else {
            // Currently collapsed - can only expand (drag UP) 
            emit('expand-progress', 9999);
        }
    } else {
        // Not enough drag, cancel and reset
        emit('expand-progress', 0);
    }

    // Reset progress value
    dragProgress.value = 0;

    // Clean up event listeners
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchend', onDragEnd);
}
</script>

<template>
    <div class="horizontal-bar-container relative w-16 h-2 cursor-ns-resize mx-auto transition-all duration-300 ease-in-out hover:w-20 hover:opacity-90"
        :class="{ 'expanded': isExpanded, 'fully-expanded': fullyExpanded, 'dragging': isDragging }"
        :title="isExpanded ? 'Drag down to collapse view' : 'Drag up to expand view'" @mousedown="onDragStart"
        @touchstart="onDragStart">
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
    transition: all 0.15s ease;
}

/* Drag indicator styles removed */

.horizontal-bar-container.dragging {
    transition: none;
    cursor: grabbing;
}

/* Visual feedback during dragging without moving the bar */
.horizontal-bar-container.dragging .bar {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
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

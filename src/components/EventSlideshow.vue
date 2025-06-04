<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { OperationEvent } from '@/types';
import Fancybox from '@/components/Fancybox.vue';
import { FancyBoxOptions } from '@/scripts/fancyboxConfig';
import ArrowRightShort from '@/components/icons/arrow-right-short.vue';
import ArrowLeftShort from '@/components/icons/arrow-left-short.vue';
import Image from '@/components/icons/image.vue';
import VideoCamera from '@/components/icons/video-camera.vue';
import ClipboardPulse from '@/components/icons/clipboard-pulse.vue';
import HorizontalBar from '@/components/horizontal-bar.vue';

// Extend Window interface for timer properties
declare global {
    interface Window {
        titleOverflowTimer: number;
        descriptionOverflowTimer: number;
    }
}

const props = defineProps<{
    events: OperationEvent[]
    currentEventIndex?: number // Allow parent to control currentEventIndex
    isExpandedView?: boolean // Allow parent to control expanded view state
    transitionDirection?: 'next' | 'prev' | 'direct' // Direction for the transition animation
}>()

const emit = defineEmits<{
    (e: 'update:currentEventIndex', index: number): void
    (e: 'update:isExpandedView', value: boolean): void
    (e: 'navigate', index: number, direction?: 'next' | 'prev' | 'direct'): void
    (e: 'toggle-view'): void
    (e: 'expandProgress', progress: number): void
}>()

// State variables
const localCurrentEventIndex = ref(0);
const localIsExpandedView = ref(false);
const titleRef = ref<HTMLHeadingElement | null>(null);
const titleContainerRef = ref<HTMLDivElement | null>(null);
const descriptionRef = ref<HTMLParagraphElement | null>(null);
const descriptionContainerRef = ref<HTMLDivElement | null>(null);
const shouldAnimateTitle = ref(false);
const shouldAnimateDescription = ref(false);
const isTitleOverflowing = ref(false);
const isDescriptionOverflowing = ref(false);
const isDragging = ref(false);
const isTransitioning = ref(false);
const transitionName = ref('slide-fade');
const descMarqueeDistance = ref('0');
let titleObserver: MutationObserver | null = null;
let descriptionObserver: MutationObserver | null = null;

const currentEventIndex = computed({
    get: () => props.currentEventIndex ?? localCurrentEventIndex.value,
    set: (val) => {
        if (props.currentEventIndex === undefined) localCurrentEventIndex.value = val;
        emit('update:currentEventIndex', val);
    }
});

const isExpandedView = computed({
    get: () => props.isExpandedView ?? localIsExpandedView.value,
    set: (val) => {
        if (props.isExpandedView === undefined) localIsExpandedView.value = val;
        emit('update:isExpandedView', val);
    }
});

// Watch for changes in currentEventIndex and apply the appropriate transition
watch(
    () => [props.currentEventIndex, props.transitionDirection],
    ([newIndex, direction]) => {
        if (newIndex !== undefined && direction) {
            // Set transition properties based on direction
            transitionName.value = direction === 'next' ? 'slide-right' :
                direction === 'prev' ? 'slide-left' : 'slide-fade';

            // Trigger transition effect
            isTransitioning.value = true;

            // After transition is complete
            setTimeout(() => {
                isTransitioning.value = false;

                // Ensure animations are checked AFTER transition completes
                nextTick(() => {
                    setupTitleAnimation();
                    setupDescriptionAnimation();
                });
            }, direction === 'direct' ? 150 : 300);
        }
    }
);

// Derived state
const currentEvent = computed(() => props.events[currentEventIndex.value]);
const totalEvents = computed(() => props.events.length);

// Determine content type (image, video, or text)
const currentEventType = computed(() => {
    if (!currentEvent.value) return null;
    return currentEvent.value.image ? 'image' :
        currentEvent.value.video ? 'video' : 'text';
});

// Format timestamp into readable time
const formattedTime = computed(() => {
    if (!currentEvent.value) return '';
    return new Date(currentEvent.value.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Navigation functions
function transitionToEvent(index: number, direction: 'next' | 'prev' | 'direct' = 'direct') {
    if (index >= 0 && index < totalEvents.value) {
        // Set transition properties
        isTransitioning.value = true;
        transitionName.value = direction === 'next' ? 'slide-right' :
            direction === 'prev' ? 'slide-left' : 'slide-fade';

        // Adjust transition time based on direction
        const transitionTime = direction === 'direct' ? 150 : 300;

        // Apply after transition
        setTimeout(() => {
            currentEventIndex.value = index;
            isTransitioning.value = false;
        }, transitionTime);
    }
}

function goToNextEvent() {
    if (currentEventIndex.value < totalEvents.value - 1) {
        goToEvent(currentEventIndex.value + 1);
    }
}

function goToPreviousEvent() {
    if (currentEventIndex.value > 0) {
        goToEvent(currentEventIndex.value - 1);
    }
}

function goToEvent(index: number) {
    if (index !== currentEventIndex.value) {
        // Determine direction based on indices
        const direction = index > currentEventIndex.value ? 'next' : 'prev';

        // Apply transition
        transitionToEvent(index, direction);

        // Notify parent
        emit('navigate', index, direction);
    }
}

// Initialize on mount
onMounted(() => {
    if (props.events && props.events.length > 0) {
        currentEventIndex.value = 0;
    }
});

// Get color based on event type
function getEventTypeColor(type: string | undefined): string {
    if (!type) return '#808080'; // Default gray

    const normalized = type.trim().toLowerCase();

    if (normalized.includes('pre')) return '#2563EB';      // Blue for pre-operative
    if (normalized.includes('intra')) return '#059669';    // Green for intraoperative
    if (normalized.includes('post')) return '#7C3AED';     // Purple for post-operative

    return '#808080'; // Default gray
}

// Handle drag progress events from the toggle arrow bar
function handleExpandProgress(progress: number) {
    // Emit progress for parent sync
    emit('expandProgress', progress);

    // Update drag state (true during drag, false when complete)
    isDragging.value = progress > 0 && progress < 100;
}

// Configure title marquee animation when text overflows
function checkTitleOverflow() {
    // Use a small debounce to prevent multiple rapid calls
    clearTimeout(window.titleOverflowTimer as number);

    // Set a timer to the window object for debouncing
    window.titleOverflowTimer = setTimeout(() => {
        const element = titleRef.value;

        if (!element) {
            return;
        }

        // Ensure the element has content
        if (!element.textContent?.trim()) {
            return;
        }

        // Force a recalculation of layout by triggering a reflow
        void element.offsetWidth;

        const parentWidth = element.parentElement?.clientWidth || 0;
        const elementWidth = element.scrollWidth;
        const overflowAmount = Math.max(0, elementWidth - parentWidth);

        // Check if text overflows container
        const isOverflowing = elementWidth > parentWidth && parentWidth > 0;
        isTitleOverflowing.value = isOverflowing;

        // Only apply animation class when overflowing
        shouldAnimateTitle.value = isOverflowing;

        if (isOverflowing) {
            // Calculate distance to scroll (negative value moves text left)
            // The exact distance needed is the overflow amount plus a small buffer
            const moveDistance = -(overflowAmount) - 10;

            // Set CSS variable for animation
            element.style.setProperty('--marquee-distance', `${moveDistance}px`);
        } else {
            // Reset the CSS variable when not overflowing
            element.style.setProperty('--marquee-distance', '0px');
        }
    }, 50);
}

// Configure description marquee animation when text overflows
function checkDescriptionOverflow() {
    // Use a small debounce to prevent multiple rapid calls
    clearTimeout(window.descriptionOverflowTimer as number);

    // Set a timer to the window object for debouncing
    window.descriptionOverflowTimer = setTimeout(() => {
        const element = descriptionRef.value;
        const container = descriptionContainerRef.value;
        if (!element || !container) {
            return;
        }

        // Ensure the element has content
        if (!element.textContent?.trim()) {
            return;
        }

        // Force a recalculation of layout by triggering a reflow
        void element.offsetHeight;

        // Get the container height directly from container ref - max-h-[15vh]
        const containerHeight = container.clientHeight;
        const elementHeight = element.scrollHeight;
        const overflowAmount = Math.max(0, elementHeight - containerHeight);

        // Check if text overflows container
        const isOverflowing = elementHeight > containerHeight && containerHeight > 0;
        isDescriptionOverflowing.value = isOverflowing;

        // Only apply animation class when overflowing
        shouldAnimateDescription.value = isOverflowing;

        if (isOverflowing) {
            // Calculate distance to scroll (negative value moves text up)
            // The exact distance needed is the overflow amount plus a small buffer
            const moveDistance = -(overflowAmount) - 10;
            descMarqueeDistance.value = moveDistance.toString();
            // Set the marquee distance value
        } else {
            // Reset the CSS variable when not overflowing
            descMarqueeDistance.value = '0';
        }
    }, 50);
}

// Setup MutationObserver to monitor description changes
function setupDescriptionObserver() {
    // Disconnect any existing observer
    if (descriptionObserver) {
        descriptionObserver.disconnect();
    }

    if (descriptionContainerRef.value) {
        // Create a new observer to watch for content changes in the description container
        descriptionObserver = new MutationObserver(checkDescriptionOverflow);

        // Observe content changes, child changes, and subtree changes
        descriptionObserver.observe(descriptionContainerRef.value, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }
}

// Utility function to setup description animation
function setupDescriptionAnimation() {
    // Reset animation state
    shouldAnimateDescription.value = false;

    // Refresh the mutation observer
    setupDescriptionObserver();

    // Force immediate check for overflow using nextTick to ensure DOM is updated
    nextTick(() => {
        checkDescriptionOverflow();

        // Add multiple checks with increasing delays to ensure DOM is fully rendered
        // This helps when switching between events with different content lengths
        setTimeout(() => {
            checkDescriptionOverflow();

            // Final check after transition should be complete
            setTimeout(() => {
                checkDescriptionOverflow();
            }, 300);
        }, 150);
    });
}

// Utility function to setup title animation
function setupTitleAnimation() {
    // Reset animation state
    shouldAnimateTitle.value = false;

    // Refresh the mutation observer
    setupTitleObserver();

    // Force immediate check for overflow using nextTick to ensure DOM is updated
    nextTick(() => {
        checkTitleOverflow();

        // Add multiple checks with increasing delays to ensure DOM is fully rendered
        // This helps when switching between events with different content lengths
        setTimeout(() => {
            checkTitleOverflow();

            // Final check after transition should be complete
            setTimeout(() => {
                checkTitleOverflow();
            }, 200);
        }, 100);
    });
}

// Watch for slide changes to recalculate animations
watch(() => currentEventIndex.value, () => {
    setupTitleAnimation();
    setupDescriptionAnimation();
});

// Also watch for changes to the current event name and description
watch(() => currentEvent.value?.eventName, setupTitleAnimation);
watch(() => currentEvent.value?.description, setupDescriptionAnimation);

// Handle window resize to recalculate animation if needed
function handleResize() {
    setupTitleAnimation();
    setupDescriptionAnimation();
}

// Setup MutationObserver to monitor title changes
function setupTitleObserver() {
    // Disconnect any existing observer
    if (titleObserver) {
        titleObserver.disconnect();
    }

    if (titleContainerRef.value) {
        // Create a new observer to watch for content changes in the title container
        titleObserver = new MutationObserver(checkTitleOverflow);

        // Observe content changes, child changes, and subtree changes
        titleObserver.observe(titleContainerRef.value, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }
}

// Initialize component
onMounted(() => {
    if (props.events?.length > 0) {
        currentEventIndex.value = 0;        // Setup initial animation state with nextTick to ensure DOM is rendered
        nextTick(() => {
            setupTitleAnimation();
            setupDescriptionAnimation();
        });

        // Add resize listener to handle viewport changes
        window.addEventListener('resize', handleResize);
    }
});

// Clean up event listeners when component is destroyed
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    // Disconnect MutationObservers
    if (titleObserver) {
        titleObserver.disconnect();
        titleObserver = null;
    }

    if (descriptionObserver) {
        descriptionObserver.disconnect();
        descriptionObserver = null;
    }
});
</script>

<template>
    <div class="h-full flex flex-col">
        <!-- Card container with transitions -->
        <div class="relative h-full flex items-center justify-center"
            :class="{ 'transition-all duration-400 ease-in-out': !isDragging }">
            <Transition :name="isDragging ? '' : transitionName" mode="out-in" @after-enter="setupTitleAnimation">
                <div :key="currentEventIndex"
                    class="w-full h-full max-w-3xl mx-auto overflow-hidden rounded-2xl flex flex-col"
                    :class="{ 'transition-all duration-400 ease-in-out': !isDragging }">
                    <!-- Main content wrapper -->
                    <div class="content-wrapper p-4 bg-gradient-to-br from-gray-900 to-gray-800 
                                rounded-2xl h-full flex flex-col"
                        :class="{ 'transition-all duration-400': !isDragging }">
                        <!-- Header with event type and time -->
                        <!-- Horizontal bar for expand/collapse -->
                        <div class="flex justify-center">
                            <HorizontalBar v-model:is-expanded="isExpandedView" @click="emit('toggle-view')"
                                @expand-progress="handleExpandProgress" class="transition-all hover:opacity-80" />
                        </div>

                        <div class="mb-2 text-gray-400">
                            <div class="flex justify-between">
                                <!-- Event type badge -->
                                <span class="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                                    :style="{ backgroundColor: getEventTypeColor(currentEvent?.type) }">
                                    <div v-if="currentEvent?.type == 'Pre Operative'">
                                        Pre-Op
                                    </div>
                                    <div v-else-if="currentEvent?.type == 'Intraoperative'">
                                        Intra-Op
                                    </div>
                                    <div v-else-if="currentEvent?.type == 'Post Operative'">
                                        Post-Op
                                    </div>
                                </span>

                                <!-- Time and content type indicator -->
                                <div class="flex items-center">
                                    <Transition name="fade">
                                        <span v-if="isExpandedView" class="time-display">{{ formattedTime }}</span>
                                    </Transition>
                                    <span :class="{ 'ml-2': isExpandedView }"
                                        class="flex items-center bg-gray-800 px-2 py-1 rounded-md">
                                        <component :is="currentEventType === 'image' ? Image :
                                            currentEventType === 'video' ? VideoCamera :
                                                ClipboardPulse" />
                                    </span>
                                </div>
                            </div>
                        </div> <!-- Content area at the top -->
                        <div class="flex-grow flex flex-col items-center">
                            <!-- Non-scrollable content area -->
                            <div class="w-full">
                                <!-- Event title with marquee animation when text overflows -->
                                <div class="w-full mb-4 overflow-hidden flex justify-center">
                                    <div ref="titleContainerRef" class="relative max-w-full overflow-hidden"
                                        :class="{ 'w-full': shouldAnimateTitle }">
                                        <h2 ref="titleRef" class="text-2xl sm:text-xl font-bold whitespace-nowrap px-2"
                                            :class="{ 'title-marquee': shouldAnimateTitle, 'text-center': !shouldAnimateTitle }">
                                            {{ currentEvent?.eventName }}
                                        </h2>
                                    </div>
                                </div>
                                <!-- Media container -->
                                <div v-if="isExpandedView && ['image', 'video'].includes(currentEventType as string)"
                                    class="mb-4 flex justify-center w-full">
                                    <!-- Image content with Fancybox -->
                                    <Fancybox v-if="currentEventType === 'image'" :options="FancyBoxOptions"
                                        :delegate="'[data-fancybox]'">
                                        <a :href="currentEvent?.image" data-fancybox>
                                            <img :src="currentEvent?.image" alt="Event Image" class="rounded-lg object-contain shadow-lg hover:shadow-xl 
                                                       shadow-white/10 hover:shadow-white/20 
                                                       transition-transform hover:scale-[1.02]" />
                                        </a>
                                    </Fancybox>

                                    <!-- Video content with Fancybox -->
                                    <Fancybox v-else-if="currentEventType === 'video'" :options="FancyBoxOptions"
                                        :delegate="'[data-fancybox]'">
                                        <a :href="currentEvent?.video" data-fancybox>
                                            <video class="rounded-lg object-contain shadow-lg hover:shadow-xl 
                                                         shadow-white/10 hover:shadow-white/20" controls>
                                                <source :src="currentEvent?.video" type="video/mp4">
                                                Your browser does not support video playback.
                                            </video>
                                        </a>
                                    </Fancybox>
                                </div>

                                <!-- Description section - always visible with marquee effect -->
                                <div v-if="currentEvent?.description"
                                    class="text-center backdrop-blur-md bg-white/10 p-2 rounded-xl w-full max-w-2xl border border-white/20 shadow-lg max-h-[15vh] overflow-hidden"
                                    ref="descriptionContainerRef">
                                    <p ref="descriptionRef" class="text-lg md:text-lg sm:text-base text-white m-0"
                                        :class="{ 'description-marquee': shouldAnimateDescription }"
                                        :style="{ '--marquee-distance-vertical': shouldAnimateDescription ? `${descMarqueeDistance}px` : '0px' }">
                                        {{ currentEvent.description }}
                                    </p>
                                </div>

                                <!-- Text content (when no media) -->
                                <div v-if="currentEventType === 'text' && !currentEvent?.description"
                                    class="flex items-center justify-center py-3 w-full mb-4">
                                    <div
                                        class="backdrop-blur-md bg-white/5 rounded-xl p-4 w-full max-w-md shadow-lg border border-white/10">
                                        <p class="text-xl sm:text-lg font-light text-center text-white">
                                            No description available
                                        </p>
                                    </div>
                                </div>

                                <!-- Force average (if available) -->
                                <div v-if="currentEvent?.forceaverage !== undefined && currentEventType === 'text'"
                                    class="mb-3 w-full max-w-md">
                                    <p class="text-center mb-1">Force Applied: {{ currentEvent.forceaverage }} Newtons
                                    </p>
                                    <div class="h-2 bg-gray-700 rounded-full">
                                        <div class="h-full rounded-full" :class="{
                                            'bg-green-500': currentEvent.forceaverage < 0.7,
                                            'bg-yellow-500': currentEvent.forceaverage >= 0.7 && currentEvent.forceaverage < 1,
                                            'bg-red-500': currentEvent.forceaverage >= 1
                                        }" :style="`width: ${Math.min(currentEvent.forceaverage * 100, 100)}%`">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Navigation controls -->
                        <div
                            class="sticky bottom-0 backdrop-blur-sm flex justify-between items-center mt-auto pt-2 px-2 z-10">
                            <!-- Previous button -->
                            <button @click="goToPreviousEvent"
                                class="px-4 py-2 text-sm rounded-full border border-white flex items-center gap-2 transition-all font-medium sm:px-2 sm:py-1.5"
                                :disabled="currentEventIndex === 0" :class="{
                                    'opacity-30 cursor-not-allowed': currentEventIndex === 0,
                                    'hover:bg-white hover:text-black': currentEventIndex > 0
                                }">
                                <ArrowLeftShort />
                                Previous
                            </button>

                            <!-- Page indicator -->
                            <div class="text-center px-3 py-1 bg-gray-800 rounded-full text-sm">
                                <span class="font-medium">{{ currentEventIndex + 1 }}</span>
                                <span class="text-gray-400">/</span>
                                <span class="font-medium">{{ totalEvents }}</span>
                            </div>

                            <!-- Next button -->
                            <button @click="goToNextEvent"
                                class="px-4 py-2 text-sm rounded-full border border-white flex items-center gap-2 transition-all font-medium sm:px-2 sm:py-1.5"
                                :disabled="currentEventIndex === totalEvents - 1" :class="{
                                    'opacity-30 cursor-not-allowed': currentEventIndex === totalEvents - 1,
                                    'hover:bg-white hover:text-black': currentEventIndex < totalEvents - 1
                                }">
                                Next
                                <ArrowRightShort />
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
/* Transitions for slide effects */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.15s ease-out;
}

.slide-fade-enter-from {
    transform: translateX(20px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateX(-20px);
    opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.3s ease;
}

.slide-left-enter-from {
    transform: translateX(-50px);
    opacity: 0;
}

.slide-left-leave-to {
    transform: translateX(50px);
    opacity: 0;
}

.slide-right-enter-from {
    transform: translateX(50px);
    opacity: 0;
}

.slide-right-leave-to {
    transform: translateX(-50px);
    opacity: 0;
}

/* Custom scrollbar styling */
.content-wrapper {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.content-wrapper::-webkit-scrollbar {
    width: 6px;
}

.content-wrapper::-webkit-scrollbar-track {
    background: transparent;
}

.content-wrapper::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

/* Title marquee animation */
@keyframes marquee {

    0%,
    15% {
        transform: translateX(0);
    }

    45%,
    55% {
        transform: translateX(var(--marquee-distance, 0));
    }

    85%,
    100% {
        transform: translateX(0);
    }
}

.title-marquee {
    display: inline-block;
    animation: marquee 8s ease-in-out infinite;
    animation-fill-mode: both;
    will-change: transform;
    max-width: fit-content;
}

/* Title entrance animations */
.animate-title {
    animation: titleFadeIn 0.5s ease-out, titleSlideIn 0.5s ease-out;
}

@keyframes titleFadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes titleSlideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Description marquee animation */
@keyframes marquee-vertical {

    0%,
    15% {
        transform: translateY(0);
    }

    45%,
    55% {
        transform: translateY(var(--marquee-distance-vertical, 0));
    }

    85%,
    100% {
        transform: translateY(0);
    }
}

.description-marquee {
    animation: marquee-vertical 12s ease-in-out infinite;
    animation-fill-mode: both;
    will-change: transform;
    position: relative;
    display: block;
    width: 100%;
}

/* Time display fade transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.time-display {
    display: inline-block;
    min-width: 3.5rem;
    /* Ensures consistent spacing when time changes */
}
</style>

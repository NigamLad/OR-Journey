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
import Media from '@/components/Media.vue';

// Extend Window interface for timer properties
declare global {
    interface Window {
        titleOverflowTimer: number;
        descriptionOverflowTimer: number;
        dragTimeoutId?: number;
    }
}

const props = defineProps<{
    events: OperationEvent[]
    currentEventIndex?: number // Allow parent to control currentEventIndex
    isExpandedView?: boolean // Allow parent to control expanded view state
    transitionDirection?: 'next' | 'prev' | 'direct' // Direction for the transition animation
    disableCollapse?: boolean // Disable collapse functionality (for desktop)
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
const mediaContainerRef = ref<HTMLDivElement | null>(null);
const shouldAnimateTitle = ref(false);
const shouldAnimateDescription = ref(false);
const shouldAnimateMedia = ref(false);
const shouldExpandMediaContainer = ref(false);
const isDragging = ref(false);
const isTransitioning = ref(false);
const transitionName = ref('slide-fade');
const descMarqueeDistance = ref('0');

// Card-wide swipe functionality state
const isCardDragging = ref(false);
const cardDragStartY = ref(0);
const cardDragStartX = ref(0);
const cardDragProgress = ref(0);
const cardDragThreshold = 100;
const cardDragDirection = ref(0); // Store final drag direction: positive = down, negative = up
const horizontalDragDirection = ref(0); // Store horizontal drag direction: positive = right, negative = left
const horizontalSwipeThreshold = 100; // Pixels required for navigation swipe
const swipeType = ref<'vertical' | 'horizontal' | 'none'>('none'); // Track the type of swipe gesture
const cardRef = ref<HTMLDivElement | null>(null);
const scrollableContentRef = ref<HTMLDivElement | null>(null);
const isContentScrollable = ref(false);
const isAtScrollTop = ref(true); // Track if we're at the top of scrollable content
const isSwipingUp = ref(false); // Track when user is swiping up to hide the indicator

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
            transitionName.value = direction === 'next' ? 'slide-right' :
                direction === 'prev' ? 'slide-left' : 'slide-fade';

            isTransitioning.value = true;
            shouldAnimateMedia.value = false;
            shouldExpandMediaContainer.value = false;
            
            setTimeout(() => {
                isTransitioning.value = false;

                if (isExpandedView.value) {
                    startCoordinatedAnimationSequence();
                } else {
                    setupTitleAnimation();
                    setupDescriptionAnimation();
                }
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
function handleExpandProgress(pixelDistance: number) {
    // Pass through the pixel distance to parent
    emit('expandProgress', pixelDistance);

    // Update drag state based on special values
    if (pixelDistance === 9999) {
        // Complete expansion
        isDragging.value = false;
        isExpandedView.value = true;
    } else if (pixelDistance === -9999) {
        // Complete collapse
        isDragging.value = false;
        isExpandedView.value = false;
    } else if (pixelDistance === 0) {
        // Explicitly reset dragging state when no progress
        isDragging.value = false;
        // Clear any existing timeout
        if (window.dragTimeoutId) {
            clearTimeout(window.dragTimeoutId);
            window.dragTimeoutId = undefined;
        }
    } else {
        // Normal dragging in progress
        isDragging.value = true;
        
        // Set a timeout to automatically reset dragging state if it gets stuck
        if (window.dragTimeoutId) {
            clearTimeout(window.dragTimeoutId);
        }
        window.dragTimeoutId = setTimeout(() => {
            if (isDragging.value) {
                isDragging.value = false;
                emit('expandProgress', 0);
            }
        }, 3000); // Reset after 3 seconds if still dragging
    }
}

// Configure title marquee animation when text overflows
function checkTitleOverflow() {
    clearTimeout(window.titleOverflowTimer as number);

    window.titleOverflowTimer = setTimeout(() => {
        const element = titleRef.value;

        if (!element || !element.textContent?.trim()) {
            return;
        }

        void element.offsetWidth;

        const parentWidth = element.parentElement?.clientWidth || 0;
        const elementWidth = element.scrollWidth;
        const overflowAmount = Math.max(0, elementWidth - parentWidth);
        const isOverflowing = elementWidth > parentWidth && parentWidth > 0;

        shouldAnimateTitle.value = isOverflowing;

        if (isOverflowing) {
            const moveDistance = -(overflowAmount) - 10;
            element.style.setProperty('--marquee-distance', `${moveDistance}px`);
        } else {
            element.style.setProperty('--marquee-distance', '0px');
        }
    }, 50);
}

// Configure description marquee animation when text overflows
function checkDescriptionOverflow() {
    clearTimeout(window.descriptionOverflowTimer as number);

    window.descriptionOverflowTimer = setTimeout(() => {
        const element = descriptionRef.value;
        const container = descriptionContainerRef.value;
        if (!element || !container || !element.textContent?.trim()) {
            return;
        }

        if (isExpandedView.value) {
            shouldAnimateDescription.value = false;
            descMarqueeDistance.value = '0';
            return;
        }

        setTimeout(() => {
            void element.offsetHeight;

            const containerHeight = container.clientHeight;
            const elementHeight = element.scrollHeight;
            const overflowAmount = Math.max(0, elementHeight - containerHeight);
            const isOverflowing = elementHeight > containerHeight && containerHeight > 0;

            shouldAnimateDescription.value = isOverflowing;

            if (isOverflowing) {
                const moveDistance = -(overflowAmount) - 10;
                descMarqueeDistance.value = moveDistance.toString();
            } else {
                descMarqueeDistance.value = '0';
            }
        }, 100);
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

// Utility function to setup description animation
function setupDescriptionAnimation() {
    shouldAnimateDescription.value = false;
    setupDescriptionObserver();
    
    nextTick(() => {
        checkDescriptionOverflow();
    });
}

// Utility function to setup title animation
function setupTitleAnimation() {
    shouldAnimateTitle.value = false;
    setupTitleObserver();
    
    nextTick(() => {
        checkTitleOverflow();
    });
}

// Watch for slide changes to recalculate animations
watch(() => currentEventIndex.value, () => {
    shouldAnimateMedia.value = false;
    shouldExpandMediaContainer.value = false;

    if (mediaContainerRef.value) {
        void mediaContainerRef.value.offsetHeight;
    }

    if (!isTransitioning.value) {
        if (isExpandedView.value) {
            startCoordinatedAnimationSequence();
        } else {
            setupTitleAnimation();
            setupDescriptionAnimation();
        }
    }
});

// Also watch for changes to the current event name and description
watch(() => currentEvent.value?.eventName, setupTitleAnimation);
watch(() => currentEvent.value?.description, setupDescriptionAnimation);

// Watch for changes to expanded view to trigger media animation
watch(() => isExpandedView.value, (newVal) => {
    shouldAnimateMedia.value = false;
    shouldExpandMediaContainer.value = false;

    if (mediaContainerRef.value) {
        void mediaContainerRef.value.offsetHeight;
    }

    if (newVal) {
        shouldAnimateDescription.value = false;
        
        const hasMedia = ['image', 'video'].includes(currentEventType.value as string);
        const delay = 500;
        
        setTimeout(() => {
            if (hasMedia) {
                startCoordinatedAnimationSequence();
            } else {
                setupTitleAnimation();
                setupDescriptionAnimation();
            }
        }, delay);
    } else {
        setTimeout(() => {
            setupDescriptionAnimation();
            checkScrollability();
            
            if (scrollableContentRef.value) {
                scrollableContentRef.value.scrollTop = 0;
                isAtScrollTop.value = true;
            }
        }, 500);
    }
});

// Handle window resize to recalculate animation if needed
function handleResize() {
    setupTitleAnimation();
    setupDescriptionAnimation();
    checkScrollability();
}

// Check if content is scrollable
function checkScrollability() {
    if (scrollableContentRef.value) {
        const element = scrollableContentRef.value;
        isContentScrollable.value = element.scrollHeight > element.clientHeight;
        // Also check if we're at the top with more precise detection
        isAtScrollTop.value = element.scrollTop <= 1;
    }
}

// Handle scroll events to track position
function handleScroll() {
    if (scrollableContentRef.value) {
        const element = scrollableContentRef.value;
        isAtScrollTop.value = element.scrollTop <= 1;
    }
}

// Initialize component
onMounted(() => {
    if (props.events?.length > 0) {
        currentEventIndex.value = 0;

        nextTick(() => {
            if (isExpandedView.value) {
                startCoordinatedAnimationSequence();
            } else {
                setupTitleAnimation();
                setupDescriptionAnimation();
            }
            
            checkScrollability();
            
            if (scrollableContentRef.value) {
                scrollableContentRef.value.scrollTop = 0;
                isAtScrollTop.value = true;
            }
        });

        window.addEventListener('resize', handleResize);
    }
});

// Clean up event listeners when component is destroyed
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', onCardDragMove);
    window.removeEventListener('touchmove', onCardDragMove);
    window.removeEventListener('mouseup', onCardDragEnd);
    window.removeEventListener('touchend', onCardDragEnd);

    if (window.dragTimeoutId) {
        clearTimeout(window.dragTimeoutId);
        window.dragTimeoutId = undefined;
    }

    if (titleObserver) {
        titleObserver.disconnect();
        titleObserver = null;
    }

    if (descriptionObserver) {
        descriptionObserver.disconnect();
        descriptionObserver = null;
    }
});

// Helper function to coordinate all animations in proper sequence
function startCoordinatedAnimationSequence() {
    shouldAnimateMedia.value = false;
    shouldExpandMediaContainer.value = false;

    if (mediaContainerRef.value) {
        void mediaContainerRef.value.offsetHeight;
    }

    setTimeout(() => {
        shouldExpandMediaContainer.value = true;

        setTimeout(() => {
            shouldAnimateMedia.value = true;
            setupTitleAnimation();
            setupDescriptionAnimation();
        }, 500);
    }, 200);
}

// Card-wide swipe functionality
function onCardDragStart(event: MouseEvent | TouchEvent) {
    // Disable drag functionality when collapse is disabled
    if (props.disableCollapse) {
        return;
    }
    
    const target = event.target as HTMLElement;
    
    // Prevent starting drag on interactive elements
    if (target.closest('button, input, a:not([data-fancybox]), .horizontal-bar, [class*="horizontal"], [data-horizontal-bar]') ||
        (target.closest('svg') && target.closest('.horizontal-bar'))) {
        return;
    }

    // Handle media elements specially
    const isMediaElement = target.tagName === 'IMG' || target.tagName === 'VIDEO' || 
                          target.closest('img, video, [data-fancybox]');
    
    if (isMediaElement) {
        handleMediaDragStart(event);
        return;
    }

    // Handle scrollable content
    const scrollableParent = target.closest('.scrollable-content');
    if (scrollableParent && scrollableParent.scrollHeight > scrollableParent.clientHeight) {
        handleScrollableDragStart(event, scrollableParent as HTMLElement);
        return;
    }
    
    startCardDrag(event);
}

function handleMediaDragStart(event: MouseEvent | TouchEvent) {
    const { clientX: initialX, clientY: initialY } = getEventCoordinates(event);
    let hasMoved = false;
    
    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
        const { clientX, clientY } = getEventCoordinates(moveEvent);
        if (Math.abs(clientX - initialX) > 10 || Math.abs(clientY - initialY) > 10) {
            hasMoved = true;
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            cleanup();
            startCardDrag(event, initialY, initialX);
        }
    };
    
    const endHandler = (endEvent: MouseEvent | TouchEvent) => {
        cleanup();
        if (hasMoved) {
            endEvent.preventDefault();
            endEvent.stopPropagation();
        }
    };
    
    const cleanup = () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        window.removeEventListener('touchend', endHandler);
    };
    
    window.addEventListener('mousemove', moveHandler, { passive: false });
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('mouseup', endHandler, { passive: false });
    window.addEventListener('touchend', endHandler, { passive: false });
}

function handleScrollableDragStart(event: MouseEvent | TouchEvent, scrollableParent: HTMLElement) {
    const isAtTop = scrollableParent.scrollTop <= 1;
    const { clientX: startX, clientY: startY } = getEventCoordinates(event);
    
    cardDragStartY.value = startY;
    cardDragStartX.value = startX;
    
    const intentHandler = (moveEvent: MouseEvent | TouchEvent) => {
        const { clientX, clientY } = getEventCoordinates(moveEvent);
        const deltaY = clientY - startY;
        const deltaX = clientX - startX;
        
        if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
            cleanup();
            startCardDrag(event, startY, startX);
        } else if (Math.abs(deltaY) > 5) {
            const isScrollingDown = deltaY > 0;
            if ((isExpandedView.value && isAtTop && isScrollingDown) ||
                (!isExpandedView.value && !isScrollingDown)) {
                cleanup();
                startCardDrag(event, startY, startX);
            } else {
                cleanup();
            }
        }
    };
    
    const cleanup = () => {
        window.removeEventListener('mousemove', intentHandler);
        window.removeEventListener('touchmove', intentHandler);
        window.removeEventListener('mouseup', cleanup);
        window.removeEventListener('touchend', cleanup);
    };
    
    window.addEventListener('mousemove', intentHandler, { passive: false });
    window.addEventListener('touchmove', intentHandler, { passive: false });
    window.addEventListener('mouseup', cleanup);
    window.addEventListener('touchend', cleanup);
}

function getEventCoordinates(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
        return { clientX: event.clientX, clientY: event.clientY };
    } else {
        return { 
            clientX: event.touches[0]?.clientX || 0, 
            clientY: event.touches[0]?.clientY || 0 
        };
    }
}

function startCardDrag(event: MouseEvent | TouchEvent, predeterminedStartY?: number, predeterminedStartX?: number) {
    isCardDragging.value = true;
    isDragging.value = true;
    swipeType.value = 'none';

    const { clientX, clientY } = getEventCoordinates(event);
    cardDragStartY.value = predeterminedStartY ?? clientY;
    cardDragStartX.value = predeterminedStartX ?? clientX;

    event.preventDefault();

    window.addEventListener('mousemove', onCardDragMove);
    window.addEventListener('touchmove', onCardDragMove, { passive: false });
    window.addEventListener('mouseup', onCardDragEnd);
    window.addEventListener('touchend', onCardDragEnd);
}

function onCardDragMove(event: MouseEvent | TouchEvent) {
    if (!isCardDragging.value) return;

    event.preventDefault();

    const { clientX, clientY } = getEventCoordinates(event);
    const dragDistanceY = clientY - cardDragStartY.value;
    const dragDistanceX = clientX - cardDragStartX.value;

    // Determine swipe type
    if (swipeType.value === 'none') {
        const absY = Math.abs(dragDistanceY);
        const absX = Math.abs(dragDistanceX);
        
        if (absY > 10 || absX > 10) {
            swipeType.value = absX > absY ? 'horizontal' : 'vertical';
            
            // If it's a vertical swipe upward (negative dragDistanceY), hide the swipe indicator
            if (swipeType.value === 'vertical' && dragDistanceY < 0) {
                isSwipingUp.value = true;
            }
        } else {
            return;
        }
    }

    if (swipeType.value === 'horizontal') {
        horizontalDragDirection.value = dragDistanceX;
        cardDragProgress.value = Math.max(0, Math.min(horizontalSwipeThreshold, Math.abs(dragDistanceX)));
        emit('expandProgress', 0);
    } else if (swipeType.value === 'vertical') {
        cardDragDirection.value = dragDistanceY;

        // Continue tracking upward swipe
        if (dragDistanceY < 0) {
            isSwipingUp.value = true;
        }

        if (!isValidVerticalDrag(dragDistanceY)) return;

        cardDragProgress.value = Math.max(0, Math.min(cardDragThreshold, Math.abs(dragDistanceY)));
        emit('expandProgress', -dragDistanceY);
    }
}

function isValidVerticalDrag(dragDistanceY: number): boolean {
    const scrollableParent = document.querySelector('.scrollable-content') as HTMLElement;
    const isContentScrollable = scrollableParent?.scrollHeight > scrollableParent?.clientHeight;
    
    if (isContentScrollable) {
        const isAtScrollTop = scrollableParent.scrollTop <= 1;
        
        if (isExpandedView.value) {
            return dragDistanceY > 0 && isAtScrollTop;
        } else {
            return dragDistanceY < 0;
        }
    } else {
        if (isExpandedView.value) {
            return true;
        } else {
            return dragDistanceY <= 0;
        }
    }
}

function onCardDragEnd() {
    if (!isCardDragging.value) {
        isDragging.value = false;
        return;
    }

    isCardDragging.value = false;
    const threshold = swipeType.value === 'horizontal' ? horizontalSwipeThreshold * 0.5 : cardDragThreshold * 0.5;

    if (cardDragProgress.value >= threshold) {
        if (swipeType.value === 'horizontal') {
            if (horizontalDragDirection.value > 0) {
                goToPreviousEvent();
            } else {
                goToNextEvent();
            }
        } else if (swipeType.value === 'vertical') {
            if (isExpandedView.value && cardDragDirection.value > 0) {
                isExpandedView.value = false;
                emit('expandProgress', -9999);
            } else if (!isExpandedView.value && cardDragDirection.value < 0) {
                isExpandedView.value = true;
                emit('expandProgress', 9999);
            } else {
                emit('expandProgress', 0);
            }
        }
    } else {
        emit('expandProgress', 0);
    }

    // Reset states
    cardDragProgress.value = 0;
    cardDragDirection.value = 0;
    horizontalDragDirection.value = 0;
    swipeType.value = 'none';
    isDragging.value = false;
    isSwipingUp.value = false; // Reset swipe up indicator state

    // Clean up event listeners
    window.removeEventListener('mousemove', onCardDragMove);
    window.removeEventListener('touchmove', onCardDragMove);
    window.removeEventListener('mouseup', onCardDragEnd);
    window.removeEventListener('touchend', onCardDragEnd);
}
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
                    <div ref="cardRef"
                        class="content-wrapper p-4 bg-gradient-to-br from-gray-900 to-gray-800 
                                rounded-2xl h-full flex flex-col cursor-grab select-none"
                        :class="{ 
                            'transition-all duration-400': !isDragging, 
                            'cursor-grabbing': isCardDragging 
                        }"
                        @mousedown="onCardDragStart"
                        @touchstart="onCardDragStart"
                        style="touch-action: manipulation;">
                        <!-- Horizontal bar for expand/collapse -->
                        <div v-if="!props.disableCollapse" class="flex justify-center">
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
                        </div>
                        <div class="flex-grow flex flex-col items-center overflow-hidden">
                            <!-- Scrollable content area -->
                            <div ref="scrollableContentRef"
                                class="w-full h-full overflow-y-auto overflow-x-hidden scrollable-content"
                                :class="{ 
                                    'pointer-events-none': isCardDragging
                                }"
                                @scroll="handleScroll">
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
                                    ref="mediaContainerRef"
                                    class="flex justify-center w-full overflow-hidden transition-all duration-500 ease-in-out"
                                    :style="{
                                        maxHeight: shouldExpandMediaContainer ? '100vh' : '0',
                                        marginBottom: shouldExpandMediaContainer ? '1rem' : '0',
                                        opacity: shouldExpandMediaContainer ? 1 : 0
                                    }" :class="{ 'media-container-expanded': shouldExpandMediaContainer }">
                                    <!-- Media content with Fancybox -->
                                    <Fancybox :options="FancyBoxOptions as any" :delegate="'[data-fancybox]'" class="w-full">
                                        <div class="w-full opacity-0 transition-all duration-500 ease-out delay-100"
                                            :class="{ 'opacity-100': shouldAnimateMedia }">
                                            <Media 
                                                :url="(currentEvent?.image || currentEvent?.video) as string"
                                                :type="currentEvent?.image ? 'image' : 'video'"
                                                :contentWarning="currentEvent?.contentWarning"
                                            />
                                        </div>
                                    </Fancybox>
                                </div>
                                
                                <!-- Description section - dynamic height based on view mode with animation -->
                                <div v-if="currentEvent?.description"
                                    class="text-center backdrop-blur-md bg-white/10 p-2 rounded-xl w-full max-w-2xl border border-white/20 shadow-lg overflow-hidden transition-all duration-500 ease-in-out"
                                    :style="{ maxHeight: isExpandedView ? '100vh' : '15vh' }"
                                    ref="descriptionContainerRef">
                                    <p ref="descriptionRef" class="text-lg md:text-lg sm:text-base text-white m-0"
                                        :class="{ 'description-marquee': shouldAnimateDescription && !isExpandedView }"
                                        :style="{ '--marquee-distance-vertical': shouldAnimateDescription && !isExpandedView ? `${descMarqueeDistance}px` : '0px' }">
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

                        <!-- Swipe up hint for media content -->
                        <div v-if="!isExpandedView && ['image', 'video'].includes(currentEventType as string)"
                            class="flex justify-center mb-2 opacity-60 transition-opacity duration-300"
                            :class="{ 'opacity-0': isSwipingUp }">
                            <div class="swipe-up-container">
                                <svg class="chevron-left" viewBox="0 0 24 12" width="24" height="12">
                                    <polyline points="2,10 12,2 22,10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span class="swipe-text">Swipe up for more</span>
                                <svg class="chevron-right" viewBox="0 0 24 12" width="24" height="12">
                                    <polyline points="2,10 12,2 22,10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>

                        <!-- Navigation controls -->
                        <div
                            class="sticky bottom-0 flex justify-between items-center mt-auto pt-2 px-2 z-10">
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

/* Scrollable content area styling */
.scrollable-content {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
    scroll-behavior: smooth;
    /* Ensure content doesn't get cut off */
    padding-bottom: 1rem;
}

.scrollable-content::-webkit-scrollbar {
    width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    margin: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.6);
}

/* Disable pointer events during card dragging to prevent scroll conflicts */
.scrollable-content.pointer-events-none {
    pointer-events: none;
}

/* Title marquee animation */
@keyframes marquee {
    0%, 15% {
        transform: translateX(0);
    }
    45%, 55% {
        transform: translateX(var(--marquee-distance, 0));
    }
    85%, 100% {
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

/* Description marquee animation */
@keyframes marquee-vertical {
    0%, 15% {
        transform: translateY(0);
    }
    45%, 55% {
        transform: translateY(var(--marquee-distance-vertical, 0));
    }
    85%, 100% {
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

/* Card drag interaction styles */
.content-wrapper {
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.content-wrapper.cursor-grabbing {
    transform: scale(0.98);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

/* Improved media element interaction */
[data-fancybox] img,
[data-fancybox] video {
    cursor: pointer;
    touch-action: manipulation;
    transition: transform 0.1s ease-out;
}

[data-fancybox] img:active,
[data-fancybox] video:active {
    transform: scale(0.98);
}

/* Prevent text selection during drag */
.select-none {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* Swipe up indicator animation */
.swipe-up-container {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    animation: swipeUpMotion 4s ease-in-out infinite;
}

.chevron-left,
.chevron-right {
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    color: rgba(255, 255, 255, 0.8);
}

.swipe-text {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.9);
}

@keyframes swipeUpMotion {
    0% {
        transform: translateY(0);
    }
    16.67% {
        transform: translateY(-8px);
    }
    33.33% {
        transform: translateY(0);
    }
    33.34%, 100% {
        transform: translateY(0);
    }
}
</style>

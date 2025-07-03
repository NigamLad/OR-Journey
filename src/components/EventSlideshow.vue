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
        dragTimeoutId?: number;
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
const mediaContainerRef = ref<HTMLDivElement | null>(null);
const shouldAnimateTitle = ref(false);
const shouldAnimateDescription = ref(false);
const shouldAnimateMedia = ref(false);
const shouldExpandMediaContainer = ref(false);
const isTitleOverflowing = ref(false);
const isDescriptionOverflowing = ref(false);
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

            // Reset animations immediately
            isTransitioning.value = true;
            shouldAnimateMedia.value = false;
            shouldExpandMediaContainer.value = false;
            // After slide transition is complete
            setTimeout(() => {
                isTransitioning.value = false;

                // The setTimeout already created a delay, so DOM should be updated
                if (isExpandedView.value) {
                    // Start the coordinated animation sequence only if view is expanded
                    startCoordinatedAnimationSequence();
                } else {
                    // Just setup title and description animations if view is collapsed
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

// Initialize on mount
onMounted(() => {
    if (props.events && props.events.length > 0) {
        currentEventIndex.value = 0;

        // Wait for initial render to complete 
        nextTick(() => {
            if (isExpandedView.value) {
                // Start the coordinated animation sequence only if view is expanded
                startCoordinatedAnimationSequence();
            }
        });
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

        // Don't animate description when in expanded view
        if (isExpandedView.value) {
            shouldAnimateDescription.value = false;
            isDescriptionOverflowing.value = false;
            descMarqueeDistance.value = '0';
            return;
        }

        // Allow a bit more time for the animation to complete
        // before checking for overflow to avoid calculation errors
        setTimeout(() => {
            // Force a recalculation of layout by triggering a reflow
            void element.offsetHeight;

            // Get the container height directly from container ref
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
        }, 100); // Small delay to ensure transition has stabilized
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
    // Reset all animations immediately
    shouldAnimateMedia.value = false;
    shouldExpandMediaContainer.value = false;

    // Force a browser reflow to ensure the container's initial height is correctly set to 0
    if (mediaContainerRef.value) {
        void mediaContainerRef.value.offsetHeight;
    }

    // Don't immediately set media animation true here if we're transitioning,
    // as the transition watcher will handle it
    if (!isTransitioning.value) {
        // If we're not in a transition but index changed directly
        if (isExpandedView.value) {
            // Only start animations if the view is expanded
            startCoordinatedAnimationSequence();
        } else {
            // If not expanded, just setup text animations
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
    // Reset animations immediately in all cases
    shouldAnimateMedia.value = false;
    shouldExpandMediaContainer.value = false;

    // Force a browser reflow to ensure styles are applied immediately
    if (mediaContainerRef.value) {
        void mediaContainerRef.value.offsetHeight;
    }

    // Handle description animation timing
    if (newVal) {
        // When expanding, disable animation during transition
        shouldAnimateDescription.value = false;
        
        // If expanding and we have media content
        if (['image', 'video'].includes(currentEventType.value as string)) {
            // Wait for expand transition to complete first
            setTimeout(() => {
                // Then start our coordinated animation sequence
                startCoordinatedAnimationSequence();
            }, 500); // Increased wait time to match the transition duration
        } else {
            // Just setup text animations for non-media content after the transition completes
            setTimeout(() => {
                setupTitleAnimation();
                setupDescriptionAnimation();
            }, 500); // Increased wait time to match the transition duration
        }
    } else {
        // When collapsing, check for description overflow after the transition completes
        setTimeout(() => {
            setupDescriptionAnimation();
            checkScrollability(); // Also check scrollability after collapse
            
            // Reset scroll position to top when collapsing
            if (scrollableContentRef.value) {
                scrollableContentRef.value.scrollTop = 0;
                isAtScrollTop.value = true;
            }
        }, 500); // Increased wait time to match the transition duration
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

        // Setup initial animation state with nextTick to ensure DOM is rendered
        nextTick(() => {
            if (isExpandedView.value) {
                // Start the coordinated animation sequence only if view is expanded
                startCoordinatedAnimationSequence();
            } else {
                // Just setup text animations if view is collapsed
                setupTitleAnimation();
                setupDescriptionAnimation();
            }
            
            // Check if content is scrollable after initial render
            checkScrollability();
            
            // Also set up the initial scroll position check
            if (scrollableContentRef.value) {
                scrollableContentRef.value.scrollTop = 0; // Ensure we start at the top
                isAtScrollTop.value = true;
            }
        });

        // Add resize listener to handle viewport changes
        window.addEventListener('resize', handleResize);
    }
});

// Clean up event listeners when component is destroyed
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    // Clean up card drag listeners if they exist
    window.removeEventListener('mousemove', onCardDragMove);
    window.removeEventListener('touchmove', onCardDragMove);
    window.removeEventListener('mouseup', onCardDragEnd);
    window.removeEventListener('touchend', onCardDragEnd);

    // Clear any pending timeout
    if (window.dragTimeoutId) {
        clearTimeout(window.dragTimeoutId);
        window.dragTimeoutId = undefined;
    }

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

// Helper function to coordinate all animations in proper sequence
function startCoordinatedAnimationSequence() {
    // Reset all animation states
    shouldAnimateMedia.value = false;
    shouldExpandMediaContainer.value = false;

    // Force a browser reflow to ensure the container is initially set to height 0
    if (mediaContainerRef.value) {
        void mediaContainerRef.value.offsetHeight;
    }

    // First step: expand the container
    setTimeout(() => {
        shouldExpandMediaContainer.value = true;

        // Second step: fade in the media after container is fully expanded
        setTimeout(() => {
            shouldAnimateMedia.value = true;

            // Final step: ensure other animations (title, description) are checked
            setupTitleAnimation();
            setupDescriptionAnimation();
        }, 500); // Wait for container to fully expand
    }, 200); // Small initial delay
}

// Handle card drag start
function handleCardDragStart(event: TouchEvent) {
    // Only activate on primary touch (usually the first finger)
    if (event.touches.length === 1) {
        isCardDragging.value = true;
        cardDragStartY.value = event.touches[0].clientY;
        cardDragProgress.value = 0;

        // Prevent default to avoid scrolling while dragging
        event.preventDefault();
    }
}

// Handle card drag move
function handleCardDragMove(event: TouchEvent) {
    if (isCardDragging.value) {
        const deltaY = event.touches[0].clientY - cardDragStartY.value;
        cardDragProgress.value = deltaY;

        // Apply drag distance to card's transform
        if (cardRef.value) {
            cardRef.value.style.transform = `translateY(${deltaY}px)`;
        }

        // Prevent default to avoid scrolling while dragging
        event.preventDefault();
    }
}

// Card-wide swipe functionality
function onCardDragStart(event: MouseEvent | TouchEvent) {
    // Prevent starting drag on interactive elements that have their own drag functionality
    const target = event.target as HTMLElement;
    if (target.closest('button') || 
        target.closest('input') || 
        target.closest('a:not([data-fancybox])') ||
        target.closest('.horizontal-bar') || // Exclude horizontal bar component
        target.closest('[class*="horizontal"]') || // Exclude any element with "horizontal" in class name
        target.closest('[data-horizontal-bar]') || // Exclude if has horizontal bar data attribute
        target.closest('svg') && target.closest('.horizontal-bar')) { // Exclude SVGs within horizontal bar
        return;
    }

    // Check if we're interacting with media elements (images/videos)
    const isMediaElement = target.tagName === 'IMG' || target.tagName === 'VIDEO' || 
                          target.closest('img') || target.closest('video');
    
    // For media elements, we need to distinguish between drag and click
    if (isMediaElement || target.closest('[data-fancybox]')) {
        // Track initial position for media elements to detect drag vs click
        let initialX = 0;
        let initialY = 0;
        
        if (event instanceof MouseEvent) {
            initialX = event.clientX;
            initialY = event.clientY;
        } else if (event.touches?.length) {
            initialX = event.touches[0].clientX;
            initialY = event.touches[0].clientY;
        }
        
        // Add temporary listeners to detect movement
        const moveThreshold = 10; // pixels
        let hasMoved = false;
        
        const mediaIntentHandler = (moveEvent: MouseEvent | TouchEvent) => {
            let currentX = 0;
            let currentY = 0;
            
            if (moveEvent instanceof MouseEvent) {
                currentX = moveEvent.clientX;
                currentY = moveEvent.clientY;
            } else if (moveEvent.touches?.length) {
                currentX = moveEvent.touches[0].clientX;
                currentY = moveEvent.touches[0].clientY;
            }
            
            const deltaX = Math.abs(currentX - initialX);
            const deltaY = Math.abs(currentY - initialY);
            
            if (deltaX > moveThreshold || deltaY > moveThreshold) {
                hasMoved = true;
                // This is a drag gesture, prevent Fancybox and start our drag
                moveEvent.preventDefault();
                moveEvent.stopPropagation();
                cleanupMediaIntentListeners();
                
                // Start our card drag with the original event
                startCardDrag(event, initialY, initialX);
            }
        };
        
        const mediaEndHandler = (endEvent: MouseEvent | TouchEvent) => {
            cleanupMediaIntentListeners();
            
            if (!hasMoved) {
                // This was a click/tap, allow Fancybox to handle it
                // Don't prevent default, let the event bubble up to Fancybox
                return;
            } else {
                // This was a drag, prevent any click behavior
                endEvent.preventDefault();
                endEvent.stopPropagation();
            }
        };
        
        const cleanupMediaIntentListeners = () => {
            window.removeEventListener('mousemove', mediaIntentHandler);
            window.removeEventListener('touchmove', mediaIntentHandler);
            window.removeEventListener('mouseup', mediaEndHandler);
            window.removeEventListener('touchend', mediaEndHandler);
        };
        
        // Add listeners for media intent detection
        window.addEventListener('mousemove', mediaIntentHandler, { passive: false });
        window.addEventListener('touchmove', mediaIntentHandler, { passive: false });
        window.addEventListener('mouseup', mediaEndHandler, { passive: false });
        window.addEventListener('touchend', mediaEndHandler, { passive: false });
        
        return; // Exit here for media elements, let intent detection take over
    }

    // Check if the target is within a scrollable area and if that area is actually scrollable
    const scrollableParent = target.closest('.scrollable-content');
    if (scrollableParent) {
        const isScrollable = scrollableParent.scrollHeight > scrollableParent.clientHeight;
        
        // If content is not scrollable, always allow drag gestures
        if (!isScrollable) {
            startCardDrag(event);
            return;
        }
        
        // Content is scrollable, so we need to determine intent based on the simple rules
        if (isScrollable) {
            // Get scroll position information
            const scrollTop = scrollableParent.scrollTop;
            const isAtTop = scrollTop <= 1; // Very small threshold for "at top"
            
            // Get initial touch/mouse position to determine intent
            let startY = 0;
            let startX = 0;
            if (event instanceof MouseEvent) {
                startY = event.clientY;
                startX = event.clientX;
            } else if (event.touches?.length) {
                startY = event.touches[0].clientY;
                startX = event.touches[0].clientX;
            }
            
            // Store the start positions for later use in determining drag vs scroll intent
            cardDragStartY.value = startY;
            cardDragStartX.value = startX;
            
            // Add a temporary listener to determine user intent
            const intentHandler = (moveEvent: MouseEvent | TouchEvent) => {
                let currentY = 0;
                let currentX = 0;
                if (moveEvent instanceof MouseEvent) {
                    currentY = moveEvent.clientY;
                    currentX = moveEvent.clientX;
                } else if (moveEvent.touches?.length) {
                    currentY = moveEvent.touches[0].clientY;
                    currentX = moveEvent.touches[0].clientX;
                }
                
                const deltaY = currentY - startY;
                const deltaX = currentX - startX;
                const isVerticalMovement = Math.abs(deltaY) > 5;
                const isHorizontalMovement = Math.abs(deltaX) > 5;
                
                // Check for horizontal swipe first (navigation)
                if (isHorizontalMovement && Math.abs(deltaX) > Math.abs(deltaY)) {
                    cleanupIntentListeners();
                    startCardDrag(event, startY, startX);
                    return;
                }
                
                // Then check for vertical movement (expand/collapse or scroll)
                if (isVerticalMovement) {
                    const isScrollingDown = deltaY > 0;
                    
                    // Simple rule: If expanded, at scroll top, and swiping down → collapse
                    if (isExpandedView.value && isAtTop && isScrollingDown) {
                        cleanupIntentListeners();
                        startCardDrag(event, startY, startX);
                        return;
                    }
                    
                    // Simple rule: If collapsed and swiping up → expand (content shouldn't be scrollable when collapsed)
                    if (!isExpandedView.value && !isScrollingDown) {
                        cleanupIntentListeners();
                        startCardDrag(event, startY, startX);
                        return;
                    }
                    
                    // Otherwise: allow normal scrolling
                    cleanupIntentListeners();
                    return;
                }
            };
            
            const cleanupIntentListeners = () => {
                window.removeEventListener('mousemove', intentHandler);
                window.removeEventListener('touchmove', intentHandler);
                window.removeEventListener('mouseup', cleanupIntentListeners);
                window.removeEventListener('touchend', cleanupIntentListeners);
            };
            
            // Add intent detection listeners with passive touch for better performance
            window.addEventListener('mousemove', intentHandler, { passive: false });
            window.addEventListener('touchmove', intentHandler, { passive: false });
            window.addEventListener('mouseup', cleanupIntentListeners);
            window.addEventListener('touchend', cleanupIntentListeners);
            
            return; // Exit early to let intent handler take over
        }
    }
    
    // No scrollable content or not scrollable, proceed with drag
    startCardDrag(event);
}

function startCardDrag(event: MouseEvent | TouchEvent, predeterminedStartY?: number, predeterminedStartX?: number) {
    isCardDragging.value = true;
    isDragging.value = true; // Also set the main dragging state to disable transitions
    swipeType.value = 'none'; // Reset swipe type

    // Get the starting Y and X positions
    if (predeterminedStartY !== undefined) {
        cardDragStartY.value = predeterminedStartY;
    } else if (event instanceof MouseEvent) {
        cardDragStartY.value = event.clientY;
    } else if (event.touches?.length) {
        cardDragStartY.value = event.touches[0].clientY;
    }

    if (predeterminedStartX !== undefined) {
        cardDragStartX.value = predeterminedStartX;
    } else if (event instanceof MouseEvent) {
        cardDragStartX.value = event.clientX;
    } else if (event.touches?.length) {
        cardDragStartX.value = event.touches[0].clientX;
    }

    // Prevent default to avoid text selection while dragging
    event.preventDefault();

    // Add event listeners for drag and release
    window.addEventListener('mousemove', onCardDragMove);
    window.addEventListener('touchmove', onCardDragMove, { passive: false });
    window.addEventListener('mouseup', onCardDragEnd);
    window.addEventListener('touchend', onCardDragEnd);
}

function onCardDragMove(event: MouseEvent | TouchEvent) {
    if (!isCardDragging.value) return;

    // Prevent default to avoid scrolling while dragging
    event.preventDefault();

    // Get current position
    let currentY = 0;
    let currentX = 0;
    if (event instanceof MouseEvent) {
        currentY = event.clientY;
        currentX = event.clientX;
    } else if (event.touches?.length) {
        currentY = event.touches[0].clientY;
        currentX = event.touches[0].clientX;
    }

    // Calculate drag distances in pixels
    const dragDistanceY = currentY - cardDragStartY.value; // Positive = down, Negative = up
    const dragDistanceX = currentX - cardDragStartX.value; // Positive = right, Negative = left

    // Determine swipe type if not already determined
    if (swipeType.value === 'none') {
        const absY = Math.abs(dragDistanceY);
        const absX = Math.abs(dragDistanceX);
        
        // Require some minimum movement to determine direction
        if (absY > 10 || absX > 10) {
            // Determine primary direction based on which has more movement
            if (absX > absY) {
                swipeType.value = 'horizontal';
            } else {
                swipeType.value = 'vertical';
            }
        } else {
            // Not enough movement yet, continue
            return;
        }
    }

    if (swipeType.value === 'horizontal') {
        // Handle horizontal swipe for navigation
        horizontalDragDirection.value = dragDistanceX; // Store horizontal direction
        const absHorizontalDistance = Math.abs(dragDistanceX);
        cardDragProgress.value = Math.max(0, Math.min(horizontalSwipeThreshold, absHorizontalDistance));
        
        // Visual feedback for horizontal swipe (could be used for navigation preview)
        emit('expandProgress', 0); // No vertical progress for horizontal swipes
        
    } else if (swipeType.value === 'vertical') {
        // Handle vertical swipe for expand/collapse (existing logic)
        cardDragDirection.value = dragDistanceY;

        // Enhanced logic for valid drag directions:
        // - If content is not scrollable: allow all card drag gestures
        // - If content is scrollable: only allow card drag when at scroll boundaries
        const scrollableParent = document.querySelector('.scrollable-content') as HTMLElement;
        const isContentScrollable = scrollableParent ? 
            scrollableParent.scrollHeight > scrollableParent.clientHeight : false;
        
        if (isContentScrollable) {
            const isAtScrollTop = scrollableParent.scrollTop <= 1;
            
            if (isExpandedView.value) {
                // When expanded with scrollable content:
                // - Only allow down drag (collapse) when at scroll top
                // - Block up drag (would interfere with scrolling)
                if (dragDistanceY > 0 && isAtScrollTop) {
                    // Down drag allowed when expanded and at scroll top (for collapse)
                } else {
                    // Block all other gestures when content is scrollable
                    return;
                }
            } else {
                // When collapsed, content shouldn't be scrollable, but if it is, only allow up drag
                if (dragDistanceY < 0) {
                    // Up drag allowed when collapsed (for expand)
                } else {
                    return;
                }
            }
        } else {
            // Content is not scrollable - allow normal card gestures
            if (isExpandedView.value) {
                // When expanded with no overflow: allow both up and down drag
            } else {
                // When collapsed: only allow up drag (expand)
                if (dragDistanceY > 0) {
                    return;
                }
            }
        }

        // Use absolute value for internal progress tracking, capped at threshold
        cardDragProgress.value = Math.max(0, Math.min(cardDragThreshold, Math.abs(dragDistanceY)));

        // Emit the drag distance to parent for any visual feedback
        emit('expandProgress', -dragDistanceY);
    }
}

function onCardDragEnd() {
    if (!isCardDragging.value) {
        // Even if card dragging is false, ensure isDragging is reset
        isDragging.value = false;
        return;
    }

    isCardDragging.value = false;

    // Handle different swipe types
    if (swipeType.value === 'horizontal') {
        // Handle horizontal navigation swipe
        if (cardDragProgress.value >= horizontalSwipeThreshold * 0.5) {
            if (horizontalDragDirection.value > 0) {
                // Swiped right - go to previous event
                goToPreviousEvent();
            } else {
                // Swiped left - go to next event
                goToNextEvent();
            }
        }
        
    } else if (swipeType.value === 'vertical') {
        // Handle vertical expand/collapse swipe (existing logic)
        if (cardDragProgress.value >= cardDragThreshold * 0.5) {
            // We've dragged far enough to trigger a state change
            // But we need to check if it's in the correct direction
            if (isExpandedView.value) {
                // Currently expanded - only collapse on downward drag (positive direction)
                if (cardDragDirection.value > 0) {
                    isExpandedView.value = false;
                    emit('expandProgress', -9999);
                } else {
                    // Upward drag when expanded - cancel the action
                    emit('expandProgress', 0);
                }
            } else {
                // Currently collapsed - only expand on upward drag (negative direction)
                if (cardDragDirection.value < 0) {
                    isExpandedView.value = true;
                    emit('expandProgress', 9999);
                } else {
                    // Downward drag when collapsed - cancel the action
                    emit('expandProgress', 0);
                }
            }
        } else {
            // Not enough drag, cancel and reset
            emit('expandProgress', 0);
        }
    }

    // Reset states - ensure isDragging is always reset
    cardDragProgress.value = 0;
    cardDragDirection.value = 0;
    horizontalDragDirection.value = 0;
    swipeType.value = 'none';
    isDragging.value = false;

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
                        <div class="flex-grow flex flex-col items-center overflow-hidden">
                            <!-- Scrollable content area -->
                            <div ref="scrollableContentRef"
                                class="w-full h-full overflow-y-auto overflow-x-hidden scrollable-content"
                                :class="{ 
                                    'pointer-events-none': isCardDragging,
                                    'pull-to-collapse-hint': isExpandedView && isAtScrollTop && isContentScrollable
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
                                </div> <!-- Media container -->
                                <div v-if="isExpandedView && ['image', 'video'].includes(currentEventType as string)"
                                    ref="mediaContainerRef"
                                    class="flex justify-center w-full overflow-hidden transition-all duration-500 ease-in-out"
                                    :style="{
                                        maxHeight: shouldExpandMediaContainer ? '50vh' : '0',
                                        marginBottom: shouldExpandMediaContainer ? '1rem' : '0',
                                        opacity: shouldExpandMediaContainer ? 1 : 0
                                    }" :class="{ 'media-container-expanded': shouldExpandMediaContainer }">
                                    <!-- Image content with Fancybox -->
                                    <Fancybox v-if="currentEventType === 'image'" :options="FancyBoxOptions as any"
                                        :delegate="'[data-fancybox]'" class="w-full">
                                        <a :href="currentEvent?.image" data-fancybox class="block"> <img
                                                :src="currentEvent?.image" alt="Event Image" class="rounded-lg object-contain shadow-lg hover:shadow-xl 
                                                       shadow-white/10 hover:shadow-white/20 w-full
                                                       opacity-0 transition-all duration-500 ease-out delay-100"
                                                :class="{ 'opacity-100 hover:scale-[1.02]': shouldAnimateMedia }" />
                                        </a>
                                    </Fancybox>

                                    <!-- Video content with Fancybox -->
                                    <Fancybox v-else-if="currentEventType === 'video'" :options="FancyBoxOptions as any"
                                        :delegate="'[data-fancybox]'" class="w-full">
                                        <a :href="currentEvent?.video" data-fancybox class="block"> <video class="rounded-lg object-contain shadow-lg hover:shadow-xl 
                                                         shadow-white/10 hover:shadow-white/20 w-full
                                                         opacity-0 transition-all duration-500 ease-out delay-100"
                                                :class="{ 'opacity-100': shouldAnimateMedia }" controls>
                                                <source :src="currentEvent?.video" type="video/mp4">
                                                Your browser does not support video playback.
                                            </video>
                                        </a>
                                    </Fancybox>
                                </div>                                <!-- Description section - dynamic height based on view mode with animation -->
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

/* Visual hint for pull-to-collapse when at top of scrollable content */
.scrollable-content.pull-to-collapse-hint {
    position: relative;
}

.scrollable-content.pull-to-collapse-hint::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    border-radius: 2px;
    z-index: 10;
    animation: pullHint 2s ease-in-out infinite;
}

@keyframes pullHint {
    0%, 100% {
        opacity: 0.3;
        transform: translateX(-50%) translateY(0);
    }
    50% {
        opacity: 0.7;
        transform: translateX(-50%) translateY(2px);
    }
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

/* Media container animations are applied inline for smoother transitions */

/* Card drag interaction styles */
.content-wrapper {
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.content-wrapper.cursor-grabbing {
    transform: scale(0.98);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.content-wrapper:active {
    transform: scale(0.98);
}

/* Improved drag cursor feedback */
.cursor-grab {
    cursor: grab;
}

.cursor-grabbing {
    cursor: grabbing;
    user-select: none;
}

/* Improved media element interaction */
[data-fancybox] img,
[data-fancybox] video {
    cursor: pointer;
    touch-action: manipulation;
    /* Smooth transition for better interaction feedback */
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

/* Horizontal swipe feedback */
.content-wrapper.horizontal-swipe {
    transition: transform 0.2s ease-out;
}

.content-wrapper.horizontal-swipe.swipe-left {
    transform: translateX(-10px);
}

.content-wrapper.horizontal-swipe.swipe-right {
    transform: translateX(10px);
}
</style>

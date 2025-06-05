<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { OperationEvent } from '@/types'
import Clock from '@/components/icons/clock.vue'

// Define props to accept events and current index
const props = defineProps<{
    events?: OperationEvent[]
    currentIndex?: number
}>()

// Define emit for navigation events
const emit = defineEmits<{
    (e: 'navigate', index: number, direction: 'next' | 'prev' | 'direct'): void
}>()

// Using ref for the percentage instead of a prop
const percentage = ref(0)

// Calculate the arc path based on the given percentage
const radius = 40
const circumference = 2 * Math.PI * radius

// Track whether the percentage is being manually controlled or automatically updated
const autoUpdatePercentage = ref(true)

// Clock face properties
const clockSize = ref(300)
const clockContainer = ref<HTMLDivElement | null>(null)

// Drag interaction state variables
const isDragging = ref(false)
const lastHoveredEventIndex = ref(-1)
const dragHitRadius = 6 // Radius in SVG units to detect event hits when dragging

// Animation properties
const animating = ref(false)
const displayedPercentage = ref(0)

// Define TypeScript interface for event position objects
interface EventPosition {
    event: OperationEvent;
    index: number;
    angle: number;
    originalAngle?: number;
    x: number;
    y: number;
    isActive: boolean;
    formattedTime: string;
}

// Compute the actual percentage (with default and bounds)
const computedPercentage = computed(() => {
    return Math.min(100, Math.max(0, percentage.value)) // Ensure value is between 0 and 100
})

// Calculate the stroke-dasharray and stroke-dashoffset to create the arc effect
const strokeDasharray = circumference
const strokeDashoffset = computed(() => {
    // Calculate how much of the circle to show based on the displayed percentage
    return circumference - (displayedPercentage.value / 100) * circumference
})

// Function to set percentage with animation
const setPercentage = (newValue: number) => {
    percentage.value = Math.min(100, Math.max(0, newValue)) // Ensure value is between 0 and 100
}

// Demo function to update percentage randomly
const updateRandomPercentage = () => {
    const newValue = Math.floor(Math.random() * 100)
    setPercentage(newValue)

    // Find the closest event to this percentage and navigate to it
    if (props.events && props.events.length > 0) {
        const targetTime = timeRange.value.earliest + (newValue / 100) * timeRange.value.range;
        let closestIndex = 0;
        let closestDiff = Infinity;

        props.events.forEach((event, index) => {
            const eventTime = new Date(event.timestamp).getTime();
            const diff = Math.abs(eventTime - targetTime);

            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = index;
            }
        });

        emit('navigate', closestIndex, 'direct');
    }
}

// Function to update clock size based on container dimensions
const updateClockSize = () => {
    if (!clockContainer.value) return

    // Get parent element dimensions or use viewport as fallback
    const parentElement = clockContainer.value.parentElement
    if (!parentElement) return

    // Get the available width (minus padding for margins)
    const containerWidth = parentElement.clientWidth - 32 // Allow some margin on sides

    // Get available height (accounting for the parent's constraints)
    // Use parent height if available, otherwise use a portion of viewport height
    const containerHeight = parentElement.clientHeight || window.innerHeight - 140
    const availableHeight = containerHeight - 16 // Small margin top/bottom

    // Use the smaller of the two dimensions to maintain square aspect ratio
    // This ensures the clock fits properly within its container regardless of shape
    const maxSize = Math.min(containerWidth, availableHeight)

    // Set a size with minimum and maximum constraints
    // Min: ensure clock is not too small to be unusable
    // Max: ensure clock doesn't overflow its container on smaller screens
    clockSize.value = Math.max(
        Math.min(300, containerWidth * 0.9), // Minimum size (or 90% of container if container is smaller)
        Math.min(maxSize, Math.min(800, containerWidth * 0.95)) // Maximum size
    )
}

// Calculate the earliest and latest timestamps for event positioning
const timeRange = computed(() => {
    if (!props.events || props.events.length === 0) return { earliest: 0, latest: 0, range: 0 };

    const timestamps = props.events?.map(event => new Date(event.timestamp).getTime()) || [];
    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);

    return {
        earliest,
        latest,
        range: latest - earliest || 1 // Avoid division by zero
    };
});

// Function to adjust overlapping events
function adjustOverlappingEvents(positions: EventPosition[]): EventPosition[] {
    if (positions.length <= 1) return positions;

    // Sort positions by angle for easier processing
    const sorted = [...positions].sort((a, b) => a.angle - b.angle);

    // Minimum angle difference (in degrees) to avoid overlap
    const minAngleDiff = 8; // Adjust as needed for visual spacing

    // Start with the first event
    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        // Calculate angle difference (consider 0/360 boundary)
        let angleDiff = next.angle - current.angle;
        if (angleDiff < 0) angleDiff += 360;

        // If events are too close, adjust their positions
        if (angleDiff < minAngleDiff) {
            // How much adjustment is needed
            const adjustment = (minAngleDiff - angleDiff) / 2;

            // Adjust both events in opposite directions
            current.angle = (current.angle - adjustment + 360) % 360;
            next.angle = (next.angle + adjustment) % 360;

            // Recalculate x,y positions
            const updatePosition = (pos: EventPosition): void => {
                const radians = (pos.angle - 90) * (Math.PI / 180);
                pos.x = 50 + Math.cos(radians) * radius;
                pos.y = 50 + Math.sin(radians) * radius;
            };

            updatePosition(current);
            updatePosition(next);
        }
    }

    // Special case: check if the first and last events overlap (around the 0/360 boundary)
    if (sorted.length > 1) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        let angleDiff = (first.angle + 360) - last.angle;
        if (angleDiff > 360) angleDiff -= 360;

        if (angleDiff < minAngleDiff) {
            const adjustment = (minAngleDiff - angleDiff) / 2;

            first.angle = (first.angle + adjustment) % 360;
            last.angle = (last.angle - adjustment + 360) % 360;

            // Recalculate positions
            const radians1 = (first.angle - 90) * (Math.PI / 180);
            first.x = 50 + Math.cos(radians1) * radius;
            first.y = 50 + Math.sin(radians1) * radius;

            const radians2 = (last.angle - 90) * (Math.PI / 180);
            last.x = 50 + Math.cos(radians2) * radius;
            last.y = 50 + Math.sin(radians2) * radius;
        }
    }

    // Return the original array with updated positions (maintaining original indices)
    return positions.map(pos => {
        const adjusted = sorted.find(s => s.index === pos.index);
        return adjusted || pos; // Fallback to original position if not found
    });
}

// Calculate positions for events on the clock face
const eventPositions = computed(() => {
    if (!props.events || props.events.length === 0) return [];

    // Calculate initial positions based on timestamps
    const positions = props.events.map((event, index) => {
        const timestamp = new Date(event.timestamp).getTime();

        // Convert timestamp to angle (0 to 360 degrees)
        const normalizedPosition = (timestamp - timeRange.value.earliest) / timeRange.value.range;
        const angle = normalizedPosition * 360;

        // Calculate x, y position on the circle
        const eventRadius = radius; // Same radius as the arc
        const radians = (angle - 90) * (Math.PI / 180); // -90 to start at the top
        const x = 50 + Math.cos(radians) * eventRadius;
        const y = 50 + Math.sin(radians) * eventRadius;

        return {
            event,
            index,
            angle,
            originalAngle: angle, // Keep track of the original angle
            x,
            y,
            isActive: index === (props.currentIndex || 0),
            formattedTime: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    });

    // Apply the overlapping adjustment
    return adjustOverlappingEvents(positions as EventPosition[]);
});

// Function to navigate to a selected event
function navigateToEvent(index: number) {
    // Determine direction based on current and target indices
    let direction: 'next' | 'prev' | 'direct' = 'direct';

    if (props.currentIndex !== undefined) {
        direction = index > props.currentIndex ? 'next' : 'prev';
    }

    // Immediate visual feedback: update the progress in the component first
    if (props.events && props.events.length > 0) {
        const timestamp = new Date(props.events[index].timestamp).getTime();
        const progress = ((timestamp - timeRange.value.earliest) / timeRange.value.range) * 100;
        setPercentage(progress);
    }

    // Update eventPositions isActive property immediately for visual feedback
    eventPositions.value.forEach(pos => {
        pos.isActive = pos.index === index;
    });

    // Emit the navigate event to the parent component with direction information
    emit('navigate', index, direction);
}

// Function to determine event color based on its type
function getEventTypeColor(type: string | undefined): string {
    if (!type) return '#808080'; // Default gray for undefined

    // Normalize the type string
    const normalizedType = type.trim().toLowerCase();

    // Match by substring to be resilient
    if (normalizedType.includes('pre') || normalizedType.includes('pre operative')) {
        return '#3B82F6'; // blue-500
    }

    if (normalizedType.includes('intra') || normalizedType === 'intraoperative') {
        return '#10B981'; // green-500
    }

    if (normalizedType.includes('post') || normalizedType.includes('post operative')) {
        return '#8B5CF6'; // purple-500
    }

    return '#808080'; // Default gray
}

// Watch for percentage changes and animate the transition
watch(computedPercentage, (newValue) => {
    animating.value = true

    // Get starting value for animation
    const startValue = displayedPercentage.value
    const endValue = newValue
    const difference = endValue - startValue
    const duration = 1000 // Animation duration in milliseconds
    const startTime = performance.now()

    // Animation function
    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Use easeOutCubic easing function for smoother animation
        const easing = 1 - Math.pow(1 - progress, 3)
        displayedPercentage.value = startValue + difference * easing

        if (progress < 1) {
            requestAnimationFrame(animate)
        } else {
            displayedPercentage.value = endValue
            animating.value = false
        }
    }

    requestAnimationFrame(animate)
})

// Watch for changes in currentIndex to update the progress bar
watch(() => props.currentIndex, (newIndex) => {
    if (newIndex === undefined || !props.events || props.events.length === 0) return;

    // Update progress bar to match the selected event's position
    const timestamp = new Date(props.events[newIndex].timestamp).getTime();
    const progress = ((timestamp - timeRange.value.earliest) / timeRange.value.range) * 100;
    setPercentage(progress);
}, { immediate: true })

// Watch for clock size changes to trigger recalculations if needed
watch(clockSize, () => {
    // This ensures any calculations that depend on clockSize are updated
    // We could add specific recalculations here if needed in the future
}, { flush: 'post' })

// Generate hour markers positions for the clock face
const hourMarkers = computed(() => {
    const markers = []
    for (let hour = 1; hour <= 12; hour++) {
        const angle = (hour * 30 - 90) * Math.PI / 180 // 30 degrees per hour, start at -90 (12 o'clock)
        const outerRadius = radius + 5
        const innerRadius = radius

        markers.push({
            hour,
            x1: 50 + innerRadius * Math.cos(angle),
            y1: 50 + innerRadius * Math.sin(angle),
            x2: 50 + outerRadius * Math.cos(angle),
            y2: 50 + outerRadius * Math.sin(angle)
        })
    }
    return markers
})

// Create a resize observer reference
const resizeObserver = ref<ResizeObserver | null>(null)

// Initialize the displayed percentage
onMounted(() => {
    displayedPercentage.value = computedPercentage.value

    // Initial size calculation
    updateClockSize()

    // Set up responsive sizing with window events as fallback
    window.addEventListener('resize', updateClockSize)
    window.addEventListener('orientationchange', () => {
        setTimeout(updateClockSize, 100)
    })

    // Use ResizeObserver for more responsive size adjustments based on parent container
    if (clockContainer.value?.parentElement && 'ResizeObserver' in window) {
        resizeObserver.value = new ResizeObserver(() => {
            updateClockSize()
        })

        // Observe the parent container for size changes
        resizeObserver.value.observe(clockContainer.value.parentElement)

        // Also observe the clock container itself
        resizeObserver.value.observe(clockContainer.value)
    }
})

// Clean up event listeners
onUnmounted(() => {
    window.removeEventListener('resize', updateClockSize)
    window.removeEventListener('orientationchange', updateClockSize)
    
    // Clean up drag event listeners if they somehow weren't removed
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)

    // Clean up ResizeObserver
    if (resizeObserver.value) {
        resizeObserver.value.disconnect()
        resizeObserver.value = null
    }
})

// Function called when slider is dragged
function onSliderInput() {
    if (!props.events || props.events.length === 0) return;

    // Get the target timestamp based on the percentage
    const targetTime = timeRange.value.earliest + (percentage.value / 100) * timeRange.value.range;

    // Find the closest event to this timestamp
    let closestIndex = 0;
    let closestDiff = Infinity;

    props.events.forEach((event, index) => {
        const eventTime = new Date(event.timestamp).getTime();
        const diff = Math.abs(eventTime - targetTime);

        if (diff < closestDiff) {
            closestDiff = diff;
            closestIndex = index;
        }
    });

    // Only update if the closest event is different from the current one
    if (closestIndex !== props.currentIndex) {
        emit('navigate', closestIndex, 'direct');
    }
}

// DRAG INTERACTION FUNCTIONS
// -------------------------

// Convert screen coordinates to clock face coordinates
function getClockCoordinates(clientX: number, clientY: number): { x: number, y: number } {
    if (!clockContainer.value) return { x: 0, y: 0 };
    
    // Get the SVG element's bounding rectangle
    const svgRect = clockContainer.value.querySelector('svg')?.getBoundingClientRect();
    if (!svgRect) return { x: 0, y: 0 };
    
    // Calculate position relative to SVG viewBox (0,0 to 100,100)
    const x = ((clientX - svgRect.left) / svgRect.width) * 100;
    const y = ((clientY - svgRect.top) / svgRect.height) * 100;
    
    return { x, y };
}

// Calculate angle in degrees from center point
function getAngleFromCoordinates(x: number, y: number): number {
    // Calculate angle from center (50,50)
    const deltaX = x - 50;
    const deltaY = y - 50;
    
    // Calculate angle in radians, then convert to degrees
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Adjust angle to start from top (0 degrees at 12 o'clock)
    angle = (angle + 90) % 360;
    if (angle < 0) angle += 360;
    
    return angle;
}

// Calculate percentage from angle
function getPercentageFromAngle(angle: number): number {
    return (angle / 360) * 100;
}

// Calculate distance between two points
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Handle start of drag (mouse or touch)
function handleDragStart(event: MouseEvent | TouchEvent): void {
    isDragging.value = true;
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
    
    // Process the initial position
    handleDragMove(event);
}

// Handle drag movement
function handleDragMove(event: MouseEvent | TouchEvent): void {
    if (!isDragging.value) return;
    
    // Prevent default to avoid scrolling while dragging on touch devices
    if (event.cancelable) {
        event.preventDefault();
    }
    
    // Get client coordinates from either mouse or touch event
    const clientX = 'touches' in event 
        ? event.touches[0].clientX 
        : (event as MouseEvent).clientX;
    const clientY = 'touches' in event 
        ? event.touches[0].clientY 
        : (event as MouseEvent).clientY;
    
    // Convert to clock coordinates
    const { x, y } = getClockCoordinates(clientX, clientY);
    
    // Calculate distance from center
    const distanceFromCenter = getDistance(x, y, 50, 50);    // Only process if within or near the clock radius
    if (distanceFromCenter <= 50) {
        // We only check if we're hovering over any event dots
        checkEventHits(x, y);
    }
}

// Check if dragging over any event dots
function checkEventHits(x: number, y: number): void {
    // Skip if no events
    if (!eventPositions.value || eventPositions.value.length === 0) return;
    
    // Find event closest to current drag position
    let closestEvent = -1;
    let closestDistance = Infinity;
    
    eventPositions.value.forEach(position => {
        const distance = getDistance(x, y, position.x, position.y);
        
        // If within hit radius and closer than previous closest
        if (distance <= dragHitRadius && distance < closestDistance) {
            closestDistance = distance;
            closestEvent = position.index;
        }
    });
    
    // If we found an event and it's different from the last one we hovered over
    if (closestEvent >= 0 && closestEvent !== lastHoveredEventIndex.value) {
        lastHoveredEventIndex.value = closestEvent;
        // The navigateToEvent function will handle updating the progress
        navigateToEvent(closestEvent);
    }
}

// Handle end of drag
function handleDragEnd(): void {
    isDragging.value = false;
    lastHoveredEventIndex.value = -1;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
}
</script>

<template>
    <div class="h-full w-full flex flex-col justify-center items-center gap-4">
        <!-- Empty state message when there are no events -->
        <div v-if="!events || events.length === 0"
            class="w-full h-[200px] flex items-center justify-center text-white/60 italic border border-dashed border-white/20 rounded-lg">
            <p>No events available</p>
        </div>        <div v-else ref="clockContainer" class="relative mx-auto"
            :style="{ width: `${clockSize}px`, height: `${clockSize}px` }">            <svg class="w-full h-full" :class="{ 'dragging': isDragging }" viewBox="0 0 100 100"
                @mousedown="handleDragStart"
                @touchstart="handleDragStart">
                <!-- Define gradients -->
                <defs>
                    <radialGradient id="clockGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.2" />
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
                    </radialGradient>
                </defs>                <!-- Clock outline and background -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                <circle cx="50" cy="50" r="42.5" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
                <circle cx="50" cy="50" r="41" fill="url(#clockGradient)" fill-opacity="0.1" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"
                    stroke-dasharray="1,1.5" />
                
                <!-- Transparent interaction layer for better touch detection -->
                <circle cx="50" cy="50" r="45" fill="transparent" class="cursor-pointer" />

                <!-- Hour markers -->
                <line v-for="marker in hourMarkers" :key="marker.hour" :x1="marker.x1" :y1="marker.y1" :x2="marker.x2"
                    :y2="marker.y2" stroke="rgba(255,255,255,0.5)" stroke-width="1" />

                <!-- Progress track background -->
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3.5"
                    stroke-linecap="round" />

                <!-- Event tick marks -->
                <line v-for="position in eventPositions" :key="'tick-' + position.index"
                    :x1="50 + Math.cos((position.angle - 90) * (Math.PI / 180)) * 38"
                    :y1="50 + Math.sin((position.angle - 90) * (Math.PI / 180)) * 38"
                    :x2="50 + Math.cos((position.angle - 90) * (Math.PI / 180)) * 42"
                    :y2="50 + Math.sin((position.angle - 90) * (Math.PI / 180)) * 42" stroke="rgba(255,255,255,0.4)"
                    stroke-width="1" />
                <!-- Percentage arc -->
                <circle cx="50" cy="50" r="40" stroke="#4299e1" stroke-width="3" fill="none"
                    :stroke-dasharray="strokeDasharray" :stroke-dashoffset="strokeDashoffset"
                    transform="rotate(-90, 50, 50)" class="stroke-blue-500 drop-shadow-arc rounded-full" />

                <!-- Clock icon -->
                <foreignObject x="42" y="24" width="16" height="16">
                    <Clock class="w-4 h-4 text-white opacity-70" />
                </foreignObject>

                <!-- Current time and event info -->
                <text x="50" y="50" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
                    {{ eventPositions[currentIndex || 0]?.formattedTime || '00:00' }}
                </text>
                <text x="50" y="60" text-anchor="middle" fill="white" font-size="6" opacity="0.7">
                    Event {{ (currentIndex || 0) + 1 }} of {{ events?.length || 0 }}
                </text>

                <!-- Inactive event dots -->
                <g v-for="position in eventPositions.filter(p => !p.isActive)" :key="position.index">
                    <circle :cx="position.x" :cy="position.y" r="3" :fill="getEventTypeColor(position.event.type)"
                        class="cursor-pointer transition-all duration-200 ease-in-out hover:brightness-[1.3]"
                        @click="navigateToEvent(position.index)" />
                    <title>{{ position.event.eventName }} - {{ position.formattedTime }}</title>
                </g>                <!-- Active event dots -->
                <g v-for="position in eventPositions.filter(p => p.isActive)" :key="'active-' + position.index">
                    <!-- Outer highlight -->
                    <circle :cx="position.x" :cy="position.y" r="6" :fill="getEventTypeColor(position.event.type)"
                        class="animate-pulse" opacity="0.3" />
                    <!-- Event dot -->
                    <circle :cx="position.x" :cy="position.y" r="4" :fill="getEventTypeColor(position.event.type)"
                        class="cursor-pointer stroke-white stroke-1 brightness-[1.2] drop-shadow-event"
                        @click="navigateToEvent(position.index)" />
                    <title>{{ position.event.eventName }} - {{ position.formattedTime }}</title>
                </g>
            </svg>
        </div>
    </div>
</template>

<style scoped>
/* Add transitions where Tailwind doesn't cover */
circle {
    transition: stroke 0.3s ease;
}

/* Add smooth transitions when clock size changes */
.relative.mx-auto {
    transition: width 0.3s ease, height 0.3s ease;
}

/* Better browser compatibility for some SVG properties */
.stroke-1 {
    stroke-width: 1;
}

.rounded-full {
    stroke-linecap: round;
}

/* Change cursor to grabbing when dragging */
svg.dragging {
    cursor: grabbing !important;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import type { Operation, OperationEvent } from '@/types';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import { useRouter } from 'vue-router';
import LoadingComponent from '@/components/LoadingComponent.vue';
import PersonIcon from '@/components/icons/person.vue';
import ClockNavigation from '@/components/ClockNavigation.vue';

const router = useRouter();

const props = defineProps({
    id: { type: String, required: true }
})

const operationInfo = ref<Operation | null>(null);
const currentScene = ref(0);
const showClickToContinue = ref(false);
const isPlaying = ref(false);
const allowDisturbingContent = ref(false);
const showTemporaryViewOption = ref(false);
const temporaryViewActive = ref(false);
const timerProgress = ref(0);
const showTimer = ref(false);
const isFadingOut = ref(false);
let timerInterval: number | null = null;

// Time transition animation state
const timeTransitionProgress = ref(0);
const displayedTime = ref('');
const timeTransitionCurrentEventIndex = ref(-1);
const isClockFadingOut = ref(false);
let timeTransitionInterval: number | null = null;

// Surgical team data
const surgicalTeam = [
    { name: 'Dr. G Sutherland', title: 'Lead Surgeon' },
    { name: 'Dr. C Veilleux', title: 'Assistant Surgeon' },
];

// Scene definitions for the cinematic experience
const scenes = computed(() => {
    if (!operationInfo.value) return [];
    
    const hasDisturbingContent = operationInfo.value.events.some(event => event.contentWarning);
    
    const baseScenes = [
        {
            type: 'content-warning',
            title: 'Content Advisory',
            subtitle: 'Important information about this journey',
            content: hasDisturbingContent 
                ? 'This journey contains medical content that some viewers may find disturbing, including surgical footage and procedures. You can choose to view all content or skip disturbing scenes.'
                : 'This journey contains medical content. Choose how you would like to experience your surgical story.',
            duration: 6000 // Longer duration for reading and decision
        }
    ];

    // Add the rest of the scenes
    baseScenes.push(
        createTextScene(
            'operation-intro',
            operationInfo.value.procedure,
            new Date(operationInfo.value.starttime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            operationInfo.value.description
        ),
        createTextScene(
            'team-intro',
            'Your Surgical Team',
            'World-class experts in your care',
            '' // Empty content since we'll display surgeons list directly
        )
    );

    // Add events with time transitions between them
    operationInfo.value.events.forEach((event, index) => {
        // Add time transition before each event
        if (index === 0) {
            // For the first event, transition from operation start time to first event time
            const timeTransition = {
                type: 'time-transition',
                title: '',
                subtitle: new Date(event.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                content: '',
                duration: 3000,
                fromEventIndex: -1,
                toEventIndex: index,
                fromTime: operationInfo.value!.starttime,
                toTime: event.timestamp
            };
            baseScenes.push(timeTransition);
        } else {
            // For subsequent events, transition from previous event to current event
            const previousEvent = operationInfo.value!.events[index - 1];
            const timeTransition = {
                type: 'time-transition',
                title: '',
                subtitle: new Date(event.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                content: '',
                duration: 3000,
                fromEventIndex: index - 1,
                toEventIndex: index,
                fromTime: previousEvent.timestamp,
                toTime: event.timestamp
            };
            baseScenes.push(timeTransition);
        }

        // Add the actual event
        baseScenes.push({
            type: 'event' as const,
            title: event.eventName,
            subtitle: new Date(event.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            content: event.description || '',
            event: event,
            eventIndex: index,
            duration: getEventDuration(event)
        } as any);
    });

    // Add conclusion
    baseScenes.push({
        type: 'conclusion',
        title: 'Journey Complete',
        subtitle: 'Your surgical story has been told',
        content: `Duration: ${formatHoursToHrsMins(operationInfo.value.duration)} | Events: ${operationInfo.value.events.length}`,
        duration: calculateReadingTime(
            'Journey Complete',
            'Your surgical story has been told',
            `Duration: ${formatHoursToHrsMins(operationInfo.value.duration)} | Events: ${operationInfo.value.events.length}`
        )
    });

    return baseScenes;
});

// Computed property for current scene event data
const currentSceneEvent = computed(() => {
    const scene = scenes.value[currentScene.value];
    return scene && scene.type === 'event' && 'event' in scene ? scene.event as OperationEvent : null;
});

// Computed property to check if current scene has media
const currentSceneHasMedia = computed(() => {
    return currentSceneEvent.value && (currentSceneEvent.value.image || currentSceneEvent.value.video);
});

// Computed property to determine if progress bar should be shown (after content warning)
const showProgressBar = computed(() => {
    const currentSceneType = scenes.value[currentScene.value]?.type;
    return currentSceneType !== 'content-warning';
});

// Computed property to calculate progress including all scenes after content warning
const eventProgress = computed(() => {
    if (!operationInfo.value || scenes.value.length === 0) return 0;
    
    // Find the content warning scene index
    const contentWarningIndex = scenes.value.findIndex(scene => scene.type === 'content-warning');
    
    // If we're still on content warning, return 0
    if (currentScene.value <= contentWarningIndex) {
        return 0;
    }
    
    // Calculate progress based on all scenes after content warning
    const totalScenesAfterWarning = scenes.value.length - (contentWarningIndex + 1);
    const currentSceneAfterWarning = currentScene.value - contentWarningIndex;
    
    if (totalScenesAfterWarning === 0) return 100;
    
    return Math.round((currentSceneAfterWarning / totalScenesAfterWarning) * 100);
});

// Helper function to get event duration
const getEventDuration = (event: OperationEvent) => {
    return event.video || event.image ? 5000 : calculateReadingTime(
        event.eventName,
        new Date(event.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        event.description || ''
    );
};

// Helper function to create scene with calculated reading time
const createTextScene = (type: string, title: string, subtitle: string, content: string) => ({
    type,
    title,
    subtitle,
    content,
    duration: calculateReadingTime(title, subtitle, content)
});

// Calculate reading time based on text content
const calculateReadingTime = (title: string, subtitle: string, content: string | null) => {
    const wordsPerMinute = 200; // Average reading speed
    const minimumTime = 3000; // Minimum 3 seconds
    const maximumTime = 8000; // Maximum 8 seconds
    
    // Count total characters in all text
    const totalText = `${title} ${subtitle} ${content || ''}`;
    const characterCount = totalText.length;
    
    // Base time on character count (roughly 5 characters per word)
    const estimatedWords = characterCount / 5;
    const readingTimeMs = (estimatedWords / wordsPerMinute) * 60 * 1000;
    
    // Add extra time for processing and dramatic effect
    const dramaticMultiplier = 2.5;
    const calculatedTime = readingTimeMs * dramaticMultiplier;
    
    // Ensure it's within reasonable bounds
    return Math.max(minimumTime, Math.min(maximumTime, calculatedTime));
}

const loadOperation = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        operationInfo.value = operations[props.id];
    } catch (error) {
        // Operation loading failed
    }
}

function formatHoursToHrsMins(decimalHours: number) {
    const hours = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hours) * 60);
    
    if (mins === 0) return `${hours} hrs`;
    if (hours === 0) return `${mins} mins`;
    return `${hours} hrs ${mins} mins`;
}

// Timer functions for auto-advance countdown
const startTimer = (duration: number, callback: () => void) => {
    if (timerInterval) clearInterval(timerInterval);
    
    timerProgress.value = 0;
    showTimer.value = true;
    
    const startTime = Date.now();
    const updateInterval = 50; // Update every 50ms for smooth animation
    
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        timerProgress.value = progress * 100;
        
        if (progress >= 1) {
            clearInterval(timerInterval!);
            showTimer.value = false;
            timerProgress.value = 0;
            callback();
        }
    }, updateInterval);
}

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    showTimer.value = false;
    timerProgress.value = 0;
}

// Time transition animation functions
const startTimeTransition = (fromTime: string, toTime: string, fromEventIndex: number, toEventIndex: number) => {
    timeTransitionProgress.value = 0;
    timeTransitionCurrentEventIndex.value = fromEventIndex;
    isClockFadingOut.value = false;
    
    const startTimestamp = new Date(fromTime).getTime();
    const endTimestamp = new Date(toTime).getTime();
    const totalDuration = 2500; // Reduced from 4000 to 2500
    const animationDuration = 1000; // Reduced from 1500 to 1000
    const displayDuration = 1000; // Reduced from 1500 to 1000
    const fadeOutDuration = 500; // Reduced from 1000 to 500
    
    // Initialize with the starting time
    displayedTime.value = new Date(fromTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    
    const startAnimationTime = Date.now();
    
    timeTransitionInterval = setInterval(() => {
        const elapsed = Date.now() - startAnimationTime;
        
        if (elapsed < animationDuration) {
            // Clock animation phase - use easing function for smooth movement
            const animationProgress = elapsed / animationDuration;
            const easedProgress = easeInOutCubic(animationProgress);
            
            // Update progress for clock progress ring
            timeTransitionProgress.value = easedProgress * 100;
            
            // Calculate current timestamp with easing and update displayed time
            const currentTimestamp = startTimestamp + (endTimestamp - startTimestamp) * easedProgress;
            displayedTime.value = new Date(currentTimestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
        } else if (elapsed >= animationDuration && elapsed < animationDuration + displayDuration) {
            // Display phase - show the final target time
            if (displayedTime.value !== new Date(endTimestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            })) {
                displayedTime.value = new Date(endTimestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                });
            }
        } else if (elapsed >= animationDuration + displayDuration && elapsed < totalDuration) {
            // Fade-out phase
            if (!isClockFadingOut.value) {
                // Ensure we show the final target time when fade-out starts
                displayedTime.value = new Date(endTimestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                });
                
                isClockFadingOut.value = true;
                // Clear the interval immediately when fade-out starts to prevent reappearance
                clearInterval(timeTransitionInterval!);
                timeTransitionInterval = null;
                
                // Set a final timeout to complete the transition
                setTimeout(() => {
                    timeTransitionCurrentEventIndex.value = toEventIndex;
                    // Don't reset fade-out state here - let nextScene handle it
                    nextScene();
                }, fadeOutDuration);
            }
        } else if (elapsed >= totalDuration) {
            // Fallback - should not reach here if fade-out handled properly
            // Ensure we show the final target time
            displayedTime.value = new Date(endTimestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            
            timeTransitionCurrentEventIndex.value = toEventIndex;
            clearInterval(timeTransitionInterval!);
            timeTransitionInterval = null;
            // Don't reset fade-out state here - let nextScene handle it
            nextScene();
        }
    }, 16); // ~60fps for smooth animation
}

// Easing function for smooth clock hand movement
const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const stopTimeTransition = () => {
    if (timeTransitionInterval) {
        clearInterval(timeTransitionInterval);
        timeTransitionInterval = null;
    }
    timeTransitionProgress.value = 0;
    // Don't reset fade-out state here - let it complete naturally
}

const resetTimeTransitionState = () => {
    stopTimeTransition();
    isClockFadingOut.value = false;
}

const startJourney = () => {
    // Start the cinematic experience with a smooth transition
    isPlaying.value = true;
    currentScene.value = 0; // Start with the content warning scene
}

const setContentPreference = (allow: boolean) => {
    allowDisturbingContent.value = allow;
    nextScene(); // Continue to the next scene
}

const viewTemporarily = () => {
    temporaryViewActive.value = true;
    showTemporaryViewOption.value = false;
    showClickToContinue.value = true;
}

const nextScene = () => {
    // Stop any running timer but handle time transition carefully
    stopTimer();
    
    // Only reset time transition state if we're not currently fading out
    if (!isClockFadingOut.value) {
        stopTimeTransition();
    }
    
    if (currentScene.value < scenes.value.length - 1) {
        // Trigger fade-out animation
        isFadingOut.value = true;
        
        // First hide the continue button with fade animation
        showClickToContinue.value = false;
        showTemporaryViewOption.value = false;
        
        // Wait for the button fade-out and scene fade-out, then transition to next scene
        setTimeout(() => {
            // Reset temporary view state after fade out completes
            temporaryViewActive.value = false;
            isFadingOut.value = false;
            currentScene.value++;
            
            // Reset clock fade-out state when transitioning to a new scene
            isClockFadingOut.value = false;
            
            // Check for content warnings
            const scene = scenes.value[currentScene.value];
            if (scene.type === 'content-warning') {
                // Content warning slide should wait for user input, not auto-advance
                // The decision buttons will handle the transition
            } else if (scene.type === 'time-transition') {
                // Start time transition animation
                const transitionScene = scene as any;
                if (transitionScene.fromTime && transitionScene.toTime) {
                    startTimeTransition(
                        transitionScene.fromTime,
                        transitionScene.toTime,
                        transitionScene.fromEventIndex,
                        transitionScene.toEventIndex
                    );
                }
                // Time transition will handle its own completion and scene advancement
            } else if (scene.type === 'event' && 'event' in scene && (scene.event as OperationEvent)?.contentWarning && !allowDisturbingContent.value) {
                // For skipped content, show continue button immediately
                showClickToContinue.value = true;
            } else {
                // Calculate when animations actually complete instead of using scene duration
                
                if (currentSceneHasMedia.value) {
                    // For media scenes: media content finishes at 2.5s + 0.8s = 3.3s
                    setTimeout(() => {
                        showClickToContinue.value = true;
                    }, 3400); // 3.3s + 100ms buffer
                } else {
                    // For text scenes, wait for description animation to complete
                    if (scene.content && scene.type !== 'time-transition') {
                        // Has description: finishes at 1.8s + 0.8s = 2.6s
                        setTimeout(() => {
                            showClickToContinue.value = true;
                        }, 2700); // 2.6s + 100ms buffer
                    } else if (scene.type === 'team-intro') {
                        // Team intro: last surgeon finishes at 3.0s + 0.6s = 3.6s
                        setTimeout(() => {
                            showClickToContinue.value = true;
                        }, 3700); // 3.6s + 100ms buffer
                    } else {
                        // Only title and subtitle: subtitle finishes at 1.0s + 0.8s = 1.8s
                        setTimeout(() => {
                            showClickToContinue.value = true;
                        }, 1900); // 1.8s + 100ms buffer
                    }
                }
            }
        }, 400); // Reduced from 800 to 400
    } else {
        // Journey complete - trigger final fade-out
        isFadingOut.value = true;
        showClickToContinue.value = false;
        temporaryViewActive.value = false;
        setTimeout(() => {
            router.push(`/operation/${props.id}`);
        }, 400); // Reduced from 800 to 400
    }
}

const skipToEnd = () => {
    router.push(`/operation/${props.id}`);
}

// Helper function to calculate angle for clock hands
const getTimeAngle = (timeString: string, hand: 'hour' | 'minute'): number => {
    if (!timeString) return 0;
    
    // Parse time string (e.g., "14:30:45" or "2:30 PM")
    const time = new Date(`1970-01-01 ${timeString}`);
    
    if (isNaN(time.getTime())) {
        // Fallback for invalid time format
        return 0;
    }
    
    const hours = time.getHours() % 12; // Convert to 12-hour format
    const minutes = time.getMinutes();
    
    switch (hand) {
        case 'hour':
            // Hour hand moves 30 degrees per hour + additional degrees based on minutes
            return (hours * 30 + minutes * 0.5) * Math.PI / 180;
        case 'minute':
            // Minute hand moves 6 degrees per minute
            return minutes * 6 * Math.PI / 180;
        default:
            return 0;
    }
};

onMounted(() => {
    // Check if the requested operation is in the user's cases
    const userCases = users[state.user?.localAccountId as string].cases;
    if (!userCases.includes(props.id)) {
        router.push({ path: '/' });
    }
    
    loadOperation();
});

onUnmounted(() => {
    // Clean up timer when component unmounts
    stopTimer();
    resetTimeTransitionState();
});
</script>

<template>
    <div class="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-[9999]">
        <LoadingComponent :isLoading="operationInfo == null">
            <div v-if="operationInfo" class="relative w-full h-full">
                <!-- Universal Background Layer -->
                <div class="fixed inset-0 z-0 bg-transition" :class="!isPlaying ? 'bg-intro' : `bg-${scenes[currentScene]?.type || 'content-warning'}`">
                    <div class="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-transparent animate-pulse opacity-30"></div>
                    <!-- Universal Particles Background -->
                    <div class="particles"></div>
                </div>

                <!-- Skip Button -->
                <button 
                    @click="skipToEnd" 
                    class="fixed top-4 right-4 z-[10000] px-4 py-2 text-sm font-medium text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 hover:scale-105 transition-all duration-300"
                >
                    Skip Journey
                </button>

                <!-- Intro Screen -->
                <Transition name="intro-to-cinematic" mode="out-in">
                    <div v-if="!isPlaying" key="intro" class="intro-screen">
                        <div class="text-center relative z-10">
                            <h1 class="intro-title">{{ operationInfo.procedure }}</h1>
                            <p class="intro-subtitle">A Cinematic Journey Through Your Surgery</p>
                            <button @click="startJourney" class="start-btn">
                                <span class="relative z-10">Start Your Journey</span>
                                <div class="btn-glow"></div>
                            </button>
                        </div>
                    </div>

                    <!-- Main Cinematic Experience -->
                    <div v-else key="cinematic" class="relative w-full h-full z-[9999]">
                        <!-- Progress Bar at Bottom (only show after content warning) -->
                        <div v-if="showProgressBar" class="fixed bottom-0 left-0 w-full z-[10000] bg-black/30 backdrop-blur-sm">
                            <div class="relative w-full h-3 bg-white/20">
                                <div 
                                    class="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500 ease-out shadow-lg" 
                                    :style="{ width: `${eventProgress}%` }"
                                ></div>
                                <!-- Percentage Text -->
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-white text-xs font-medium drop-shadow-lg">
                                        {{ eventProgress }}%
                                    </span>
                                </div>
                            </div>
                        </div>

                    <!-- Circular Timer (Top Left) -->
                    <Transition name="timer">
                        <div v-if="showTimer" class="fixed top-4 left-4 z-[10000] w-8 h-8">
                            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                                <!-- Background circle -->
                                <circle 
                                    cx="16" 
                                    cy="16" 
                                    r="14" 
                                    fill="none" 
                                    stroke="rgba(255, 255, 255, 0.2)" 
                                    stroke-width="2"
                                />
                                <!-- Progress circle -->
                                <circle 
                                    cx="16" 
                                    cy="16" 
                                    r="14" 
                                    fill="none" 
                                    stroke="rgba(79, 172, 254, 0.8)" 
                                    stroke-width="2" 
                                    stroke-linecap="round"
                                    :stroke-dasharray="87.96"
                                    :stroke-dashoffset="87.96 - (87.96 * timerProgress / 100)"
                                    class="transition-all duration-75 ease-linear"
                                />
                            </svg>
                        </div>
                    </Transition>
                    <!-- Content Warning Overlay -->
                    <Transition name="warning">
                        <div v-if="showTemporaryViewOption" class="fixed inset-0 z-[10001] flex items-center justify-center bg-gray-900 bg-opacity-95">
                            <div class="text-center text-white max-w-md mx-4 p-8 bg-gray-800 rounded-2xl border border-gray-600">
                                <div class="mb-6">
                                    <h2 class="text-2xl font-bold mb-4">⚠️ Medical Content</h2>
                                    <p class="text-gray-300">This content contains surgical footage that may be disturbing.</p>
                                </div>
                                <div class="space-y-3">
                                    <button 
                                        @click="viewTemporarily"
                                        class="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-300"
                                    >
                                        View This Scene
                                    </button>
                                    <button 
                                        @click="nextScene"
                                        class="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-300"
                                    >
                                        Skip This Scene
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition>

                    <!-- Scene Content -->
                    <Transition name="scene" mode="out-in" :key="currentScene">
                        <div v-if="scenes[currentScene]" class="relative w-full h-full flex flex-col items-center justify-center text-center" :class="[`scene-${scenes[currentScene].type}`, scenes[currentScene].type === 'content-warning' ? '' : 'p-8 pt-12']">
                            <!-- Scene Content -->
                            <div class="relative z-[9999] max-w-6xl w-full h-full flex flex-col" 
                                 :class="{ 
                                     'scene-fade-out': isFadingOut,
                                     'justify-center items-center': !currentSceneEvent || (!currentSceneEvent.image && !currentSceneEvent.video)
                                 }">
                                <!-- Main Content Area -->
                                <div class="flex-grow flex flex-col justify-center items-center" :class="scenes[currentScene].type === 'content-warning' ? 'min-h-screen' : 'overflow-y-auto'">
                                    <!-- Title with dramatic entrance -->
                                    <h1 v-if="scenes[currentScene].type !== 'content-warning' && scenes[currentScene].type !== 'time-transition'" class="scene-title text-white font-bold mb-4" :class="{ 'animate-title': isPlaying }">
                                        {{ scenes[currentScene].title }}
                                    </h1>
                                    
                                    <!-- Subtitle -->
                                    <p v-if="scenes[currentScene].type !== 'content-warning' && scenes[currentScene].type !== 'time-transition'" class="scene-subtitle text-gray-400 mb-6" :class="{ 'animate-subtitle': isPlaying }">
                                        {{ scenes[currentScene].subtitle }}
                                    </p>
                                    
                                    <!-- Description -->
                                    <p v-if="scenes[currentScene].content && scenes[currentScene].type !== 'content-warning' && scenes[currentScene].type !== 'time-transition'" class="scene-description text-gray-200 leading-relaxed mb-8 max-w-4xl mx-auto" :class="{ 'animate-description': isPlaying }">
                                        {{ scenes[currentScene].content }}
                                    </p>

                                    <!-- Surgical Team List -->
                                    <div v-if="scenes[currentScene].type === 'team-intro'" class="surgical-team-list max-w-3xl mx-auto" :class="{ 'animate-team-list': isPlaying }">
                                        <div class="grid gap-4 sm:gap-6">
                                            <div 
                                                v-for="(surgeon, index) in surgicalTeam" 
                                                :key="surgeon.name"
                                                class="flex items-center space-x-4 p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/8 transition-all duration-300"
                                                :class="{ [`animate-surgeon-${index}`]: isPlaying }"
                                            >
                                                <div class="flex-shrink-0">
                                                    <PersonIcon class="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                                                </div>
                                                <div class="flex-grow">
                                                    <h3 class="text-white font-bold text-xl sm:text-2xl mb-1">{{ surgeon.name }}</h3>
                                                    <p class="text-gray-300 text-base sm:text-lg">{{ surgeon.title }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>                    <!-- Time Transition Visual -->
                    <div v-if="scenes[currentScene].type === 'time-transition'" class="flex flex-col items-center justify-center w-full h-full" :class="{ 'clock-fade-out': isClockFadingOut }">
                        <!-- Enhanced Time Display -->
                        <div class="text-center mb-8">
                            <div class="text-6xl font-bold text-blue-300 mb-4 animate-fadeInUp" style="animation-delay: 0.2s;">
                                {{ displayedTime || scenes[currentScene].subtitle }}
                            </div>
                        </div>
                        
                        <!-- Custom Clock Face -->
                        <div class="relative w-80 h-80 animate-fadeInUp" style="animation-delay: 0.4s;">
                                            <svg class="w-full h-full" viewBox="0 0 200 200">
                                                <!-- Outer ring -->
                                                <circle 
                                                    cx="100" 
                                                    cy="100" 
                                                    r="95" 
                                                    fill="none" 
                                                    stroke="rgba(255, 255, 255, 0.3)" 
                                                    stroke-width="2"
                                                />
                                                
                                                <!-- Inner circle -->
                                                <circle 
                                                    cx="100" 
                                                    cy="100" 
                                                    r="85" 
                                                    fill="rgba(0, 0, 0, 0.2)" 
                                                    stroke="rgba(255, 255, 255, 0.2)" 
                                                    stroke-width="1"
                                                />
                                                
                                                <!-- Hour markers -->
                                                <g v-for="hour in 12" :key="hour">
                                                    <line 
                                                        :x1="100 + 75 * Math.sin((hour * 30) * Math.PI / 180)"
                                                        :y1="100 - 75 * Math.cos((hour * 30) * Math.PI / 180)"
                                                        :x2="100 + 85 * Math.sin((hour * 30) * Math.PI / 180)"
                                                        :y2="100 - 85 * Math.cos((hour * 30) * Math.PI / 180)"
                                                        stroke="rgba(255, 255, 255, 0.6)"
                                                        stroke-width="2"
                                                    />
                                                </g>
                                                
                                                <!-- Minute markers -->
                                                <g v-for="minute in 60" :key="minute">
                                                    <line 
                                                        v-if="minute % 5 !== 0"
                                                        :x1="100 + 80 * Math.sin((minute * 6) * Math.PI / 180)"
                                                        :y1="100 - 80 * Math.cos((minute * 6) * Math.PI / 180)"
                                                        :x2="100 + 85 * Math.sin((minute * 6) * Math.PI / 180)"
                                                        :y2="100 - 85 * Math.cos((minute * 6) * Math.PI / 180)"
                                                        stroke="rgba(255, 255, 255, 0.3)"
                                                        stroke-width="1"
                                                    />
                                                </g>
                                                
                                                <!-- Hour hand -->
                                                <line 
                                                    x1="100" 
                                                    y1="100"
                                                    :x2="100 + 50 * Math.sin(getTimeAngle(displayedTime, 'hour'))"
                                                    :y2="100 - 50 * Math.cos(getTimeAngle(displayedTime, 'hour'))"
                                                    stroke="#60a5fa"
                                                    stroke-width="4"
                                                    stroke-linecap="round"
                                                    class="transition-all duration-1000 ease-out"
                                                />
                                                
                                                <!-- Minute hand -->
                                                <line 
                                                    x1="100" 
                                                    y1="100"
                                                    :x2="100 + 70 * Math.sin(getTimeAngle(displayedTime, 'minute'))"
                                                    :y2="100 - 70 * Math.cos(getTimeAngle(displayedTime, 'minute'))"
                                                    stroke="#3b82f6"
                                                    stroke-width="3"
                                                    stroke-linecap="round"
                                                    class="transition-all duration-1000 ease-out"
                                                />
                                                
                                                <!-- Center dot -->
                                                <circle 
                                                    cx="100" 
                                                    cy="100" 
                                                    r="4" 
                                                    fill="#3b82f6"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    <!-- Content Warning Decision Buttons -->
                                    <div v-if="scenes[currentScene].type === 'content-warning'" class="absolute inset-0 flex items-center justify-center px-4 py-8 z-[10000]">
                                        <!-- Glass Card Container -->
                                        <div class="glass-card p-6 sm:p-8 rounded-2xl backdrop-blur-md bg-black/60 border border-white/20 shadow-2xl max-w-2xl w-full mx-auto">
                                            <!-- Title and Subtitle inside the card -->
                                            <h1 class="text-white font-bold mb-4 text-2xl sm:text-3xl md:text-4xl text-center">
                                                {{ scenes[currentScene].title }}
                                            </h1>
                                            <p class="text-gray-300 mb-6 text-base sm:text-lg text-center">
                                                {{ scenes[currentScene].subtitle }}
                                            </p>
                                            
                                            <div class="text-center mb-6">
                                                <div class="text-4xl sm:text-6xl mb-4">⚠️</div>
                                                <h3 class="text-xl sm:text-2xl font-semibold text-white mb-4">Choose Your Experience</h3>
                                                <p class="text-gray-200 text-base sm:text-lg mb-6 leading-relaxed">
                                                    {{ scenes[currentScene].content }}
                                                </p>
                                            </div>
                                            <div v-if="operationInfo && operationInfo.events.some(event => event.contentWarning)" class="flex flex-col sm:flex-row gap-4 w-full">
                                                <button 
                                                    @click="setContentPreference(true)"
                                                    class="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-blue-500/30"
                                                >
                                                    <div class="text-base sm:text-lg mb-1">Show All Content</div>
                                                    <div class="text-sm opacity-80">Include all surgical footage</div>
                                                </button>
                                                <button 
                                                    @click="setContentPreference(false)"
                                                    class="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gray-600/80 hover:bg-gray-700/80 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-500/30"
                                                >
                                                    <div class="text-base sm:text-lg mb-1">Skip Disturbing Content</div>
                                                    <div class="text-sm opacity-80">Option to view later</div>
                                                </button>
                                            </div>
                                            <div v-else class="flex justify-center w-full">
                                                <button 
                                                    @click="setContentPreference(true)"
                                                    class="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-blue-500/30"
                                                >
                                                    <div class="text-base sm:text-lg mb-1">Continue Your Journey</div>
                                                    <div class="text-sm opacity-80">Proceed to your surgical story</div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Media Content for Events -->
                                    <div v-if="currentSceneEvent && (allowDisturbingContent || !currentSceneEvent.contentWarning || temporaryViewActive)" class="media-content my-8 flex flex-col items-center flex-shrink min-h-0">
                                        <!-- Image -->
                                        <img 
                                            v-if="currentSceneEvent.image"
                                            :src="currentSceneEvent.image" 
                                            :alt="currentSceneEvent.eventName"
                                            class="my-4 rounded-2xl h-auto max-h-[50vh] min-h-0 object-contain flex-shrink"
                                        />
                                        
                                        <!-- Video -->
                                        <video 
                                            v-if="currentSceneEvent.video"
                                            :src="currentSceneEvent.video" 
                                            autoplay 
                                            muted 
                                            loop
                                            controls
                                            class="my-4 rounded-2xl h-auto max-h-[50vh] min-h-0 object-contain flex-shrink"
                                        ></video>
                                    </div>

                                    <!-- Content Skipped Message -->
                                    <div v-if="currentSceneEvent && currentSceneEvent.contentWarning && !allowDisturbingContent && !temporaryViewActive" class="media-content my-8 flex flex-col items-center flex-shrink-0">
                                        <div class="p-8 bg-gray-800 bg-opacity-60 rounded-xl backdrop-blur-md border border-gray-600 max-w-md text-center">
                                            <div class="text-4xl mb-4">🔒</div>
                                            <h3 class="text-xl font-semibold text-white mb-2">Content Skipped</h3>
                                            <p class="text-gray-300 mb-4">This scene contains medical content that you chose to skip.</p>
                                            <button 
                                                @click="viewTemporarily"
                                                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-300"
                                            >
                                                View This Scene
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Click to Continue Button -->
                                <div class="flex justify-center mt-8 flex-shrink-0 min-h-[80px]">
                                    <Transition name="continue-btn">
                                        <button 
                                            v-if="showClickToContinue"
                                            @click="nextScene" 
                                            class="frosted-glass-btn px-8 py-4 text-white/90 text-lg font-medium hover:text-white transition-all duration-300 cursor-pointer rounded-full"
                                        >
                                            <span v-if="currentScene < scenes.length - 1">Continue</span>
                                            <span v-else>Complete</span>
                                        </button>
                                    </Transition>
                                </div>


                            </div>
                        </div>
                    </Transition>
                    </div>
                </Transition>
            </div>
        </LoadingComponent>
    </div>
</template>

<style scoped>
/* CSS Custom Properties for animatable gradients */
@property --bg-color-1 {
  syntax: '<color>';
  initial-value: #1a1a2e;
  inherits: false;
}

@property --bg-color-2 {
  syntax: '<color>';
  initial-value: #0f0f0f;
  inherits: false;
}

@property --bg-color-3 {
  syntax: '<color>';
  initial-value: #1a1a2e;
  inherits: false;
}

@property --bg-color-4 {
  syntax: '<color>';
  initial-value: #0f0f0f;
  inherits: false;
}

/* Font family for consistency */
* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Intro Screen Styles */
.intro-screen {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.intro-title {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 700;
    background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    animation: titleGlow 3s ease-in-out infinite alternate;
}

.intro-subtitle {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    color: #a0a0a0;
    margin-bottom: 3rem;
    opacity: 0;
    animation: fadeInUp 1s ease-out 0.5s forwards;
}

.start-btn {
    position: relative;
    padding: 1rem 2.5rem;
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50px;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeInUp 1s ease-out 1s forwards;
}

.start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
}

.start-btn:hover .btn-glow {
    left: 100%;
}

/* Particles Background */
.particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.1), transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.05), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.1), transparent);
    background-repeat: repeat;
    background-size: 100px 100px;
    animation: particles 20s linear infinite;
}

/* Background Effects with Animatable Gradients */
.bg-intro {
    --bg-color-1: #1a1a2e;
    --bg-color-2: #0f0f0f;
    --bg-color-3: #1a1a2e;
    --bg-color-4: #0f0f0f;
    background: radial-gradient(ellipse at center, var(--bg-color-1) 0%, var(--bg-color-2) 100%);
}

.bg-content-warning {
    --bg-color-1: #8b4513;
    --bg-color-2: #cd853f;
    --bg-color-3: #daa520;
    --bg-color-4: #8b4513;
    background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 30%, var(--bg-color-3) 70%, var(--bg-color-4) 100%);
}

.bg-operation-intro {
    --bg-color-1: #2c1810;
    --bg-color-2: #4a3120;
    --bg-color-3: #1a1a1a;
    --bg-color-4: #102c18;
    background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 30%, var(--bg-color-3) 70%, var(--bg-color-4) 100%);
}

.bg-team-intro {
    --bg-color-1: #1a1a2e;
    --bg-color-2: #2c2a4a;
    --bg-color-3: #16213e;
    --bg-color-4: #0f0f0f;
    background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 30%, var(--bg-color-3) 70%, var(--bg-color-4) 100%);
}

.bg-time-transition {
    --bg-color-1: #1a2332;
    --bg-color-2: #3b82f6;
    --bg-color-3: #1e3a8a;
    --bg-color-4: #0f1419;
    background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 30%, var(--bg-color-3) 70%, var(--bg-color-4) 100%);
}

.bg-event {
    --bg-color-1: #0f0f0f;
    --bg-color-2: #2a1a2a;
    --bg-color-3: #1a1a1a;
    --bg-color-4: #0f0f0f;
    background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 30%, var(--bg-color-3) 70%, var(--bg-color-4) 100%);
}

.bg-conclusion {
    --bg-color-1: #2a3441;
    --bg-color-2: #3b4a5a;
    --bg-color-3: #2d3e50;
    --bg-color-4: #1e2935;
    background: linear-gradient(135deg, var(--bg-color-1) 0%, var(--bg-color-2) 30%, var(--bg-color-3) 70%, var(--bg-color-4) 100%);
}

/* Glass Card Effect */
.glass-card {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(0, 0, 0, 0.25) !important;
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(40px) scale(0.9);
    animation: glassCardEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; /* Reduced from 1s to 0.6s */
}

@keyframes glassCardEnter {
    0% {
        opacity: 0;
        transform: translateY(40px) scale(0.9);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

.glass-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    bottom: 0;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

/* Scene Title Animations */
.scene-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    opacity: 0;
    transform: translateY(60px) scale(0.8);
}

.animate-title {
    animation: slideInFadeEnhanced 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; /* Reduced from 1.5s to 0.8s */
}

.scene-subtitle {
    font-size: clamp(1rem, 2vw, 1.5rem);
    opacity: 0;
    transform: translateY(40px) translateX(-20px);
}

.animate-subtitle {
    animation: slideInFadeEnhanced 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.0s forwards; /* Reduced delay from 2.0s to 1.0s */
}

.scene-description {
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    opacity: 0;
    transform: translateY(40px) translateX(20px);
}

.animate-description {
    animation: slideInFadeEnhanced 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.8s forwards; /* Reduced delay from 4.0s to 1.8s */
}

/* Media Content Animation */
.media-content {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
    animation: slideInFadeEnhanced 0.8s cubic-bezier(0.4, 0, 0.2, 1) 2.5s forwards; /* Reduced delay from 6.0s to 2.5s */
}

/* Surgical Team List Animation */
.surgical-team-list {
    opacity: 0;
    transform: translateY(40px);
}

.animate-team-list {
    animation: slideInFadeEnhanced 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.8s forwards; /* Reduced delay from 4.0s to 1.8s */
}

/* Individual surgeon animations with staggered delays */
.animate-surgeon-0 {
    opacity: 0;
    transform: translateX(-40px);
    animation: slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.2s forwards; /* Reduced duration and delay */
}

.animate-surgeon-1 {
    opacity: 0;
    transform: translateX(-40px);
    animation: slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.4s forwards; /* Reduced duration and delay */
}

.animate-surgeon-2 {
    opacity: 0;
    transform: translateX(-40px);
    animation: slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.6s forwards; /* Reduced duration and delay */
}

.animate-surgeon-3 {
    opacity: 0;
    transform: translateX(-40px);
    animation: slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.8s forwards; /* Reduced duration and delay */
}

.animate-surgeon-4 {
    opacity: 0;
    transform: translateX(-40px);
    animation: slideInFromLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) 3.0s forwards; /* Reduced duration and delay */
}

/* Fade out classes for dramatic scene endings */
.scene-fade-out .scene-title,
.scene-fade-out .scene-subtitle,
.scene-fade-out .scene-description,
.scene-fade-out .media-content,
.scene-fade-out .glass-card,
.scene-fade-out .surgical-team-list {
    animation: fadeOutDownEnhanced 0.8s ease-out forwards; /* Reduced from 1.2s to 0.8s */
    will-change: opacity, filter;
}

@keyframes fadeOutDownEnhanced {
    0% {
        opacity: 1;
        filter: blur(0px);
        transform: scale(1);
    }
    100% {
        opacity: 0;
        filter: blur(12px);
        transform: scale(1);
    }
}

/* Continue Button */
.continue-btn {
    position: absolute;
    bottom: 6rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 2rem;
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    z-index: 10000;
    transition: all 0.3s ease;
}

.continue-btn:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* Frosted Glass Button */
.frosted-glass-btn {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}

.frosted-glass-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
    );
    transition: left 0.5s;
}

.frosted-glass-btn:hover::before {
    left: 100%;
}

.frosted-glass-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 
        0 8px 16px rgba(0, 0, 0, 0.15),
        0 4px 6px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.frosted-glass-btn:active {
    transform: translateY(0);
    box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.1),
        0 2px 4px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.btn-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.2);
    border-radius: 50px;
    transform: translate(-50%, -50%) scale(0);
    animation: pulse 2s infinite;
}

/* Animations */
@keyframes titleGlow {
    0% { text-shadow: 0 0 20px rgba(79, 172, 254, 0.5); }
    100% { text-shadow: 0 0 30px rgba(79, 172, 254, 0.8), 0 0 40px rgba(0, 242, 254, 0.3); }
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInFadeEnhanced {
    0% {
        opacity: 0;
        transform: translateY(40px) scale(0.9);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes slideInFromLeft {
    0% {
        opacity: 0;
        transform: translateX(-40px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes particles {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100px); }
}

@keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

/* Time Transition Animations */
.animate-fadeInUp {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease-out forwards;
}

/* Clock fade-out animation */
.clock-fade-out {
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.8s ease-in-out;
}

/* Staggered fade-in animations for time transition elements */
.animate-fadeInUp[style*="animation-delay: 0.2s"] {
    animation-delay: 0.2s;
}

.animate-fadeInUp[style*="animation-delay: 0.4s"] {
    animation-delay: 0.4s;
}

.animate-fadeInUp[style*="animation-delay: 0.6s"] {
    animation-delay: 0.6s;
}

/* Transitions */
.intro-to-cinematic-enter-active {
    transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.intro-to-cinematic-leave-active {
    transition: all 1.5s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.intro-to-cinematic-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
}

.intro-to-cinematic-leave-to {
    opacity: 0;
    transform: scale(1.1) translateY(-30px);
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 1.5s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.scene-enter-active {
    transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.scene-leave-active {
    transition: all 1.2s cubic-bezier(0.4, 0, 0.6, 1);
}

.scene-enter-from {
    opacity: 0;
    transform: translateX(300px) scale(0.8);
}

.scene-leave-to {
    opacity: 0;
    transform: translateX(-300px) scale(1.2);
}

/* Background transition effects with animatable custom properties */
.bg-transition {
    transition: 
        --bg-color-1 1.5s cubic-bezier(0.4, 0, 0.2, 1),
        --bg-color-2 1.5s cubic-bezier(0.4, 0, 0.2, 1),
        --bg-color-3 1.5s cubic-bezier(0.4, 0, 0.2, 1),
        --bg-color-4 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: --bg-color-1, --bg-color-2, --bg-color-3, --bg-color-4;
}

.bg-intro,
.bg-content-warning,
.bg-operation-intro,
.bg-team-intro,
.bg-event,
.bg-conclusion {
    transition: 
        --bg-color-1 1.5s cubic-bezier(0.4, 0, 0.2, 1),
        --bg-color-2 1.5s cubic-bezier(0.4, 0, 0.2, 1),
        --bg-color-3 1.5s cubic-bezier(0.4, 0, 0.2, 1),
        --bg-color-4 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.continue-btn-enter-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.continue-btn-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.6, 1);
}

.continue-btn-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
}

.continue-btn-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
}

.warning-enter-active, .warning-leave-active {
    transition: opacity 0.3s ease;
}

.warning-enter-from, .warning-leave-to {
    opacity: 0;
}

.timer-enter-active, .timer-leave-active {
    transition: all 0.3s ease;
}

.timer-enter-from, .timer-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
    .continue-btn {
        bottom: 4rem;
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
    }
}
</style>

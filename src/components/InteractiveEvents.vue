<script setup lang="ts">
import type { OperationEvent } from '@/types';
import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';
import Fancybox from '@/components/Fancybox.vue';
import { FancyBoxOptions } from '@/scripts/fancyboxConfig';
import Image from './icons/image.vue';
import VideoCamera from './icons/video-camera.vue';
import ClipboardPulse from './icons/clipboard-pulse.vue';
import Card from './Card.vue';

const props = defineProps<{
    events: OperationEvent[]
}>()

const container = ref()
const eventElements: Ref = ref({})
const inViewport = ref()
function checkInViewport() {
    const scrollProgress = container.value.scrollLeft / (container.value.scrollWidth - container.value.clientWidth);
    const eventCount = Object.keys(eventElements.value).length;
    var index = Math.round(mapRange(scrollProgress, 0, 1, 0, eventCount - 1));
    inViewport.value = Object.entries(eventElements.value)[index][0]
    
    // var threshold = 0;
    // for (const [key, value] of Object.entries(eventElements.value)) {
    //     const rect = (value as any).$el.getBoundingClientRect()
    //     // if (rect.left >= threshold && rect.right <= window.innerWidth - threshold) {
    //     //     // Check if the center of the event is more centered than the current inViewport event
    //     //     if (inViewport.value === undefined || Math.abs(rect.left - window.innerWidth / 2) < Math.abs((eventElements.value[inViewport.value].$el as HTMLElement).getBoundingClientRect().left - window.innerWidth / 2))
    //     //         inViewport.value = key
            
    //     //     // inViewport.value = key
    //     // }
    // }
    // console.log(centerPoints)
}

// Map range function
function mapRange(value: number, low1: number, high1: number, low2: number, high2: number) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

onMounted(() => {
    checkInViewport()
})

</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <div class="flex justify-between items-center w-full">
            <div v-for="event in events">
                <button class="flex flex-col justify-center items-center cursor-pointer p-2 border-1 border-black rounded-lg transition-border-color duration-300"
                :class="{ 'border-white': inViewport === event.eventId }"
                @click="(e) => { eventElements[event.eventId].$el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }) }">
                    <div>
                        <div v-if="event.image">
                            <Image />
                        </div>
                        <div v-else-if="event.video">
                            <VideoCamera />
                        </div>
                        <div v-else>
                            <ClipboardPulse />
                        </div>
                    </div>
                    <div>
                        {{
                            new Date(event.timestamp).getHours() + ":" +
                            new Date(event.timestamp).getMinutes().toString().padStart(2, '0')
                        }}
                    </div>
                </button>
            </div>
        </div>
        <div id="container" ref="container" @scroll="checkInViewport()" @wheel="(e) => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY; }"
            class="relative overflow-hidden h-full w-full flex gap-4 overflow-x-auto">
            <div class="flex fixed left-0 h-[inherit] w-30 z-10 pointer-events-none
            bg-gradient-to-r from-black to-transparent"></div>
            <div class="flex fixed right-0 h-[inherit] w-30 z-10 pointer-events-none
            bg-gradient-to-l from-black to-transparent"></div>
            <div class="aspect-square w-30"></div>
            <div v-for="event in events" class="aspect-square">
                <Card class="border-1 border-black transition-border-color duration-300" :class="{ 'border-white': inViewport === event.eventId }" :ref="(el) => { eventElements[event.eventId] = el }">
                    <template #title>
                        <div class="flex items-center gap-4 text-lg">
                            <div id="eventIcon">
                                <div v-if="event.image">
                                    <Image />
                                </div>
                                <div v-else-if="event.video">
                                    <VideoCamera />
                                </div>
                                <div v-else>
                                    <ClipboardPulse />
                                </div>
                            </div>
                            <div id="eventName" class="overflow-hidden pr-4">{{ event.eventName }}</div>
                        </div>
                    </template>
                    <template #content>
                        <div class="h-full flex flex-col gap-4 items-center justify-center">
                            <div class="select-none sm:w-1/2" v-if="event.image">
                                <Fancybox :options="FancyBoxOptions">
                                    <a data-fancybox="gallery" :data-download-src="event.image" :href="event.image">
                                        <img class="border-white border-2 rounded-lg" :src="event.image">
                                    </a>
                                </Fancybox>
                            </div>
                            <div v-if="event.video" class="select-none sm:w-1/2">
                                <div class="relative">
                                    <Fancybox :options="FancyBoxOptions">
                                        <a data-fancybox="gallery" :data-download-src="event.video" :href="event.video">
                                            <img class="border-white border-2 rounded-lg"
                                                src="/src/assets/Graphic-Content.svg">
                                        </a>
                                    </Fancybox>
                                </div>
                                <div class="flex w-full pt-4 items-center gap-1">
                                    <img class="object-scale-down" height="40px" width="40px"
                                        src="/src/assets/smartforceps.png">
                                    <p v-if="event.forceaverage">Video average force: {{ event.forceaverage }} N</p>
                                </div>
                            </div>
                            <div>
                                <p class="pb-4">{{ event.description }}</p>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
            <div class="aspect-square w-30"></div>
        </div>

    </div>
</template>

<style scoped></style>
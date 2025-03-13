<script setup lang="ts">
import { ref, watch } from 'vue';
import type { OperationEvent } from '../types';
import Fancybox from '@/components/Fancybox.vue';
import { FancyBoxOptions } from '@/scripts/fancyboxConfig';
import Image from './icons/image.vue';
import VideoCamera from './icons/video-camera.vue';
import ClipboardPulse from './icons/clipboard-pulse.vue';
import PlusCircle from './icons/plus-circle.vue';
import DashCircle from './icons/dash-circle.vue';

const props = defineProps<{ 
    event: OperationEvent,
    collapse?: boolean | undefined,
}>()
const eventElement = ref()
const eventBody = ref()
const collapsed = ref(false)

watch(() => props.collapse, (value) => {
    if(value !== undefined)
        collapsed.value = value
})
</script>

<template>
    <div id="event" ref="eventElement" :class="{'WithBackground': !collapsed}" class="p-2 mb-3 text-xl">
        <div id="eventHeader" @click="collapsed = !collapsed" class="flex justify-between items-center">
            <div class="flex items-center gap-4">
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
            <div id="collapseButton" class="relative">
                <div v-if="collapsed">
                    <PlusCircle />
                </div>
                <div v-else>
                    <DashCircle />
                </div>
            </div>
        </div>
        <div id="eventBody" ref="eventBody" :class="{'Collapsed': collapsed}">
            <div class="overflow-hidden">
                <div class="px-1 py-2">
                    <hr>
                    <p class="pb-4">{{ event.description }}</p>
                    <div class="m-auto select-none sm:w-1/2" v-if="event.image">
                        <Fancybox :options="FancyBoxOptions">
                            <a data-fancybox="gallery" :data-download-src="event.image" :href="event.image">
                                <img class="border-white border-2 rounded-lg" :src="event.image">
                            </a>
                        </Fancybox>
                    </div>
                    <div v-if="event.video" class="m-auto select-none sm:w-1/2">
                        <div class="relative h-full">
                            <Fancybox :options="FancyBoxOptions">
                                <a data-fancybox="gallery" :data-download-src="event.video" :href="event.video">
                                    <img class="border-white border-2 rounded-lg" src="/src/assets/Graphic-Content.svg">
                                </a>
                            </Fancybox>
                        </div>
                        <div class="flex w-full pt-4 items-center gap-1">
                            <img class="object-scale-down" height="40px" width="40px"
                                src="/src/assets/smartforceps.png">
                            <p v-if="event.forceaverage">Video average force: {{ event.forceaverage }} N</p>
                        </div>
                    </div>
                </div>
                <p class="float-right">
                    {{
                        new Date(event.timestamp).getHours() + ":" +
                        new Date(event.timestamp).getMinutes().toString().padStart(2, '0')
                    }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
#event {
    position: relative;
    background-color: #1C1C1C;
    border-radius: 10px;
}

#event::before {
    display: block;
    position: absolute;
    height: 100%;
    width: 100%;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(50% 90% at 100% 100%, #2C1C28 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , radial-gradient(50% 90% at 0% -1.92%, #172E29 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , #1C1C1C;
    border-radius: 10px;
    transition: opacity 0.5s linear;
    opacity: 0;
}

#event.WithBackground::before {
    opacity: 1;
}

#collapseButton:before {
    content: '';
    position: absolute;
    width: 16px;
    height: calc(100% + 2px);
    left: -16px;
    background: linear-gradient(to right, rgba(28, 28, 28, 0) 0%, rgba(28, 28, 28, 1) 50%);

}

#eventBody {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 0.5s ease-out;
}

#eventHeader {
    position: inherit;
    z-index: 0;
}

#eventBody {
    position: inherit;
    z-index: 1;
}

#eventBody.Collapsed {
    grid-template-rows: 0fr;
}

hr {
    margin-bottom: 1em;
    border-color: #8D9592;
}

/* img, video {
    width: 75%;
    margin:auto;
} */
</style>
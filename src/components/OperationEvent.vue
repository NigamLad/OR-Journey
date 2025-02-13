<script setup lang="ts">
import { ref } from 'vue';
import type { OperationEvent } from '../types'

const props = defineProps<{ event: OperationEvent }>()
const baseURL = new URL(import.meta.url).origin;
const eventElement = ref()
const eventBody = ref()
const collapsed = ref(true)
function toggleCollapse() {
    collapsed.value = !collapsed.value

    if (collapsed.value) {
        eventBody.value.classList.add("Collapsed")
        eventElement.value.classList.remove("WithBackground")
    } else {
        eventBody.value.classList.remove("Collapsed")
        eventElement.value.classList.add("WithBackground")
    }
}

</script>

<template>

    <div id="event" ref="eventElement" @click="toggleCollapse" class="p-2 mb-3 text-xl">
        <div id="eventHeader" class="flex justify-between items-center">
            <div id="eventName" class="overflow-hidden pr-4">{{ event.eventName }}</div>
            <div id="collapseButton" class="relative">
                <svg v-if="collapsed" width="20" height="20" viewBox="0 0 20 20" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M10 18.75C5.16751 18.75 1.25 14.8325 1.25 10C1.25 5.16751 5.16751 1.25 10 1.25C14.8325 1.25 18.75 5.16751 18.75 10C18.75 14.8325 14.8325 18.75 10 18.75ZM10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
                        fill="#8D9592" />
                    <path
                        d="M10 5C10.3452 5 10.625 5.27982 10.625 5.625V9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H10.625V14.375C10.625 14.7202 10.3452 15 10 15C9.65482 15 9.375 14.7202 9.375 14.375V10.625H5.625C5.27982 10.625 5 10.3452 5 10C5 9.65482 5.27982 9.375 5.625 9.375H9.375V5.625C9.375 5.27982 9.65482 5 10 5Z"
                        fill="#8D9592" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M10 18.75C5.16751 18.75 1.25 14.8325 1.25 10C1.25 5.16751 5.16751 1.25 10 1.25C14.8325 1.25 18.75 5.16751 18.75 10C18.75 14.8325 14.8325 18.75 10 18.75ZM10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
                        fill="#8D9592" />
                    <path
                        d="M5 10C5 9.65482 5.27982 9.375 5.625 9.375H14.375C14.7202 9.375 15 9.65482 15 10C15 10.3452 14.7202 10.625 14.375 10.625H5.625C5.27982 10.625 5 10.3452 5 10Z"
                        fill="#8D9592" />
                </svg>
            </div>
        </div>
        <div ref="eventBody" id="eventBody" class="Collapsed" @click.stop>
            <div class="overflow-hidden">
                <div class="px-1 py-2">
                    <hr>
                    <p class="pb-4">{{ event.description }}</p>
                    <img class="border-white border-2 rounded-lg" v-if="event.image" :src="event.image">
                    <div v-if="event.video" class=" flex flex-col">
                        <div class="relative h-full">
                            <div class="flex flex-col justify-center items-center backdrop-blur-lg absolute w-full h-full z-10 cursor-default" @click.self="(e) => {(e.target as HTMLElement)?.classList.add('hidden')}">
                                Graphic Content
                                <br>
                                Click to Show
                            </div>
                            <video class="border-white border-2 rounded-lg" controls muted>
                                <source :src="event.video">
                            </video>
                        </div>
                        <div class="flex pt-4 items-center gap-1">
                            <img class="object-scale-down" height="40px" width="40px" src="/src/assets/smartforceps.png">
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
    z-index: 1;
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
    z-index: -1;
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
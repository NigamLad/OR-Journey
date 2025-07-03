<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { state } from '@/config/msalConfig';
import { users, operations } from '@/scripts/simulatedDB';
import type { Operation } from '@/types';
import Fancybox from '@/components/Fancybox.vue';
import { FancyBoxOptions } from '@/scripts/fancyboxConfig';
import Image from '@/components/icons/image.vue';
import VideoCamera from '@/components/icons/video-camera.vue';

const baseURL = new URL(import.meta.url).origin;

const operationMedia = ref<Array<any> | null>(null);
const loadMedia = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        var user: string = state.user?.localAccountId as string;
        var user_operations: Array<Operation> = users[user].cases.map((a: any) => operations[a])
        user_operations.sort((a: any, b: any) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime());
        operationMedia.value = user_operations;

    } catch (error) {
        console.log("Failed to load case")
        console.log(error)
    }
}

onMounted(() => {
    loadMedia();
});
</script>

<template>
    <div class="p-4 overflow-x-hidden h-full touch-pan-y">
        <LoadingComponent :isLoading="operationMedia == null">
            <div class="flex flex-col gap-4">
                <div v-for="operation in operationMedia" class="pb-4">
                    <div class="text-xl">
                        {{ new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', }).format(new
                            Date(operation.starttime)) }}
                    </div>
                    <div>
                        {{ operation.procedure }}
                    </div>
                    <br>
                    <Fancybox :options="FancyBoxOptions">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                            <div v-for="event in operation.events.filter((e: Object) => (e.hasOwnProperty('image') || e.hasOwnProperty('video')))"
                                class="flex flex-col m-2 p-4 border-white border rounded-lg"
                                :class="{ 'col-span-2': event.hasOwnProperty('video'), 'sm:col-span-1': event.hasOwnProperty('video') }">
                                <div v-if="event.hasOwnProperty('image')" class="flex flex-col justify-between gap-2">
                                    <Image />
                                    <a data-fancybox="gallery" :data-download-src="event.image" :href="event.image">
                                        <img :src="event.image">
                                    </a>
                                </div>
                                <div v-else-if="event.hasOwnProperty('video')" class="flex flex-col gap-2 relative">
                                    <VideoCamera />
                                    <a data-fancybox="gallery" :data-download-src="event.video" :href="event.video">
                                        <img class="border-white border-2 rounded-lg" src="/src/assets/Graphic-Content.svg">
                                    </a>
                                </div>
                                <div class="pt-4">{{ event.description }}</div>
                            </div>
                        </div>
                    </Fancybox>
                    <br>
                    <hr>
                </div>
            </div>
        </LoadingComponent>
    </div>
</template>

<style scoped></style>
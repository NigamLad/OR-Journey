<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { state } from '@/config/msalConfig';
import { users, operations } from '@/scripts/simulatedDB';
import type { Operation } from '@/types';

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
        <div v-if="operationMedia" class="flex flex-col gap-4">
            <div v-for="operation in operationMedia" class="pb-4">
                <div class="text-xl">
                    {{ new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', }).format(new
                        Date(operation.starttime)) }}
                </div>
                <div>
                    {{ operation.procedure }}
                </div>
                <br>
                <div class="grid grid-cols-2">
                    <div v-for="event in operation.events.filter((e: Object) => (e.hasOwnProperty('image') || e.hasOwnProperty('video')))"
                        :class="{ 'col-span-2': event.hasOwnProperty('video') }">
                        <div v-if="event.hasOwnProperty('image')" class="p-2">
                            <figure>
                                <img :src="baseURL + '/images/' + event.image">
                                <figcaption>{{ event.description }}</figcaption>
                            </figure>
                        </div>
                        <div v-else-if="event.hasOwnProperty('video')" class="p-2 relative">
                            <div class="flex flex-col justify-center items-center backdrop-blur-lg absolute w-full h-full z-10 cursor-default"
                                @click.self="(e) => { (e.target as HTMLElement)?.classList.add('hidden') }">
                                Graphic Content
                                <br>
                                Click to Show
                            </div>
                            <video controls muted>
                                <source :src="event.video">
                            </video>
                            <div>{{ event.description }}</div>
                        </div>
                    </div>
                </div>
                <hr>
            </div>
        </div>
        <div v-else class="flex h-full">
            <LoadingComponent />
        </div>
    </div>
</template>

<style scoped></style>
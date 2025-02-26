<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, type Ref, nextTick } from 'vue';
import OperationEvent from '../components/OperationEvent.vue';
import type { Operation } from '@/types';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import ScrollToTop from '@/components/ScrollToTop.vue';
import CollapseAll from '@/components/CollapseAll.vue';
import ExpandAll from '@/components/ExpandAll.vue';

const router = useRouter();

const props = defineProps({
    id: { type: String, required: true }
})

const operationInfo = ref<Operation | null>(null);
const baseURL = new URL(import.meta.url).origin;
const loadOperation = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        operationInfo.value = operations[props.id];

    } catch (error) {
        console.log("Failed to load case")
        console.log(error)
    }
}

onMounted(() => {
    // Check if the requested operation is in the user's cases
    const userCases = users[state.user?.localAccountId as string].cases;
    if (!userCases.includes(props.id)) {
        router.push({ path: '/' })
    }

    loadOperation();
});

const scrollArea = ref();
const atTop = ref(true);
function scrollListener(event: Event) {
    if ((event.target as HTMLElement).scrollTop > 20)
        atTop.value = false;
    else
        atTop.value = true;
}
function scrollToTop() {
    (scrollArea.value as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
}

const collapseState: Ref<boolean | undefined> = ref(undefined);
function collapseAllEvents() {
    collapseState.value = true;
    nextTick(() => {
        collapseState.value = undefined;
    })
}
function expandAllEvents() {
    collapseState.value = false;
    nextTick(() => {
        collapseState.value = undefined;
    })
}

</script>

<template>
    <div ref="scrollArea" @scroll="(e) => scrollListener(e)" class="p-4 overflow-x-hidden h-full touch-pan-y">
        <Transition name="fade" mode="out-in">
            <ScrollToTop v-if="!atTop" @click="scrollToTop()" />
        </Transition>
        <div v-if="operationInfo">
            <div class="font-normal flex justify-between">
                <h1 class="text-2xl">{{ operationInfo.procedure }}</h1>
            </div>
            <hr>

            <div class="w-full grid grid-cols-2 grid-rows-4 gap-5 py-4 sm:grid-cols-3 sm:grid-rows-2 lg:grid-cols-4">

                <div class="col-span-2 sm:col-span-3 lg:col-span-2">
                    <p class="my-2">{{ operationInfo.description }}</p>
                </div>

                <Card class="sm:row-start-2">
                    <template #title>
                        <h1 class="font-medium">Surgical Team</h1>
                        <br>
                    </template>
                    <template #content>
                        <div class="flex flex-col gap-2">
                            <p>Dr. G Sutherland</p>
                            <p>Dr. C Veilleux</p>
                        </div>
                    </template>
                </Card>

                <Card class="sm:col-start-1 lg:row-start-2 lg:col-start-2">
                    <template #title>
                        <h1 class="font-medium">Duration</h1>
                        <br>
                    </template>
                    <template #content>
                        <div class="flex flex-col text-2xl text-center">
                            {{ operationInfo.duration }} hours
                        </div>
                    </template>
                </Card>

                <Card class="col-span-2 row-span-2 sm:row-start-2 sm:col-start-2 lg:row-start-1 lg:col-start-3">
                    <template #title>
                        <div class="flex justify-between">
                            <h1 class="font-medium">SmartForceps Insights</h1>
                            <img height="40px" width="40px" src="/src/assets/smartforceps.png">
                        </div>
                    </template>
                    <template #content>
                        <div class="flex flex-col h-full justify-evenly">
                            <div class="flex justify-center items-center gap-4">
                                <div class="flex items-end text-5xl text-center">
                                    0.6
                                    <p class="pl-1 text-base">N</p>
                                </div>
                            </div>
                            <div>
                                This is the average amount of force in Newtons applied to the brain tissue by the
                                surgeons
                            </div>
                            <div>
                                For this type of surgical procedure, the typical average force is 0.7 N
                            </div>
                        </div>
                    </template>
                </Card>

            </div>

            <br>
            <div class="flex justify-between">
                <h1 class="text-2xl">Events</h1>
                <div class="flex gap-4">
                    <div @click="collapseAllEvents()">
                        <CollapseAll />
                    </div>
                    <div @click="expandAllEvents()">
                        <ExpandAll />
                    </div>
                </div>
            </div>
            <hr>
            <br>
            <div class="flex flex-col">
                <div v-for="event in operationInfo.events">
                    <OperationEvent :event="event" :collapse="collapseState"/>
                </div>
            </div>
        </div>
        <div v-else class="flex h-full">
            <LoadingComponent />
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
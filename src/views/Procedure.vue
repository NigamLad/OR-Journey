<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref, nextTick } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import OperationEvent from '../components/OperationEvent.vue';
import type { Operation } from '@/types';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import { useRouter } from 'vue-router';
import ScrollToTop from '@/components/ScrollToTop.vue';
import CollapseAll from '@/components/CollapseAll.vue';
import ExpandAll from '@/components/ExpandAll.vue';
import InteractiveEvents from '@/components/InteractiveEvents.vue';

const isLargeScreen = useMediaQuery('(min-width: 1024px)')

const router = useRouter();

const props = defineProps({
    id: { type: String, required: true }
})

const operationInfo = ref<Operation | null>(null);
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

onUnmounted(() => {
    // Cleanup is handled automatically since we're not storing references
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

function goBack() {
    router.push(`/operation/${props.id}`);
}

</script>

<template>
    <div ref="scrollArea" @scroll="(e) => scrollListener(e)" class="h-full p-4 overflow-x-hidden touch-pan-y">
        <Transition name="fade" mode="out-in">
            <ScrollToTop v-if="!atTop && !isLargeScreen" @click="scrollToTop()" />
        </Transition>
        <LoadingComponent :isLoading="operationInfo == null">
            <div v-if="operationInfo" class="h-full lg:flex lg:flex-col">
                <div class="pb-4">
                    <div class="font-normal flex justify-between items-center">
                        <div>
                            <h1 class="text-2xl">{{ operationInfo.procedure }} - Events</h1>
                            <p class="text-gray-400">{{ new Date(operationInfo.starttime).toDateString() }}</p>
                        </div>
                        <div v-if="!isLargeScreen" class="flex gap-8">
                            <div @click="collapseAllEvents()">
                                <CollapseAll />
                            </div>
                            <div @click="expandAllEvents()">
                                <ExpandAll />
                            </div>
                        </div>
                    </div>
                    <hr>
                </div>

                <div class="h-full lg:flex lg:flex-col">
                    <div v-if="isLargeScreen" class="h-full">
                        <InteractiveEvents :events="operationInfo.events" />
                    </div>

                    <div v-else class="flex flex-col">
                        <div v-for="event in operationInfo.events" :key="event.eventId">
                            <OperationEvent :event="event" :collapse="collapseState"/>
                        </div>
                    </div>
                </div>
            </div>
        </LoadingComponent>
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

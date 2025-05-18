<script setup lang="ts">
import { ref, onMounted, type Ref, nextTick } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import OperationEvent from '../components/OperationEvent.vue';
import type { Operation } from '@/types';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import ForcePerformanceBar from '@/components/ForcePerformanceBar.vue';
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

function formatHoursToHrsMins(decimalHours: number) {
  const hours = Math.floor(decimalHours);
  const mins = Math.round((decimalHours - hours) * 60);
  
  // Only hours, no minutes
  if (mins === 0) {
    return `${hours} hrs`;
  }
  
  // Only minutes, no hours
  if (hours === 0) {
    return `${mins} mins`;
  }
  
  // Both hours and minutes
  return `${hours} hrs ${mins} mins`;
}

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
    <div ref="scrollArea" @scroll="(e) => scrollListener(e)" class="p-4 overflow-x-hidden touch-pan-y">
        <Transition name="fade" mode="out-in">
            <ScrollToTop v-if="!atTop && !isLargeScreen" @click="scrollToTop()" />
        </Transition>
        <div v-if="operationInfo" class="lg:flex lg:flex-col">
            <div class="lg:h-3/8 lg:flex lg:flex-col">
                <div class="font-normal flex justify-between">
                    <h1 class="text-2xl">{{ operationInfo.procedure }}</h1>
                    <p>{{ new Date(operationInfo.starttime).toDateString() }}</p>
                </div>
                <hr>

                <div class="w-full grid grid-cols-2 grid-rows-6 gap-5 py-4 sm:grid-cols-3 sm:grid-rows-5 lg:grid-rows-3 lg:grid-cols-4">

                    <div class="col-span-2 sm:col-span-3 lg:col-span-2">
                        <p class="my-2">{{ operationInfo.description }}</p>
                    </div>

                    <Card class="">
                        <template #title>
                            <h1 class="font-medium pb-2">Surgical Team 🩺</h1>
                        </template>
                        <template #content>
                            <div class="h-full flex flex-col gap-2 justify-center">
                                <p>Dr. G Sutherland</p>
                                <p>Dr. C Veilleux</p>
                            </div>
                        </template>
                    </Card>

                    <Card class="">
                        <template #title>
                            <h1 class="font-medium pb-2">Total Duration 🕜</h1>
                        </template>
                        <template #content>
                            <div class="h-full flex flex-col text-2xl text-center justify-center">
                                {{ formatHoursToHrsMins(operationInfo.duration) }}
                            </div>
                        </template>
                    </Card>

                    <Card class="">
                        <template #title>
                            <h1 class="font-medium pb-2">Skin-to-Skin Time 🕜</h1>
                        </template>
                        <template #content>
                            <div class="h-full flex flex-col text-2xl text-center justify-center">
                                {{ formatHoursToHrsMins(operationInfo.skintoskintime) }}
                            </div>
                        </template>
                    </Card>

                    <Card class="">
                        <template #title>
                            <h1 class="font-medium pb-2">Blood Transfusions 🩸</h1>
                        </template>
                        <template #content>
                            <div class="h-full flex flex-col text-2xl text-center justify-center">
                                3 Units
                            </div>
                        </template>
                    </Card>

                    <Card class="col-span-2 row-span-3 sm:row-start-2 sm:col-start-2 sm:row-span-4 lg:row-span-2 lg:col-start-3 lg:row-start-1 lg:row-span-3">
                        <template #title>
                            <div class="flex justify-between">
                                <h1 class="font-medium">Surgeon Performance 📈</h1>
                                <img height="40px" width="40px" src="/src/assets/smartforceps.png">
                            </div>
                        </template>
                        <template #content>
                            <div class="flex flex-col h-full justify-evenly">
                                <div class="flex justify-center items-center gap-4">
                                    <div class="flex items-end text-4xl text-center">
                                        Top 1%
                                    </div>
                                </div>
                                <div>
                                    The skill and performance of your surgical team is in the top 1% globally.
                                </div>
                                <div>
                                    <ForcePerformanceBar :force=0.6 />
                                </div>
                                <div>
                                    An average force of 0.6 Newtons reflects exceptional technique, minimal tissue manipulation, and optimal force application during the procedure.
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>

            <!-- <div class="lg:h-5/8 lg:flex lg:flex-col">
                <div class="pb-4">
                    <div class="flex justify-between pt-4">
                        <h1 class="text-2xl">Events</h1>
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

                <div v-if="isLargeScreen" class="h-full">
                    <InteractiveEvents :events="operationInfo.events" />
                </div>

                <div v-else class="flex flex-col">
                    <div v-for="event in operationInfo.events">
                        <OperationEvent :event="event" :collapse="collapseState"/>
                    </div>
                </div>
            </div> -->


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
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import OperationEvent from '../components/OperationEvent.vue';
import type { Operation } from '@/types';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import { useRouter } from 'vue-router';
import Card from '@/components/Card.vue';
import HoverInfo from '@/components/HoverInfo.vue';
import ArrowUpShort from '@/components/icons/arrow-up-short.vue';

const router = useRouter();

const props = defineProps({
    id: {type: String, required: true}
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
        console.log("Operation not found in user's cases")
        router.push({path: '/'})
    }

    loadOperation();
});

</script>

<template>
    <div class="p-4 overflow-x-hidden h-full touch-pan-y">
        <div v-if="operationInfo">
            <div class="font-normal flex justify-between mb-6">
                <h1 class="text-2xl">{{ operationInfo.procedure }}</h1>
                <!-- <h1 class="text-xl">{{ operationInfo.procedure }}</h1>
                <h2 class="text-sm whitespace-nowrap">Duration: {{ operationInfo.duration }} hours</h2> -->
            </div>
            <p class="mb-6">{{ operationInfo.description }}</p>
            <div class="w-full grid grid-cols-2 grid-rows-3 gap-5 mb-6">
            
                <Card>
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

                <Card>
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

                <Card class="col-span-2 row-span-2">
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
                                This is the average amount of force in Newtons applied to the brain tissue by the surgeons
                            </div>
                            <div>
                                For this type of surgical procedure, the typical average force is 0.7 N
                            </div>
                        </div>
                    </template>
                </Card>

            
            </div>
            <div v-for="event in operationInfo.events">
                <OperationEvent :event="event" />
            </div>
        </div>
        <div v-else class="flex h-full">
            <LoadingComponent />
        </div>
    </div>
</template>

<style scoped></style>
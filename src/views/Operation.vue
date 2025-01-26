<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import OperationEvent from '../components/OperationEvent.vue';
import type { Operation } from '@/types';
import LoadingComponent from '@/components/LoadingComponent.vue';
import { operations, users } from '@/scripts/simulatedDB';
import { state } from '@/config/msalConfig';
import { useRouter } from 'vue-router';

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
                <h1 class="text-xl">{{ operationInfo.procedure }}</h1>
                <h2 class="text-sm whitespace-nowrap">Duration: {{ operationInfo.duration }} hours</h2>
            </div>
            <p class="mb-6">{{ operationInfo.description }}</p>
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
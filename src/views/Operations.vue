<script setup lang="ts">
import { onMounted, ref } from "vue";
import { state } from "@/config/msalConfig";
import LoadingComponent from '@/components/LoadingComponent.vue';
import Card from "../components/Card.vue";
import type { Operation } from "@/types";
import { users, operations } from "../scripts/simulatedDB";


// const account = getAccount();
const operationInfo = ref<Array<Operation> | null>(null);

const loadOperations = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        var user: string = state.user?.localAccountId as string;
        var user_operations: Array<Operation> = users[user].cases.map((a: any) => operations[a])
        user_operations.sort((a: any, b: any) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime());

        for (let operation of Object.values(user_operations)) {
            console.log(operation);
        }

        operationInfo.value = user_operations;
        console.log(operationInfo.value)

    } catch (error) {
        console.log("Failed to load case")
        console.log(error)
    }
}

onMounted(() => {
    loadOperations();
})

</script>

<template>
    <div class="relative h-full w-full flex-col overflow-x-hidden touch-pan-y space-y-4 p-4">
        <div v-if="operationInfo" class="w-full flex grid  grid-cols-2 gap-5">
            <div v-for="operation in operationInfo">
                <Card
                    :id="operation.id"
                    :message="operation.procedure"
                    :duration="`${operation.duration} hours`"
                    :date="new Date(operation.starttime)" 
                />
            </div>
        </div>
        <div v-else class="flex h-full">
            <LoadingComponent />
        </div>
    </div>
</template>

<style scoped>
#welcome-message {
    font-size: 32px;
}
</style>

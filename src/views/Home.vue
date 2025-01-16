<script setup lang="ts">
import Card from "../components/Card.vue";
import MoreCard from "../components/MoreCard.vue";
import { watch, computed, onMounted, ref } from "vue";
import type { AccountInfo } from "@azure/msal-browser";
import { state } from "@/config/msalConfig";
import LoadingComponent from '@/components/LoadingComponent.vue';
import { users, operations} from "@/scripts/simulatedDB";
import type { Operation } from "@/types";

const latestCase = ref<any>(null);
const baseURL = new URL(import.meta.url).origin;
const getLatestCase = async () => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        var user: string = state.user?.localAccountId as string;
        var user_operations: Array<Operation> = users[user].cases.map((a: any) => operations[a])

        user_operations.sort((a: any, b: any) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime());
        latestCase.value = user_operations[user_operations.length - 1];
        latestCase.value["duration"] = latestCase.value.duration

    } catch (error) {
        console.log(error)
    }
}

onMounted(() => {
    getLatestCase();
});

</script>

<template>
    <div class="relative h-full w-full flex flex-col overflow-y-auto touch-pan-y space-y-4 p-4">
        <div v-if="latestCase">
        
            <div id="message">
                <div class="w-56">
                    <!-- <p>Ready to explore your latest surgery {{ account.firstname }}?</p> -->
                    <p>Ready to explore your latest surgery?</p>

                </div>
            </div>

            <div id="content" class="w-full flex items-end gap-2">
                <Card :id="latestCase['id']" :message="latestCase['procedure']" :duration="`${latestCase['duration']} hours`"
                    :date="new Date(latestCase['starttime'])" />
                <Router-Link to="/operations">
                    <MoreCard />
                </Router-Link>
            </div>

            <!-- <div id="message">
                <div class="w-56">
                    <p>See upcoming operations</p>
                </div>
            </div>

            <div id="content" class="w-full flex items-end gap-2">
                <Card />
                <Router-Link to="/planning">
                    <MoreCard />
                </Router-Link>
            </div>

            <div id="message">
                <div class="w-56">
                    <p>Review your prescriptions</p>
                </div>
            </div>

            <div id="content" class="w-full flex items-end gap-2">
                <Card />
                <Router-Link to="/prescriptions">
                    <MoreCard />
                </Router-Link>
            </div> -->

        </div>
        <div v-else class="flex h-full">
            <LoadingComponent />
        </div>

    </div>

</template>

<style scoped>
#message {
    font-size: 32px;
}

#content {
    padding-top: 1em;
    padding-bottom: 2em;
}
</style>

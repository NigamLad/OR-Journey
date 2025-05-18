<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
    force: { type: Number, required: true }
})

// Calculate position percentage based on force value (0-3N range)
// This simpler approach will work better with the flexbox layout
const markerPosition = computed(() => {
    // Constrain force between 0 and 3 for safety
    const constrainedForce = Math.max(0, Math.min(3, props.force));
    // Convert to percentage of the actual bar width
    return (constrainedForce / 3) * 100;
})
</script>

<template>
    <div class="relative pt-8 pb-2">
        <div class="absolute w-full">
            <div class="relative ml-10 mr-10">
                <div class="absolute text-xl -top-8 transform -translate-x-1/2 font-bold"
                    :style="{ left: `${markerPosition}%` }">
                    {{ props.force }}
                </div>
                <div id="marker"
                    class="absolute w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-white -top-2"
                    :style="{ left: `calc(${markerPosition}% - 8px)` }"></div>
            </div>
        </div>
        <div class="flex items-center">
            <span class="text-xl mr-2 w-8 text-right">0N</span>
            <div id="bar" class="h-5 flex-grow rounded overflow-hidden">
                <div class="h-full w-full" style="background: linear-gradient(to right, 
                        #FBBF24 0%, /* yellow-400 at 0N */
                        #FBBF24 14%, /* yellow-400 at 0.42N (14% of 3N) */
                        #4ADE80 16.7%, /* green-400 at 0.5N (16.7% of 3N) */
                        #10B981 25%, /* green-500 at 0.75N (25% of 3N) */
                        #4ADE80 33.3%, /* green-400 at 1N (33.3% of 3N) */
                        #FBBF24 36%, /* yellow-400 at 1.08N (36% of 3N) */
                        #FBBF24 47%, /* yellow-400 at 1.41N (47% of 3N) */
                        #F87171 50%, /* red-400 at 1.5N (50% of 3N) */
                        #EF4444 100% /* red-500 at 3N */
                    );">
                </div>
            </div>
            <span class="text-xl ml-2 w-8">3N</span>
        </div>
    </div>
</template>

<style scoped></style>
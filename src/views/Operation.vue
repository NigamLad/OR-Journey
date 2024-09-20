<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import OperationEvent from '../components/OperationEvent.vue';
import type { Operation } from '@/types';
import LoadingComponent from '@/components/LoadingComponent.vue';
// import { xml2js } from "xml-js";

const props = defineProps({
    id: String
})

// const operationInfo = ref<Operation>({
//     "id": <string>props.id,
//     "procedure": "Right Temporal Lobe Meningioma",
//     "duration": 3.5,
//     "description": "You underwent a craniotomy, which is a procedure where a temporary window is made in the skull to access and remove your tumor, with the opening being repaired at the end of the surgery.",
//     "events": [
//         {"eventId": "guid", "timestamp": "2024-01-23T07:30", "type": "Pre Operative", "eventName": "Arrived at operating room"},
//         {"eventId": "guid", "timestamp": "2024-01-23T07:45", "type": "Intraoperative", "eventName": "Anesthesia administered", "description": "You were given "},
//         {"eventId": "guid", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": ""},
//         {"eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": ""},
//         {"eventId": "guid", "timestamp": "2024-01-23T08:30", "type": "Intraoperative", "eventName": "Surgery started", "description": ""},
//         {"eventId": "guid", "timestamp": "2024-01-23T10:00", "type": "Intraoperative", "eventName": "Wound closing", "description": ""},
//         {"eventId": "guid", "timestamp": "2024-01-23T10:15", "type": "Intraoperative", "eventName": "Surgery complete", "description": ""},
//         {"eventId": "guid", "timestamp": "2024-01-23T11:00", "type": "Post Operative", "eventName": "Anesthesia reversal", "description": ""},
//         {"eventId": "guid", "timestamp": "2024-01-23T11:00", "type": "Post Operative", "eventName": "Transfered to PACU", "description": ""},
        
//     ]
// })


const anaestheticDataRequest = ref()
const anaestheticData = computed(() => anaestheticDataRequest)

// fetch('http://localhost:5173/src/assets/anaestheticLog.xml').then((value) => {
//     value.text().then((result) => {
//         // console.log(xml2js(result).elements[0])
//         anaestheticDataRequest.value = xml2js(result).elements[0]
//     })
// })

const operationInfo = ref<Operation | null> (null);
const baseURL = new URL(import.meta.url).origin;
const loadJson = async() => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // const response = await fetch(baseURL + '/src/assets/mock-user-data/user-1/516e0881-4012-49ea-a8f8-276d1b424b02.json')
        const response = await fetch(baseURL + '/mock-user-data/user-1/516e0881-4012-49ea-a8f8-276d1b424b02.json')
        
        // console.log(await response.text())
        console.log(baseURL)
        console.log(baseURL + '/mock-user-data/user-1/516e0881-4012-49ea-a8f8-276d1b424b02.json')
        const data = await response.json();
        operationInfo.value = data;
        console.log(data)
    
    } catch (error) {
        console.log(error)
    }
}

onMounted(() => {
  loadJson();
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
                <OperationEvent :event="event"/>
                <!-- {{ event.eventName }} -->
            </div>
        </div>
        <div v-else class="flex h-full"><LoadingComponent /></div>

        
    </div>
</template>

<style scoped>

</style>
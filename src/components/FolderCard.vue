<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { initClickHandler } from "../scripts/clickAnimation";

const props = defineProps({
    id: String,
    message: String,
    duration: String,
    date: Date,
})

onMounted(() => {
    initClickHandler(getCurrentInstance()?.vnode.el)
})

</script>

<template>
    <Router-Link :to="'/operation/' + id" class="relative">
        <div class="w-full">
            <div id="tab" class="relative pointer-events-none">
                <div id="date" class="absolute z-10 text-center align-middle whitespace-nowrap">{{ new
                    Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', }).format(date) }}
                </div>
                <svg width="120" height="30" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120 30H0C15 30 15 0 30 0H90C100.714 5.78524e-05 105 30 120 30Z" fill="#232222" />
                </svg>
            </div>

            <div id="card" class="flex flex-col relative w-1/2">
                <p class="line-clamp-4">{{ message }}</p>
                <p class="absolute bottom-3 right-3">{{ duration }}</p>
            </div>
        </div>
    </Router-Link>

</template>

<style scoped>
#card {
    padding: 1em;
    border-radius: 10px;
    background: radial-gradient(50% 90% at 100% 100%, #2C1C28 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , radial-gradient(50% 90% at 0% -1.92%, #172E29 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , #1C1C1C;
    min-width: 140px;
    max-width:250px;
    width: 100%;
    height: 130px;
    position: relative;
}

#card::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 13px;
    padding: 3px;
    background: linear-gradient(135deg, 
        #7A4E78 0%, 
        rgba(122, 78, 120, 1) 25%, 
        rgba(55, 110, 105, 0.9) 50%, 
        rgba(55, 110, 105, 1) 75%, 
        #4A7A75 100%
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    opacity: 0;
    animation: gradientGlow 3s ease-in-out infinite;
    filter: 
        drop-shadow(0 0 5px rgba(122, 78, 120, 0.8)) 
        drop-shadow(0 0 12px rgba(122, 78, 120, 0.6)) 
        drop-shadow(0 0 20px rgba(122, 78, 120, 0.4))
        drop-shadow(0 0 8px rgba(55, 110, 105, 0.8)) 
        drop-shadow(0 0 16px rgba(55, 110, 105, 0.6)) 
        drop-shadow(0 0 25px rgba(55, 110, 105, 0.4));
}

@keyframes gradientGlow {
    0%, 100% {
        opacity: 0;
    }
    
    50% {
        opacity: 1;
    }
}

#tab {
    fill: #232222;
    transform: translate(10px);
}

#date {
    font-size: 13px;
    left: 20px;
    height: 100%;
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
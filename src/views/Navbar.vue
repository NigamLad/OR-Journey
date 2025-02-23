<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRoute } from 'vue-router';
// import { getAccount } from '../lib/api/acm';
import { ref, onMounted, computed, watch } from 'vue'
import NavTab from '@/components/NavTab.vue';
import Profile from '@/components/Profile.vue';
import { initClickHandler, removeClickHandler } from "../scripts/clickAnimation";

const address = useRoute()

// Navbar button modifiers
const operationsButton = ref()
const galleryButton = ref()
// const planningButton = ref()
// const prescriptionsButton = ref()

onMounted(() => {
    initClickHandler(operationsButton.value)
    initClickHandler(galleryButton.value)
})

watch(address, (newValue) => {
    initClickHandler(operationsButton.value)
    initClickHandler(galleryButton.value)
    // initClickHandler(planningButton.value)
    // initClickHandler(prescriptionsButton.value)

    switch (newValue.fullPath) {

        case '/operations':
            removeClickHandler(operationsButton.value)
            break;

        case '/gallery':
            removeClickHandler(galleryButton.value)
            break;

        // case '/planning':
        //     removeClickHandler(planningButton.value)
        //     break;

        // case '/prescriptions':
        //     removeClickHandler(prescriptionsButton.value)
        //     break;

        default:
            break;
    }
});

</script>

<template>
    <div id="Navbar" class="flex flex-col antialiased bg-slate-400 text-gray-800 justify-center">
        <!-- <div class="w-full flex justify-evenly items-center"> -->
        <div class="w-full flex justify-around items-center">

            <Router-Link to="/" class="relative h-[40px] w-[40px]">
                <Transition name="logo-back-button" mode="out-in">
                    <div class="absolute" v-if="$route.path == '/'">
                        <img src="../assets/Journey Logo.svg" width="40px" height="40px">
                    </div>
                    <div :ref="(el) => { initClickHandler(el) }" class="flex items-center justify-center rounded-full w-[40px] h-[40px] bg-[#232222]" v-else id="back-button">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M12.8333 7C12.8333 6.76988 12.6467 6.58333 12.4166 6.58333L2.58917 6.58333L5.21121 3.9613C5.37393 3.79858 5.37393 3.53476 5.21121 3.37204C5.04849 3.20932 4.78467 3.20932 4.62196 3.37204L1.28862 6.70537C1.12591 6.86809 1.12591 7.13191 1.28862 7.29463L4.62196 10.628C4.78467 10.7907 5.04849 10.7907 5.21121 10.628C5.37393 10.4652 5.37393 10.2014 5.21121 10.0387L2.58917 7.41667H12.4166C12.6467 7.41667 12.8333 7.23012 12.8333 7Z"
                                fill="#C5C5C5" />
                        </svg>
                    </div>
                </Transition>
            </Router-Link>

            <button ref="operationsButton" @click="" class="flex items-center relative">
                <Router-Link to="/operations">
                    <div class="relative z-[1]">Operations</div>
                    <Transition name="tab-appear">
                        <NavTab v-if="$route.path == '/operations'" />
                    </Transition>
                </Router-Link>
            </button>

            <button ref="galleryButton" @click="" class="flex items-center relative">
                <Router-Link to="/gallery">
                    <div class="relative z-[1]">Gallery</div>
                    <Transition name="tab-appear">
                        <NavTab v-if="$route.path == '/gallery'" />
                    </Transition>
                </Router-Link>
            </button>

            <!-- <button ref="planningButton" class="flex items-center relative">
                <Router-Link to="/planning">
                    <div class="relative z-10">Planning</div>
                    <Transition name="tab-appear">
                        <NavTab v-if="$route.path == '/planning'" />
                    </Transition>
                </Router-Link>
            </button>

            <button ref="prescriptionsButton" class="flex items-center relative">
                <Router-Link to="/prescriptions">
                    <div class="relative z-10">Rx</div>
                    <Transition name="tab-appear">
                        <NavTab v-if="$route.path == '/prescriptions'" />
                    </Transition>
                </Router-Link>
            </button> -->

            <Profile />

        </div>
    </div>
</template>

<style scoped>
#Navbar {
    min-height: 80px;
    height: 80px;
    background-color: #171616;
}

/* #tab {
    width: calc(100% + 40px);
    height:60px;
    left:calc(0% - 20px);
    bottom:calc(0% - 20px);
} */

button {
    border-radius: 16px;
    padding: 0 0.5em;
    height: 40px;
    background-color: #232222;
    color: #C5C5C5;
    cursor: pointer;
    transition: border-color 0.25s;
}

#back-button {
    /* background-color: #232222; */
}

.logo-back-button-enter-active,
.logo-back-button-leave-active {
    transition: opacity 0.3s ease;
}

.logo-back-button-enter-from,
.logo-back-button-leave-to {
    opacity: 0;
}


.tab-appear-enter-active,
.tab-appear-leave-active {
    transition: transform 0.6s ease;
}

.tab-appear-enter-from,
.tab-appear-leave-to {
    transform: scaleY(0);

    /* opacity: 0; */
}
</style>
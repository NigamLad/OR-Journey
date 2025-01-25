<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { msalService } from './config/useAuth'
import { msalInstance, state } from './config/msalConfig'
const { handleRedirect, registerAuthorizationHeaderInterceptor } = msalService()
import Navbar from './views/Navbar.vue';
import Main from './views/Main.vue';
import LoginPage from './views/LoginPage.vue';
import type { AccountInfo } from '@azure/msal-browser';

const initialize = async () => {

    try {
        await msalInstance.initialize()
        registerAuthorizationHeaderInterceptor() // Call the initialize function
    } catch (error) {
        console.log('Initialization error', error)
    }
}

const container = ref()
onMounted(async () => {
    await initialize()
    await handleRedirect()
})

</script>

<template>
    <div id="container" ref="container" class="flex h-full w-full">
        <div class="flex w-full h-full" v-if="state.isAuthenticated">
            <Main />
        </div>
        <div class="flex h-full w-full" v-else>
            <LoginPage />
        </div>
    </div>
</template>

<style>

#app {
    height:100%;
}

#spacer {
    height: 5px;
}

</style>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { msalService } from '../config/useAuth'
import { initClickHandler } from "../scripts/clickAnimation";
import { state } from '@/config/msalConfig';
const { login } = msalService()

const handleLogin = async () => {
    await login()
}

const guestLogin = () => {
    state.isAuthenticated = true
    state.user = {
        homeAccountId: "",
        environment: "GUEST",
        tenantId: "",
        username: "",
        localAccountId: "516e0881-4012-49ea-a8f8-276d1b424b02",
        name: "Mary Jones",
    }
}

const container = ref()
const loginButton = ref()
const guestLoginButton = ref()
onMounted(() => {
    setTimeout(() => {
        if (container.value)
            container.value.classList.add("fadeIn")
    }, 1000)
    initClickHandler(loginButton.value)
    initClickHandler(guestLoginButton.value)
})



</script>

<template>
    <div id="container" ref="container" class="flex flex-col items-center w-full pt-24">
        <div class="flex flex-col justify-center items-center pb-24">
            <img src="/src/assets/Journey Logo.svg" width="100px">
            <div class="text-5xl pt-5 font-extralight">OR Journey</div>
        </div>

        <div class="flex flex-col items-center">
            <button class="mb-5" ref="loginButton" @click="handleLogin">Log In</button>
            <button id="guestLoginButton" ref="guestLoginButton" @click="guestLogin">Guest</button>
        </div>

    </div>
</template>

<style scoped>
#container {
    transition: all 1s;
    opacity: 0;
}

#container.fadeIn {
    opacity: 1
}

button {
    padding: 1em;
    border-radius: 10px;
    background: radial-gradient(50% 90% at 100% 100%, #2C1C28 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , radial-gradient(50% 90% at 0% -1.92%, #172E29 0%, rgba(28, 28, 28, 0) 100%)
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */
        , #1C1C1C;
    width: 200px;
    height: 80px;
}

button#guestLoginButton {
    width: 180px;
}
</style>
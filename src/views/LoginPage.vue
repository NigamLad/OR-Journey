<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { msalService } from '../config/useAuth'
import { initClickHandler } from "../scripts/clickAnimation";
import { state } from '@/config/msalConfig';
const { login } = msalService()
import { users } from '@/scripts/simulatedDB';

const handleLogin = async () => {
    await login()
}

function guestLogin(id: string) {
    state.isAuthenticated = true
    state.user = {
        homeAccountId: "",
        environment: "GUEST",
        tenantId: "",
        username: "",
        localAccountId: id,
        name: users[id].name,
    }
}

const container = ref()
const loginButton = ref()
const guestLoginButton = ref()
const user1LoginButton = ref()
const user2LoginButton = ref()
onMounted(() => {
    setTimeout(() => {
        if (container.value)
            container.value.classList.add("fadeIn")
    }, 1000)
    initClickHandler(loginButton.value)
    initClickHandler(guestLoginButton.value)
    initClickHandler(user1LoginButton.value)
    initClickHandler(user2LoginButton.value)

})

</script>

<template>
    <div id="container" ref="container" class="flex flex-col items-center w-full pt-24">
        <div class="flex flex-col justify-center items-center pb-24">
            <img src="/src/assets/Journey Logo White.svg" width="100px">
            <div class="text-5xl pt-5 font-extralight">OR Journey</div>
        </div>

        <div class="flex flex-col items-center gap-4">
            <p class="text-center w-[250px]">
                Explore what a patient could view after a surgical intervention.
                <br><br>
                Select a user below:
                <br>
                <br>

            </p>

            <button id="guestLoginButton" ref="user1LoginButton" @click="guestLogin('516e0881-4012-49ea-a8f8-276d1b424b02')">
                Mary Jones
            </button>

            <button id="guestLoginButton" ref="user2LoginButton" @click="guestLogin('a2b3c4d5-6789-0123-4567-89abcdef0123')">
                John Smith
            </button>

            <!-- <button class="mb-5" ref="loginButton" @click="handleLogin">
                Log In
            </button>
            <button id="guestLoginButton" ref="guestLoginButton" @click="guestLogin">
                Guest
            </button> -->
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
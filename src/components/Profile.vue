<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { state } from '../config/msalConfig'
import { msalService } from '../config/useAuth'
const { logout } = msalService()

const account = {firstname: state.user?.name?.split(" ")[0], lastname: state.user?.name?.split(" ")[1]} as any

function handleLogout() {
    if(state.user?.environment == "GUEST")
        state.isAuthenticated = false
    else{
        state.user = null
        state.isAuthenticated = false
        logout()
    }
}

const menu = ref()
function toggleMenu() {
    menu.value.classList.toggle("collapsed")
}

onMounted(() => {
    menu.value.addEventListener("focusout", () => {
        console.log("Focus")
        toggleMenu()
    })
})


</script>

<template>
    <div class="relative">
        <div>
            <button class="aspect-square" @click="toggleMenu">{{ account.firstname[0] + account.lastname[0] }}</button>
        </div>
        <div ref="menu" id="menu" class="collapsed absolute text-nowrap">
            <div>{{ account.firstname + " " + account.lastname }}</div>
            <hr>
            <div @click="handleLogout">Logout</div>
        </div>
    </div>
    
</template>

<style scoped>
button {
    padding: 0 0.5em;
    height: 40px;
    cursor: pointer;
    transition: border-color 0.25s;
    background-color: #F46F51;
    font-weight: 500;
    color: white;
    border-radius: 100%;
}

#menu {
    position:absolute;
    top: 70px;
    right: 5px;
    visibility: visible;
    padding: 0.5em;
    border: 1px solid white;
    color: #C5C5C5;
    background-color: #232222;
    z-index: 1;
    border-radius: 10px;
    transition: all 0.25s;
    
}

#menu div {
    margin: 0.5em 0em;
}

#menu.collapsed {
    visibility: collapse;
    opacity: 0;
}

</style>
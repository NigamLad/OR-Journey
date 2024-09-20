<script setup lang="ts">
import Card from "../components/Card.vue";
import MoreCard from "../components/MoreCard.vue";
import { watch, computed } from "vue";
import type { AccountInfo } from "@azure/msal-browser";
import { state } from "@/config/msalConfig";

</script>

<template>
    <div class="relative h-100 w-full flex flex-col overflow-y-auto touch-pan-y space-y-4 p-4">
        <div id="message">
            <div class="w-56">
                <!-- <p>Ready to explore your latest surgery {{ account.firstname }}?</p> -->
                <p>Ready to explore your latest surgery?</p>

            </div>
        </div>

        <div id="content" class="w-full flex items-end gap-2">
            <Card :id="'123456'" :message="'Right Temporal Lobe Meningioma'" :duration="'3.5 hours'"
                :date="'23 Jan, 2024'" />
            <Router-Link to="/operations">
                <MoreCard />
            </Router-Link>
        </div>

        <div id="message">
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
        </div>

    </div>

</template>

<style scoped>
#message {
    font-size: 32px;
}

#content {
    padding-bottom: 2em;
}
</style>

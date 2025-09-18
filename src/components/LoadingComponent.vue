<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
    isLoading: boolean;
    duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
    duration: 300
});

const showContent = ref(false);

watch(() => props.isLoading, (newVal) => {
    if (!newVal) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
            showContent.value = true;
        }, 100);
    } else {
        showContent.value = false;
    }
});

onMounted(() => {
    if (!props.isLoading) {
        showContent.value = true;
    }
});
</script>

<template>
    <div class="loading-wrapper">
        <transition name="fade" mode="out-in" :duration="duration">
            <div v-if="isLoading" key="loading" class="flex h-full">
                <div class="loader flex items-center justify-center m-auto h-full w-full"></div>
            </div>
            <div v-else key="content" class="h-full fade-in-content">
                <slot />
            </div>
        </transition>
    </div>
</template>

<style scoped>
.loading-wrapper {
    height: 100%;
    width: 100%;
}

.loader {
  width: 3em;
  height: 3em;
  background: linear-gradient(-45deg, #623e59 0%, #34695d 100% );
  animation: spin 2.5s infinite;
  border-radius: 10%;
}

.loader::before {
  content: "";
  z-index: -1;
  position: absolute;
  inset: 0;
  background: linear-gradient(-45deg, #623e59 0%, #34695d 100% );
  transform: translate3d(0, 0, 0) scale(0.95);
  filter: blur(20px);
}

@keyframes spin {
  0% {
    transform: rotate(-45deg);
  }

  50% {
    transform: rotate(-360deg);
    border-radius: 50%;
  }

  100% {
    transform: rotate(-45deg);
  }
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}

/* Additional smooth fade-in for content */
.fade-in-content {
    animation: fadeInContent 0.6s ease-in-out;
}

@keyframes fadeInContent {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
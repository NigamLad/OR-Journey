<script setup lang="ts">
import { ref, computed } from 'vue';
import LoadingComponent from '@/components/LoadingComponent.vue';

interface Props {
    url: string;
    type: 'image' | 'video';
    contentWarning?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    contentWarning: false
});

const warningAccepted = ref(false);

const isImage = computed(() => props.type === 'image');
const mediaUrl = computed(() => props.url || '');
const showContentWarning = computed(() => props.contentWarning);

const acceptWarning = () => {
    warningAccepted.value = true;
};

const handleClick = (event: MouseEvent) => {
    // Allow Fancybox to handle the click, don't stop propagation
    // This ensures Fancybox can open the media properly
};

const handleMouseDown = (event: MouseEvent) => {
    // Don't stop propagation - let the parent drag handler detect this as a media element
    // The EventSlideshow handleMediaDragStart will handle the drag vs click logic
};

const handleTouchStart = (event: TouchEvent) => {
    // Don't stop propagation - let the parent drag handler detect this as a media element  
    // The EventSlideshow handleMediaDragStart will handle the drag vs click logic
};

</script>

<template>
    <div class="relative border-white border-2 rounded-lg">
        <!-- Content Warning Overlay -->
        <div v-if="showContentWarning && !warningAccepted"
            class="absolute inset-0 cursor-pointer flex items-center justify-center bg-black rounded-sm z-10" 
            @click.stop="acceptWarning"
            @mousedown.stop
            @touchstart.stop>
            <img class="max-w-full max-h-full object-contain rounded-lg hover:opacity-80 transition-opacity"
                src="/src/assets/Graphic-Content.svg" alt="Content Warning - Click to view">
        </div>
        <LoadingComponent :isLoading="false">
            <a v-if="mediaUrl" 
               data-fancybox="gallery" 
               :data-download-src="mediaUrl" 
               :href="mediaUrl" 
               class="block"
               @click="handleClick"
               @mousedown="handleMouseDown"
               @touchstart="handleTouchStart">
                <img :src="isImage ? mediaUrl : mediaUrl.replace('/videos/', '/videos/thumbnails/').replace(/mp4$/, 'jpg')"
                :alt="isImage ? 'Medical image' : 'Medical video'"
                    class="w-full h-auto rounded-lg" loading="eager">
            </a>
        </LoadingComponent>
    </div>
</template>

<style scoped></style>

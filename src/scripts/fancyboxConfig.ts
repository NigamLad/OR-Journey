import type { FancyboxOptionsType } from "@/components/Fancybox.vue"

async function downloadFile(url: string) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.setAttribute('download', url.split('/').pop() as string);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadURL);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

export const FancyBoxOptions: FancyboxOptionsType = {
    Carousel: {
        infinite: false,
    },
    Toolbar: {
        enabled: true,
        items: {
            custom_download: {
                tpl: `<a class='f-button' title='{{DOWNLOAD}}' data-fancybox-download href='javasript:;'><svg><path d='M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12'/></svg></a>`,
                click: (instance: any, event: any) => { downloadFile(event.target.download) }
            }
        }, display: {
            left: ['infobar', 'custom_download'],
            middle: [],
            right: ['iterateZoom', 'fullscreen', 'close']
        }
    }
}
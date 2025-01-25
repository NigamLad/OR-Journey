import type { Operation, User } from "@/types"

export const operations: Record<string, Operation> = {
    "2fa35c90-4fad-4bc1-886e-cad4cf1f2591": {
        "id": "2fa35c90-4fad-4bc1-886e-cad4cf1f2591",
        "procedure": "Right Temporal Lobe Meningioma",
        "duration": 3.5,
        "starttime": "2024-01-23T07:30",
        "description": "You underwent a craniotomy, which is a procedure where a temporary window is made in the skull to access and remove your tumor, with the opening being repaired at the end of the surgery.",
        "events": [
            { "eventId": "guid", "timestamp": "2024-01-23T07:30", "type": "Pre Operative", "eventName": "Arrived at operating room", "description": "You arrived at the operating room to begin your procedure" },
            { "eventId": "guid", "timestamp": "2024-01-23T07:45", "type": "Intraoperative", "eventName": "Anesthesia administered", "description": "You were given 11.25 mg of Midazolam as an induction dose, and 1.5 mg per hour to keep you asleep." },
            { "eventId": "guid", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken of the right lateral hemisphere", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/8ffd8281-ea1e-4ef0-b5dc-77ca17824af0.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/710e6d1e-d729-4fe6-9adb-dabf725a394a.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:30", "type": "Intraoperative", "eventName": "Surgery started", "description": "Your surgical procedure started" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Video Clip", "description": "The surgical team began the removal of the lesion", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/824f032e-e0b3-4dc9-bb8e-9cf3ce77606c.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:30", "type": "Intraoperative", "eventName": "Video Clip", "description": "The lesion was removed", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/3b14e0bf-3603-4cec-b95a-bcba5673ef27.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:31", "type": "Intraoperative", "eventName": "Image - Tumor", "description": "The tumor removed was approximately 1cm in diameter", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/40fa4db6-a7d4-4124-b488-191e294188aa.png" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:33", "type": "Intraoperative", "eventName": "Wound closing", "description": "Your surgical team has begun closing the wound where they entered" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:45", "type": "Intraoperative", "eventName": "Video Clip", "description": "The skull cap has been replaced", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/28f3febc-b15d-4c33-9006-1d628db4b04e.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:15", "type": "Intraoperative", "eventName": "Surgery complete", "description": "Your surgical procedure is now complete" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:45", "type": "Post Operative", "eventName": "MRI Image - Post Op", "description": "An MRI image was taken of the right lateral hemisphere after the surgical operation", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/30702c96-3c7f-46de-a134-10f0278db2e0.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T11:00", "type": "Post Operative", "eventName": "Anesthesia reversal", "description": "Anaesthesia drugs have stopped being administered" },
            { "eventId": "guid", "timestamp": "2024-01-23T11:15", "type": "Post Operative", "eventName": "Transfered to PACU", "description": "You we're transferred to the post anesthesia care unit" }
        ]
    },
    "41114a51-7413-40f0-ab74-75b903a2392b": {
        "id": "41114a51-7413-40f0-ab74-75b903a2392b",
        "procedure": "Right Temporal Lobe Meningioma 2",
        "duration": 3.75,
        "starttime": "2024-01-24T07:30",
        "description": "You underwent a craniotomy, which is a procedure where a temporary window is made in the skull to access and remove your tumor, with the opening being repaired at the end of the surgery.",
        "events": [
            { "eventId": "guid", "timestamp": "2024-01-23T07:30", "type": "Pre Operative", "eventName": "Arrived at operating room", "description": "You arrived at the operating room to begin your procedure" },
            { "eventId": "guid", "timestamp": "2024-01-23T07:45", "type": "Intraoperative", "eventName": "Anesthesia administered", "description": "You were given 11.25 mg of Midazolam as an induction dose, and 1.5 mg per hour to keep you asleep." },
            { "eventId": "guid", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken of the right lateral hemisphere", "image": "ff06505d-786e-45d6-b786-519eece0b4ad.png" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "b6b8e905-65eb-4914-bd7b-0d8303e9f87d.png" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:30", "type": "Intraoperative", "eventName": "Surgery started", "description": "Your surgical procedure started" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Video Clip", "description": "The surgical team began the removal of the lesion", "video": "824f032e-e0b3-4dc9-bb8e-9cf3ce77606a.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Video Clip", "description": "The lesion was removed", "video": "3b14e0bf-3603-4cec-b95a-bcba5673ef27.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "Image - Tumor", "description": "The tumor removed was approximately 1cm in diameter", "image": "40fa4db6-a7d4-4124-b488-191e294188aa.png" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:00", "type": "Intraoperative", "eventName": "Wound closing", "description": "Your surgical has begun closing the wound where they entered" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:15", "type": "Intraoperative", "eventName": "Surgery complete", "description": "Your surgical procedure is now complete" },
            { "eventId": "guid", "timestamp": "2024-01-23T11:00", "type": "Post Operative", "eventName": "Anesthesia reversal", "description": "Anaesthesia drugs have stopped being administered" },
            { "eventId": "guid", "timestamp": "2024-01-23T11:15", "type": "Post Operative", "eventName": "Transfered to PACU", "description": "You we're transferred to the post anesthesia care unit" }
        ]
    },
    "96e978ad-261d-4134-96bd-21ddc2b815a2": {
        "id": "96e978ad-261d-4134-96bd-21ddc2b815a2",
        "procedure": "Right Frontal Craniotomy for Ressection of Meningioma Tumour",
        "duration": 3.75,
        "starttime": "2024-01-25T07:00",
        "description": "You underwent craniotomy, which is a procedure where a temporary window is made in the skull to access and remove your tumor, with the opening being repaired at the end of the surgery.",
        "events": [
            { "eventId": "guid", "timestamp": "2024-01-23T07:00", "type": "Pre Operative", "eventName": "Arrived at operating room", "description": "You arrived at the operating room to begin your procedure" },
            { "eventId": "guid", "timestamp": "2024-01-23T07:45", "type": "Intraoperative", "eventName": "Anesthesia administered", "description": "You were given 11.25 mg of Midazolam as an induction dose, and 1.5 mg per hour to keep you asleep." },
            { "eventId": "guid", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken from the axial point of view of your brain.", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/6cbbe5b3-4654-4f7c-ae80-39d6b987f7ff.png" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken from the coronal point of view of your brain", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/71b4c9fe-9543-4f41-b3f8-0ae2bf8e60a0.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/32625cea-8c52-45b8-915f-2ffb986f0479.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/39b3de47-6d64-4280-aae1-1caecd271447.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:30", "type": "Intraoperative", "eventName": "Surgery started", "description": "Your surgical procedure started" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Video Clip", "description": "The surgical team began the removal of the lesion", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/5c3ef973-d07c-420f-8799-86e108646e46.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Video Clip", "description": "The lesion was removed", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/7aad7f9a-ee5b-4255-8f8f-fc4240b40504.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "Image - Tumor", "description": "The was tumor removed", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/671104d2-eca5-412e-8e30-35e6c6565b30.png" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:00", "type": "Intraoperative", "eventName": "Wound closing", "description": "Your surgical has begun closing the wound where they entered" },
            { "eventId": "guid", "timestamp": "2024-01-23T09:45", "type": "Intraoperative", "eventName": "Video Clip", "description": "The edges of the dura where the tumor was removed are being cauterized using bipolar forceps ", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/b8594f8a-4d77-4c61-9e7b-4c66983995c9.mp4" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:15", "type": "Intraoperative", "eventName": "Surgery complete", "description": "Your surgical procedure is now complete" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:45", "type": "Post Operative", "eventName": "MRI Image - Post Op", "description": "An MRI image was taken of the right lateral hemisphere after the surgical operation", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/c24e8b34-43ab-467d-8fad-0888b40ff07a.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T10:45", "type": "Post Operative", "eventName": "MRI Image - Post Op", "description": "An MRI image was taken of the right lateral hemisphere after the surgical operation", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/2cefecef-37b1-4c3b-b8d3-90f9bd024f10.jpg" },
            { "eventId": "guid", "timestamp": "2024-01-23T11:00", "type": "Post Operative", "eventName": "Anesthesia reversal", "description": "Anaesthesia drugs have stopped being administered" },
            { "eventId": "guid", "timestamp": "2024-01-23T11:15", "type": "Post Operative", "eventName": "Transfered to PACU", "description": "You we're transferred to the post anesthesia care unit" }
        ]
    }
}

export const users: Record<string, User> = {
    "516e0881-4012-49ea-a8f8-276d1b424b02": {
        "id": "516e0881-4012-49ea-a8f8-276d1b424b02",
        "name": "Mary Jones",
        "birthdate": "1960-01-01",
        "cases": ["2fa35c90-4fad-4bc1-886e-cad4cf1f2591"]
        // "cases": ["2fa35c90-4fad-4bc1-886e-cad4cf1f2591", "41114a51-7413-40f0-ab74-75b903a2392b"]
    },
    "a2b3c4d5-6789-0123-4567-89abcdef0123": {
        "id": "a2b3c4d5-6789-0123-4567-89abcdef0123",
        "name": "John Smith",
        "birthdate": "1975-05-15",
        "cases": ["96e978ad-261d-4134-96bd-21ddc2b815a2"]
    },
    "b3c4d5e6-7890-1234-5678-90abcdef1234": {
        "id": "b3c4d5e6-7890-1234-5678-90abcdef1234",
        "name": "Alice Johnson",
        "birthdate": "1985-10-30",
        "cases": []
    }
}


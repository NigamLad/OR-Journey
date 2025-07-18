import type { Operation, User } from "@/types"

export const operations: Record<string, Operation> = {
    "2fa35c90-4fad-4bc1-886e-cad4cf1f2591": {
        "id": "2fa35c90-4fad-4bc1-886e-cad4cf1f2591",
        "procedure": "Surgical Resection of Right Motor Strip Tumor",
        "duration": 3.5,
        "starttime": "2024-01-23T07:30",
        "endtime": "2024-01-23T11:15",
        "skintoskintime": 1.25,
        "description": "You underwent a craniotomy, which is a procedure where a temporary window is made in the skull to access and remove your tumor, with the opening being repaired at the end of the surgery. A lesion in the motor strip can cause weakness or paralysis on the body.",
        "summary": "Your surgery was completed as planned with no unexpected issues arising during the procedure. Your vital signs remained stable throughout, and blood loss was minimal for this type of surgery. The time spent on your operation is typical based on the location, and size of your tumor. Your surgical team removed the entire tumor successfully.",
        "events": [
            { "eventId": "guid_1", "timestamp": "2024-01-23T07:30", "type": "Pre Operative", "eventName": "Arrived at operating room", "description": "You arrived at the operating room to begin your procedure" },
            { "eventId": "guid_2", "timestamp": "2024-01-23T07:45", "type": "Intraoperative", "eventName": "Anesthesia administered", "description": "You were given 11.25 mg of Midazolam as an induction dose, and 1.5 mg per hour to keep you asleep." },
            { "eventId": "guid_3", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken of the right lateral hemisphere", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/8ffd8281-ea1e-4ef0-b5dc-77ca17824af0.jpg", "contentWarning": false },
            { "eventId": "guid_4", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/710e6d1e-d729-4fe6-9adb-dabf725a394a.jpg", "contentWarning": false },
            { "eventId": "guid_5", "timestamp": "2024-01-23T08:30", "type": "Intraoperative", "eventName": "Surgery started", "description": "Your surgical procedure started" },
            { "eventId": "guid_6", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Video Clip", "description": "The surgical team began the removal of the lesion", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/824f032e-e0b3-4dc9-bb8e-9cf3ce77606c.mp4", "forceaverage": 0.5, "contentWarning": true},
            { "eventId": "guid_7", "timestamp": "2024-01-23T09:30", "type": "Intraoperative", "eventName": "Video Clip", "description": "The lesion was removed", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/3b14e0bf-3603-4cec-b95a-bcba5673ef27.mp4", "forceaverage": 0.8, "contentWarning": true },
            { "eventId": "guid_8", "timestamp": "2024-01-23T09:31", "type": "Intraoperative", "eventName": "Image - Tumor", "description": "The tumor removed was approximately 1cm in diameter", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/40fa4db6-a7d4-4124-b488-191e294188aa.png", "contentWarning": true },
            { "eventId": "guid_9", "timestamp": "2024-01-23T09:33", "type": "Intraoperative", "eventName": "Wound closing", "description": "Your surgical team has begun closing the wound where they entered" },
            { "eventId": "guid_10", "timestamp": "2024-01-23T09:45", "type": "Intraoperative", "eventName": "Video Clip", "description": "The skull cap has been replaced", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/28f3febc-b15d-4c33-9006-1d628db4b04e.mp4", "forceaverage": 0.6, "contentWarning": true },
            { "eventId": "guid_11", "timestamp": "2024-01-23T10:15", "type": "Intraoperative", "eventName": "Surgery complete", "description": "Your surgical procedure is now complete" },
            { "eventId": "guid_12", "timestamp": "2024-01-23T10:45", "type": "Post Operative", "eventName": "MRI Image - Post Op", "description": "An MRI image was taken of the right lateral hemisphere after the surgical operation", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/30702c96-3c7f-46de-a134-10f0278db2e0.jpg", "contentWarning": false },
            { "eventId": "guid_13", "timestamp": "2024-01-23T11:00", "type": "Post Operative", "eventName": "Anesthesia reversal", "description": "Anaesthesia drugs have stopped being administered" },
            { "eventId": "guid_14", "timestamp": "2024-01-23T11:15", "type": "Post Operative", "eventName": "Transfered to PACU", "description": "You were transferred to the post anesthesia care unit" }
        ]
    },
    "96e978ad-261d-4134-96bd-21ddc2b815a2": {
        "id": "96e978ad-261d-4134-96bd-21ddc2b815a2",
        "procedure": "Right Frontal Craniotomy for Resection of Parafalcine Meningioma Tumour",
        "duration": 5.5,
        "starttime": "2024-01-25T07:00",
        "endtime": "2024-01-23T12:30",
        "skintoskintime": 2.25,
        "description": "You underwent craniotomy, which is a procedure where a temporary window is made in the skull to access and remove your tumor, with the opening being repaired at the end of the surgery. A parafalcine meningioma is a tumor that grows between the brain's two hemispheres. Although typically benign, it can cause seizures, headaches, and other symptoms.",
        "summary": "Your surgery took longer than expected due to the complexity of the tumor's location and size. During the procedure, there were periods of instability with your vitals, which was managed carefully. Ultimately, your operation was a successful, and the full tumor was removed.",
        "events": [
            { "eventId": "guid_1", "timestamp": "2024-01-23T07:00", "type": "Pre Operative", "eventName": "Arrived at operating room", "description": "You arrived at the operating room to begin your procedure" },
            { "eventId": "guid_2", "timestamp": "2024-01-23T07:45", "type": "Intraoperative", "eventName": "Anesthesia administered", "description": "You were given 11.25 mg of Midazolam as an induction dose, and 1.5 mg per hour to keep you asleep." },
            { "eventId": "guid_3", "timestamp": "2024-01-23T08:00", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken from the axial point of view of your brain.", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/6cbbe5b3-4654-4f7c-ae80-39d6b987f7ff.png", "contentWarning": false },
            { "eventId": "guid_4", "timestamp": "2024-01-23T08:15", "type": "Intraoperative", "eventName": "MRI Image", "description": "An MRI image was taken from the coronal point of view of your brain", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/71b4c9fe-9543-4f41-b3f8-0ae2bf8e60a0.jpg", "contentWarning": false },
            { "eventId": "guid_5", "timestamp": "2024-01-23T08:30", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/32625cea-8c52-45b8-915f-2ffb986f0479.jpg", "contentWarning": false },
            { "eventId": "guid_6", "timestamp": "2024-01-23T08:45", "type": "Intraoperative", "eventName": "MRI Image - Planning", "description": "A lesion was located and annotated by that radiology team", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/39b3de47-6d64-4280-aae1-1caecd271447.jpg", "contentWarning": false },
            { "eventId": "guid_7", "timestamp": "2024-01-23T09:00", "type": "Intraoperative", "eventName": "Surgery started", "description": "Your surgical procedure started" },
            { "eventId": "guid_8", "timestamp": "2024-01-23T09:30", "type": "Intraoperative", "eventName": "Video Clip", "description": "The surgical team began the removal of the lesion", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/5c3ef973-d07c-420f-8799-86e108646e46.mp4", "forceaverage": 0.6, "contentWarning": true },
            { "eventId": "guid_9", "timestamp": "2024-01-23T10:45", "type": "Intraoperative", "eventName": "Video Clip", "description": "The lesion was removed", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/7aad7f9a-ee5b-4255-8f8f-fc4240b40504.mp4", "forceaverage": 0.7, "contentWarning": true },
            { "eventId": "guid_10", "timestamp": "2024-01-23T10:47", "type": "Intraoperative", "eventName": "Image - Tumor", "description": "The was tumor removed", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/671104d2-eca5-412e-8e30-35e6c6565b30.png", "contentWarning": true },
            { "eventId": "guid_11", "timestamp": "2024-01-23T10:50", "type": "Intraoperative", "eventName": "Wound closing", "description": "Your surgical team has begun closing the wound where they entered" },
            { "eventId": "guid_12", "timestamp": "2024-01-23T11:15", "type": "Intraoperative", "eventName": "Video Clip", "description": "The edges of the dura where the tumor was removed are being cauterized using bipolar forceps ", "video": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/videos/b8594f8a-4d77-4c61-9e7b-4c66983995c9.mp4", "forceaverage": 0.5, "contentWarning": true },
            { "eventId": "guid_13", "timestamp": "2024-01-23T11:15", "type": "Intraoperative", "eventName": "Surgery complete", "description": "Your surgical procedure is now complete" },
            { "eventId": "guid_14", "timestamp": "2024-01-23T12:00", "type": "Post Operative", "eventName": "MRI Image - Post Op", "description": "An MRI image was taken of the right lateral hemisphere after the surgical operation", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/c24e8b34-43ab-467d-8fad-0888b40ff07a.jpg", "contentWarning": false },
            { "eventId": "guid_15", "timestamp": "2024-01-23T12:15", "type": "Post Operative", "eventName": "MRI Image - Post Op", "description": "An MRI image was taken of the right lateral hemisphere after the surgical operation", "image": "https://cdn.jsdelivr.net/gh/NigamLad/OR-Journey-CDN@main/images/2cefecef-37b1-4c3b-b8d3-90f9bd024f10.jpg", "contentWarning": false },
            { "eventId": "guid_16", "timestamp": "2024-01-23T12:20", "type": "Post Operative", "eventName": "Anesthesia reversal", "description": "Anaesthesia drugs have stopped being administered" },
            { "eventId": "guid_17", "timestamp": "2024-01-23T12:30", "type": "Post Operative", "eventName": "Transfered to PACU", "description": "You were transferred to the post anesthesia care unit" }
        ]
    }
}

export const users: Record<string, User> = {
    "516e0881-4012-49ea-a8f8-276d1b424b02": {
        "id": "516e0881-4012-49ea-a8f8-276d1b424b02",
        "name": "Mary Jones",
        "birthdate": "1960-01-01",
        "cases": ["2fa35c90-4fad-4bc1-886e-cad4cf1f2591"]
        // "cases": ["2fa35c90-4fad-4bc1-886e-cad4cf1f2591", "96e978ad-261d-4134-96bd-21ddc2b815a2"]
    },
    "a2b3c4d5-6789-0123-4567-89abcdef0123": {
        "id": "a2b3c4d5-6789-0123-4567-89abcdef0123",
        "name": "John Smith",
        "birthdate": "1975-05-15",
        "cases": ["96e978ad-261d-4134-96bd-21ddc2b815a2"]
    }
}


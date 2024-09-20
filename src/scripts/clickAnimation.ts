import { onMounted, onUnmounted } from 'vue'

export function initClickHandler(element: any) {
    try {
        element.classList.add("Clickable")
        addEventListeners(element)
    } catch (error){}
    
}

export function removeClickHandler(element: any) {
    try {
        removeEventListeners(element)
    } catch(error){}
}

function addEventListeners(element: any) {
    // Mouse
    element.addEventListener("mousedown", buttonDown);
    element.addEventListener("mouseup", buttonUp);
    element.addEventListener("mouseout", buttonUp);

    // Touch screens
    element.addEventListener("touchstart", buttonDown);
    element.addEventListener("touchend", buttonUp);
    element.addEventListener("touchmove", buttonUp);
    
}

function removeEventListeners(element: any) {
    // Mouse
    element.removeEventListener("mousedown", buttonDown);
    element.removeEventListener("mouseup", buttonUp);
    element.removeEventListener("mouseout", buttonUp);

    // Touch screens
    element.removeEventListener("touchstart", buttonDown);
    element.removeEventListener("touchend", buttonUp);
    element.removeEventListener("touchmove", buttonUp);
    
}

function buttonDown(event: any) {
    event.currentTarget.classList.add("down");
}

function buttonUp(event: any) {
    event.currentTarget.classList.remove("down");
}
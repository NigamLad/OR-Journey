import { createRouter, createWebHistory } from 'vue-router'
import { state } from '@/config/msalConfig';
import { users } from '@/scripts/simulatedDB';

function lazyLoad(view: string) {
    return () => import(`@/views/${view}.vue`)
}

const routes = [
    {
        path: '/',
        component: lazyLoad("Home"),
    },
    {
        path: '/home',
        component: lazyLoad("Home")
    },
    {
        path: '/login',
        component: lazyLoad("Home")
    },
    {
        path: '/operations',
        component: lazyLoad("Operations")
    },
    {
        path: '/operation/:id',
        component: lazyLoad("Operation"),
        props: true
    },
    {
        path: '/gallery',
        component: lazyLoad("Gallery")
    },
    {
        path: '/planning',
        component: lazyLoad("Planning")
    },
    {
        path: '/prescriptions',
        component: lazyLoad("Prescriptions")
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router

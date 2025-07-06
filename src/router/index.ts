import { createRouter, createWebHistory } from 'vue-router'

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
        path: '/journey/:id',
        component: lazyLoad("Journey"),
        props: true
    },
    {
        path: '/explore/:id',
        component: lazyLoad("Explore"),
        props: true
    },
    {
        path: '/gallery',
        component: lazyLoad("Gallery")
    },
    {
        path: '/procedure/:id',
        component: lazyLoad("Procedure"),
        props: true
    },
    // {
    //     path: '/planning',
    //     component: lazyLoad("Planning")
    // },
    // {
    //     path: '/prescriptions',
    //     component: lazyLoad("Prescriptions")
    // }
]

const router = createRouter({
    history: createWebHistory('/'),
    routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/views/Home.vue';
// import Operations from '@/views/Operations.vue';
// import Operation from '@/views/Operation.vue'
// import Planning from '@/views/Planning.vue';
// import Prescriptions from '@/views/Prescriptions.vue';

function lazyLoad(view: string){
  return() => import(`@/views/${view}.vue`)
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

import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: StartView
    },
      {
      path: '/poll/:id',
      name: 'PollView',
      component: () => import('../views/PollView.vue')
    },
    {
      path: '/lobby/:id',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/create/',
      name: 'CreateView',
      component: () => import('../views/CreateView.vue')
    },
    {
      path: '/result/:id',
      name: 'ResultView',
      component: () => import('../views/ResultView.vue')
    },
    {
      path: '/mode/',
      name: 'ModeView',
      component: () => import('../views/ModeView.vue')

    },
    {
      path: '/city/',
      name: 'CityView',
      component: () => import('../views/CityView.vue')

    },
    {
      path: '/destination/',
      name: 'DestinationView',
      component: () => import('../views/DestinationView.vue')

    }

  ]
})

export default router

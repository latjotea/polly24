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
      path: '/:id/pubList/',
      name: 'PubListView',
      component: () => import('../views/PubListView.vue')

    },

    {
      path: '/:id/Destination/',
      name: 'DestinationView',
      component: () => import('../views/DestinationView.vue')
    },

    {
      path: '/CreateTeam/', //Lägg till id
      name: 'CreateTeamView',
      component: () => import('../views/CreateTeamView.vue')

    }
  ]
})

export default router

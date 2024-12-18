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
      path: '/lobby/:id/:adminId',
      name: 'AdminLobbyView',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/lobby/:id',
      name: 'ParticipantLobbyView',
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
      path: '/:id/mode/',
      name: 'ModeView',
      component: () => import('../views/ModeView.vue')

    },
    {
      path: '/:id/city/',
      name: 'CityView',
      component: () => import('../views/CityView.vue')

    },
    {
      path: '/:id/pubList/',
      name: 'PubListView',
      component: () => import('../views/PubListView.vue')

    },

    {
      path: '/Destination/:id/:team',
      name: 'DestinationView',
      component: () => import('../views/DestinationView.vue')
    },

    {
      path: '/:id/CreateTeam/', 
      name: 'CreateTeamView',
      component: () => import('../views/CreateTeamView.vue')

    },

    {
      path: '/:id/map/',
      name: 'MapView',
      component: () => import('../views/MapView.vue')

    },

    {
      path: '/admincontrol/:id/:adminId',
      name: 'AdminControlView',
      component: () => import('../views/AdminControlView.vue') 

    },

    {
      path: '/task/:id/:adminOrTeamId',
      name: 'TaskView',
      component: () => import('../views/TaskView.vue') 

    },


    {
      path: '/interactivemap/:id/:adminOrTeamId',
      name: 'InteractiveMapView',
      component: () => import('../views/InteractiveMapView.vue') 

    },


  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import StartPage from './routes/StartPage.vue'
import DocumentUnit from './routes/DocumentUnit.vue'
import ErrorNotFound from './routes/ErrorNotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'StartPage',
      component: StartPage,
    },
    {
      path: '/documentunit',
      name: 'DocumentUnit',
      component: DocumentUnit,
    },
    {
      // cf. https://router.vuejs.org/guide/essentials/dynamic-matching.html
      path: '/:pathMatch(.*)*',
      name: 'Error 404 not found',
      component: ErrorNotFound,
    },
  ],
})

export default router

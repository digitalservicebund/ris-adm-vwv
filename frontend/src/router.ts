import { createRouter, createWebHistory } from 'vue-router'
import StartPageVwv from './routes/vwv/documentUnit/StartPageVwv.vue'
import ErrorNotFound from './routes/ErrorNotFound.vue'
import DocumentUnitWrapper from './routes/vwv/documentUnit/[documentNumber].vue'
import AbgabePage from './routes/vwv/documentUnit/[documentNumber]/AbgabePage.vue'
import RubrikenPage from './routes/vwv/documentUnit/[documentNumber]/RubrikenPage.vue'
import FundstellenPage from '@/routes/vwv/documentUnit/[documentNumber]/FundstellenPage.vue'
import New from '@/routes/vwv/documentUnit/new.vue'
import { useAuthentication } from '@/services/auth.ts'
import Forbidden from '@/routes/Forbidden.vue'
import StartPageUli from '@/routes/uli/StartPageUli.vue'
import { roleToHomeRouteMap, USER_ROLES } from '@/config/roles.ts'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'RootRedirect',
      redirect: () => {
        const auth = useAuthentication()
        const userRoles = auth.getRealmRoles()
        // Implementation logic if user has multiple roles will be implemented with RISDEV-9446
        for (const role of userRoles) {
          const routeName = roleToHomeRouteMap[role]
          if (routeName) {
            return { name: routeName }
          }
        }
        // Fallback for users with no matching role or anonymous users
        return { path: '/forbidden' }
      },
    },
    {
      path: '/verwaltungsvorschriften',
      name: 'StartPageVwv',
      component: StartPageVwv,
      meta: {
        requiresRole: USER_ROLES.VWV_USER,
      },
    },
    {
      path: '/documentUnit/new',
      name: 'documentUnit-new',
      component: New,
    },
    {
      path: '/literatur-unselbstaendig',
      name: 'StartPageUli',
      component: StartPageUli,
      meta: {
        requiresRole: USER_ROLES.LIT_BAG_USER,
      },
    },
    {
      path: '/documentUnit/:documentNumber',
      name: 'documentUnit-documentNumber',
      component: DocumentUnitWrapper,
      props: true,
      redirect: { name: 'documentUnit-documentNumber-fundstellen' },
      children: [
        {
          path: '/documentUnit/:documentNumber/fundstellen',
          name: 'documentUnit-documentNumber-fundstellen',
          props: true,
          component: FundstellenPage,
        },
        {
          path: '/documentUnit/:documentNumber/rubriken',
          name: 'documentUnit-documentNumber-rubriken',
          props: true,
          component: RubrikenPage,
        },
        {
          path: '/documentUnit/:documentNumber/abgabe',
          name: 'documentUnit-documentNumber-abgabe',
          props: true,
          component: AbgabePage,
        },
      ],
    },
    {
      // cf. https://router.vuejs.org/guide/essentials/dynamic-matching.html
      path: '/:pathMatch(.*)*',
      name: 'Error 404 not found',
      component: ErrorNotFound,
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: Forbidden,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthentication()
  const requiredRole = to.meta.requiresRole as string | undefined

  if (requiredRole && auth.isAuthenticated()) {
    if (auth.hasRealmRole(requiredRole)) {
      next()
    } else {
      // User does not have the required role, redirect to the 'Forbidden' page
      next({ name: 'Forbidden' })
    }
  } else {
    // bareId / keycloak manages it
    next()
  }
})

export default router

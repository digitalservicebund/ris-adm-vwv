import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import { useAuthentication } from '@/services/auth'
import { roleToHomeRouteMap, USER_ROLES } from '@/config/roles'
import ErrorNotFound from './routes/ErrorNotFound.vue'
import AbgabePage from './routes/vwv/documentUnit/[documentNumber]/AbgabePage.vue'
import RubrikenPage from './routes/vwv/documentUnit/[documentNumber]/RubrikenPage.vue'
import FundstellenPage from '@/routes/vwv/documentUnit/[documentNumber]/FundstellenPage.vue'
import NewDocument from '@/routes/NewDocument.vue'
import Forbidden from '@/routes/Forbidden.vue'
import StartPageTemplate from './routes/StartPage.vue'
import DocumentUnits from './components/document-units/DocumentUnits.vue'
import EditDocument from './routes/EditDocument.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: ROUTE_PATHS.ROOT,
      name: ROUTE_NAMES.ROOT_REDIRECT,
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
        return { path: ROUTE_PATHS.FORBIDDEN }
      },
    },
    {
      path: ROUTE_PATHS.VWV.BASE,
      meta: {
        requiresRole: [USER_ROLES.ADM_USER, USER_ROLES.ADM_VWV_USER],
      },
      children: [
        {
          path: '',
          component: StartPageTemplate,
          props: { title: 'Übersicht Verwaltungsvorschriften' },
          children: [
            {
              path: '',
              name: ROUTE_NAMES.VWV.START_PAGE,
              component: DocumentUnits,
            },
          ],
        },
        {
          path: ROUTE_PATHS.VWV.DOCUMENT_UNIT.NEW,
          name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.NEW,
          component: NewDocument,
        },
        {
          path: ROUTE_PATHS.VWV.DOCUMENT_UNIT.EDIT,
          name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.EDIT,
          component: EditDocument,
          props: true,
          redirect: { name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.FUNDSTELLEN },
          children: [
            {
              path: ROUTE_PATHS.VWV.DOCUMENT_UNIT.FUNDSTELLEN,
              name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.FUNDSTELLEN,
              props: true,
              component: FundstellenPage,
            },
            {
              path: ROUTE_PATHS.VWV.DOCUMENT_UNIT.RUBRIKEN,
              name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN,
              props: true,
              component: RubrikenPage,
            },
            {
              path: ROUTE_PATHS.VWV.DOCUMENT_UNIT.ABGABE,
              name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.ABGABE,
              props: true,
              component: AbgabePage,
            },
          ],
        },
      ],
    },
    {
      path: ROUTE_PATHS.ULI.BASE,
      meta: {
        requiresRole: USER_ROLES.LITERATURE_USER,
      },
      children: [
        {
          path: '',
          name: ROUTE_NAMES.ULI.START_PAGE,
          component: StartPageTemplate,
          props: { title: 'Übersicht Unselbstständige Literatur' },
        },
        {
          path: ROUTE_PATHS.ULI.DOCUMENT_UNIT.NEW,
          name: ROUTE_NAMES.ULI.DOCUMENT_UNIT.NEW,
          component: NewDocument,
        },
        {
          path: ROUTE_PATHS.ULI.DOCUMENT_UNIT.EDIT,
          name: ROUTE_NAMES.ULI.DOCUMENT_UNIT.EDIT,
          component: EditDocument,
          props: true,
          redirect: { name: ROUTE_NAMES.ULI.DOCUMENT_UNIT.RUBRIKEN },
          children: [
            {
              path: ROUTE_PATHS.ULI.DOCUMENT_UNIT.RUBRIKEN,
              name: ROUTE_NAMES.ULI.DOCUMENT_UNIT.RUBRIKEN,
              component: { template: '<div />' },
            },
          ],
        },
      ],
    },
    {
      // cf. https://router.vuejs.org/guide/essentials/dynamic-matching.html
      path: '/:pathMatch(.*)*',
      name: ROUTE_NAMES.NOT_FOUND,
      component: ErrorNotFound,
    },
    {
      path: ROUTE_PATHS.FORBIDDEN,
      name: ROUTE_NAMES.FORBIDDEN,
      component: Forbidden,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthentication()
  const requiredRoles = to.meta.requiresRole as string[] | undefined

  if (requiredRoles && requiredRoles.length > 0 && auth.isAuthenticated()) {
    const hasRequiredRole = requiredRoles.some((role) => auth.hasRealmRole(role))

    if (hasRequiredRole) {
      next()
    } else {
      // User does not have the required role, redirect to the 'Forbidden' page
      next({ name: ROUTE_NAMES.FORBIDDEN })
    }
  } else {
    // bareId / keycloak manages it
    next()
  }
})

export default router
